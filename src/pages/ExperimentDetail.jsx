import { useState, useCallback, useRef } from "react";
import {
    ArrowLeft,
    CheckCircle,
    XCircle,
    Flame,
    TrendingUp,
    Calendar,
    FileText,
    RotateCcw,
    Trash2,
    Share2,
    ChevronDown,
    ChevronUp,
} from "lucide-react";
import { useExperiments } from "../hooks/useExperiments";
import {
    getExperimentProgress,
    getSuccessRate,
    getCurrentStreak,
    getLongestStreak,
    getCategoryById,
    getDifficultyById,
    today,
    getLogForDate,
    getInsights,
    formatDate,
    formatDateShort,
    addDays,
    getStreakBadges,
} from "../utils/experiments";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    Cell,
} from "recharts";
import html2canvas from "html2canvas";

export default function ExperimentDetail({ experimentId, onBack }) {
    const { getExperiment, addLog, restartExperiment, deleteExperiment } =
        useExperiments();
    const experiment = getExperiment(experimentId);

    const [noteText, setNoteText] = useState("");
    const [showNoteInput, setShowNoteInput] = useState(false);
    const [pendingStatus, setPendingStatus] = useState(null);
    const [animClass, setAnimClass] = useState("");
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [activeTab, setActiveTab] = useState("timeline");
    const shareCardRef = useRef(null);

    if (!experiment) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <p style={{ color: "var(--text-muted)" }}>
                    Experiment not found
                </p>
            </div>
        );
    }

    const { daysCompleted, daysTotal, daysRemaining, progress, endDate } =
        getExperimentProgress(experiment);
    const successRate = getSuccessRate(experiment);
    const streak = getCurrentStreak(experiment);
    const longestStreak = getLongestStreak(experiment);
    const category = getCategoryById(experiment.category);
    const difficulty = getDifficultyById(experiment.difficulty);
    const todayLog = getLogForDate(experiment, today());
    const insights = getInsights(experiment);
    const badges = getStreakBadges(streak);
    const successLogs = experiment.logs.filter(
        (l) => l.status === "success",
    ).length;
    const failLogs = experiment.logs.filter(
        (l) => l.status === "failed",
    ).length;

    const handleLogWithNote = async (status) => {
        setPendingStatus(status);
        if (status === "success") {
            setAnimClass("animate-success-pulse");
            setTimeout(() => setAnimClass(""), 800);
        }
        if (!showNoteInput) {
            await addLog(experimentId, { status, date: today(), note: "" });
        } else {
            await addLog(experimentId, {
                status,
                date: today(),
                note: noteText,
            });
            setNoteText("");
            setShowNoteInput(false);
        }
        setPendingStatus(null);
    };

    const handleDelete = async () => {
        await deleteExperiment(experimentId);
        onBack();
    };

    const handleRestart = async () => {
        await restartExperiment(experimentId);
    };

    // Build chart data from last 14 days
    const chartData = Array.from(
        { length: Math.min(daysCompleted, 14) },
        (_, i) => {
            const dateStr = addDays(experiment.startDate, i);
            const log = getLogForDate(experiment, dateStr);
            return {
                day: i + 1,
                status: log ? (log.status === "success" ? 1 : -1) : 0,
                label: formatDateShort(dateStr),
            };
        },
    );

    // Calendar grid
    const calendarDays = Array.from({ length: daysTotal }, (_, i) => {
        const dateStr = addDays(experiment.startDate, i);
        const log = getLogForDate(experiment, dateStr);
        const isToday = dateStr === today();
        const isPast = dateStr < today();
        return { day: i + 1, dateStr, log, isToday, isPast };
    });

    const handleShare = async () => {
        if (!shareCardRef.current) return;
        try {
            const canvas = await html2canvas(shareCardRef.current, {
                backgroundColor: "#1e1e28",
                scale: 2,
            });
            const url = canvas.toDataURL("image/png");
            const a = document.createElement("a");
            a.href = url;
            a.download = `${experiment.title.replace(/\s+/g, "_")}_result.png`;
            a.click();
        } catch (e) {
            console.error("Share failed:", e);
        }
    };

    return (
        <div className="flex-1" style={{ paddingBottom: 100 }}>
            {/* Header */}
            <div className="px-5 pt-5 pb-3">
                <div className="flex items-center gap-3 mb-4">
                    <button
                        onClick={onBack}
                        className="p-2 rounded-xl"
                        style={{ background: "var(--bg-card)" }}
                    >
                        <ArrowLeft
                            size={18}
                            style={{ color: "var(--text-secondary)" }}
                        />
                    </button>
                    <span
                        className="text-xs font-mono"
                        style={{
                            color: "var(--text-muted)",
                            fontFamily: "DM Mono",
                        }}
                    >
                        EXPERIMENT DETAIL
                    </span>
                </div>

                {/* Title card */}
                <div
                    className={`rounded-2xl p-4 relative overflow-hidden ${animClass}`}
                    style={{
                        background: "var(--bg-card)",
                        border: "1px solid var(--bg-border)",
                    }}
                >
                    <div
                        className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl"
                        style={{
                            background: `linear-gradient(90deg, ${category.color}, ${category.color}44)`,
                        }}
                    />
                    <div className="flex items-start gap-3">
                        <div className="text-3xl">{category.emoji}</div>
                        <div className="flex-1">
                            <h1
                                className="text-xl font-extrabold leading-tight"
                                style={{ fontFamily: "Syne" }}
                            >
                                {experiment.title}
                            </h1>
                            {experiment.description && (
                                <p
                                    className="text-sm mt-1"
                                    style={{ color: "var(--text-secondary)" }}
                                >
                                    {experiment.description}
                                </p>
                            )}
                            <div className="flex items-center gap-2 mt-2 flex-wrap">
                                <span
                                    className="text-xs px-2 py-0.5 rounded-full font-mono"
                                    style={{
                                        background: `${category.color}18`,
                                        color: category.color,
                                        fontFamily: "DM Mono",
                                    }}
                                >
                                    {category.label}
                                </span>
                                <span
                                    className="text-xs px-2 py-0.5 rounded-full font-mono"
                                    style={{
                                        background: `${difficulty.color}18`,
                                        color: difficulty.color,
                                        fontFamily: "DM Mono",
                                    }}
                                >
                                    {difficulty.label}
                                </span>
                                <span
                                    className="text-xs"
                                    style={{
                                        color: "var(--text-muted)",
                                        fontFamily: "DM Mono",
                                    }}
                                >
                                    Started {formatDate(experiment.startDate)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Progress */}
                    <div className="mt-4">
                        <div className="flex justify-between mb-1.5">
                            <span
                                className="text-sm font-mono"
                                style={{
                                    color: "var(--text-secondary)",
                                    fontFamily: "DM Mono",
                                }}
                            >
                                Day {daysCompleted} of {daysTotal}
                            </span>
                            <span
                                className="text-sm font-bold font-mono"
                                style={{
                                    color: category.color,
                                    fontFamily: "DM Mono",
                                }}
                            >
                                {Math.round(progress)}%
                            </span>
                        </div>
                        <div
                            className="w-full h-2 rounded-full overflow-hidden"
                            style={{ background: "var(--bg-border)" }}
                        >
                            <div
                                className="h-full rounded-full transition-all duration-1000"
                                style={{
                                    width: `${progress}%`,
                                    background: `linear-gradient(90deg, ${category.color}, ${category.color}88)`,
                                }}
                            />
                        </div>
                        {experiment.status === "active" && (
                            <p
                                className="text-xs mt-1.5"
                                style={{
                                    color: "var(--text-muted)",
                                    fontFamily: "DM Mono",
                                }}
                            >
                                {daysRemaining > 0
                                    ? `${daysRemaining} days remaining — ends ${formatDate(endDate)}`
                                    : "Final day!"}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Stats row */}
            <div className="px-5 mb-4">
                <div className="grid grid-cols-4 gap-2">
                    {[
                        {
                            label: "Success",
                            value: `${successRate}%`,
                            color: "var(--accent-green)",
                        },
                        {
                            label: "Streak",
                            value: `${streak}🔥`,
                            color: "var(--accent-orange)",
                        },
                        {
                            label: "Best",
                            value: `${longestStreak}d`,
                            color: "var(--accent-cyan)",
                        },
                        {
                            label: "Logs",
                            value: experiment.logs.length,
                            color: "var(--accent-purple)",
                        },
                    ].map(({ label, value, color }) => (
                        <div
                            key={label}
                            className="rounded-2xl p-3 text-center"
                            style={{
                                background: "var(--bg-card)",
                                border: "1px solid var(--bg-border)",
                            }}
                        >
                            <div
                                className="text-base font-extrabold"
                                style={{
                                    color,
                                    fontFamily: "Syne",
                                    lineHeight: 1.2,
                                }}
                            >
                                {value}
                            </div>
                            <div
                                className="text-[10px] mt-0.5"
                                style={{
                                    color: "var(--text-muted)",
                                    fontFamily: "DM Mono",
                                }}
                            >
                                {label}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Badges */}
            {badges.length > 0 && (
                <div className="px-5 mb-4">
                    <div className="flex gap-2 overflow-x-auto pb-1">
                        {badges.map((b, i) => (
                            <div
                                key={i}
                                className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl"
                                style={{
                                    background: "rgba(255,107,53,0.12)",
                                    border: "1px solid rgba(255,107,53,0.2)",
                                }}
                            >
                                <span className="text-lg">{b.emoji}</span>
                                <span
                                    className="text-xs font-mono font-bold"
                                    style={{
                                        color: "var(--accent-orange)",
                                        fontFamily: "DM Mono",
                                    }}
                                >
                                    {b.label}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Daily check-in */}
            {experiment.status === "active" && (
                <div className="px-5 mb-4">
                    <div
                        className="rounded-2xl p-4"
                        style={{
                            background: "var(--bg-card)",
                            border: "1px solid var(--bg-border)",
                        }}
                    >
                        <p
                            className="text-xs font-mono font-bold mb-3"
                            style={{
                                color: "var(--text-muted)",
                                fontFamily: "DM Mono",
                            }}
                        >
                            TODAY'S CHECK-IN —{" "}
                            {new Date().toLocaleDateString("en-US", {
                                weekday: "short",
                                month: "short",
                                day: "numeric",
                            })}
                        </p>

                        {todayLog ? (
                            <div className="flex items-center gap-2 py-2">
                                <span className="text-2xl">
                                    {todayLog.status === "success"
                                        ? "✅"
                                        : "❌"}
                                </span>
                                <div>
                                    <p
                                        className="font-semibold"
                                        style={{
                                            color:
                                                todayLog.status === "success"
                                                    ? "var(--accent-green)"
                                                    : "var(--accent-red)",
                                        }}
                                    >
                                        {todayLog.status === "success"
                                            ? "Marked as success!"
                                            : "Marked as failed"}
                                    </p>
                                    {todayLog.note && (
                                        <p
                                            className="text-sm mt-0.5"
                                            style={{
                                                color: "var(--text-secondary)",
                                            }}
                                        >
                                            "{todayLog.note}"
                                        </p>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="flex gap-3 mb-3">
                                    <button
                                        onClick={() =>
                                            handleLogWithNote("failed")
                                        }
                                        className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all active:scale-95"
                                        style={{
                                            background: "rgba(255,61,113,0.12)",
                                            color: "var(--accent-red)",
                                            border: "1.5px solid rgba(255,61,113,0.3)",
                                            fontFamily: "Syne",
                                        }}
                                    >
                                        <XCircle size={18} /> Failed
                                    </button>
                                    <button
                                        onClick={() =>
                                            handleLogWithNote("success")
                                        }
                                        className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all active:scale-95"
                                        style={{
                                            background: "rgba(0,255,157,0.12)",
                                            color: "var(--accent-green)",
                                            border: "1.5px solid rgba(0,255,157,0.3)",
                                            fontFamily: "Syne",
                                        }}
                                    >
                                        <CheckCircle size={18} /> Success
                                    </button>
                                </div>
                                <button
                                    onClick={() =>
                                        setShowNoteInput(!showNoteInput)
                                    }
                                    className="text-xs flex items-center gap-1"
                                    style={{
                                        color: "var(--text-muted)",
                                        fontFamily: "DM Mono",
                                    }}
                                >
                                    <FileText size={12} />{" "}
                                    {showNoteInput ? "Hide note" : "Add a note"}
                                </button>
                                {showNoteInput && (
                                    <textarea
                                        className="lab-input mt-2 resize-none text-sm"
                                        rows={2}
                                        placeholder="How did it go today?"
                                        value={noteText}
                                        onChange={(e) =>
                                            setNoteText(e.target.value)
                                        }
                                    />
                                )}
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Insights */}
            {insights.length > 0 && (
                <div className="px-5 mb-4">
                    <p
                        className="text-xs font-mono font-bold mb-2"
                        style={{
                            color: "var(--text-muted)",
                            fontFamily: "DM Mono",
                        }}
                    >
                        🧠 INSIGHTS
                    </p>
                    <div className="space-y-2">
                        {insights.map((ins, i) => (
                            <div
                                key={i}
                                className="flex items-center gap-3 p-3 rounded-xl"
                                style={{
                                    background:
                                        ins.type === "positive"
                                            ? "rgba(0,255,157,0.06)"
                                            : "rgba(255,214,0,0.06)",
                                    border: `1px solid ${ins.type === "positive" ? "rgba(0,255,157,0.15)" : "rgba(255,214,0,0.15)"}`,
                                }}
                            >
                                <span className="text-xl">{ins.icon}</span>
                                <p
                                    className="text-sm"
                                    style={{ color: "var(--text-secondary)" }}
                                >
                                    {ins.text}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Tabs */}
            <div className="px-5 mb-4">
                <div
                    className="flex gap-1 p-1 rounded-xl"
                    style={{
                        background: "var(--bg-card)",
                        border: "1px solid var(--bg-border)",
                    }}
                >
                    {[
                        { id: "timeline", label: "📅 Timeline" },
                        { id: "chart", label: "📊 Chart" },
                        { id: "notes", label: "📝 Notes" },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className="flex-1 py-2 rounded-lg text-xs font-semibold transition-all"
                            style={{
                                background:
                                    activeTab === tab.id
                                        ? "var(--bg-elevated)"
                                        : "transparent",
                                color:
                                    activeTab === tab.id
                                        ? "var(--text-primary)"
                                        : "var(--text-muted)",
                                fontFamily: "DM Mono",
                            }}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tab content */}
            {activeTab === "timeline" && (
                <div className="px-5 mb-4">
                    <div
                        className="rounded-2xl p-4"
                        style={{
                            background: "var(--bg-card)",
                            border: "1px solid var(--bg-border)",
                        }}
                    >
                        <div className="grid grid-cols-7 gap-1.5">
                            {calendarDays.map(
                                ({ day, dateStr, log, isToday, isPast }) => {
                                    let bg = "var(--bg-elevated)";
                                    let color = "var(--text-muted)";
                                    if (log?.status === "success") {
                                        bg = "rgba(0,255,157,0.2)";
                                        color = "var(--accent-green)";
                                    }
                                    if (log?.status === "failed") {
                                        bg = "rgba(255,61,113,0.2)";
                                        color = "var(--accent-red)";
                                    }
                                    return (
                                        <div
                                            key={day}
                                            className="aspect-square rounded-lg flex items-center justify-center relative text-xs font-mono font-bold transition-all"
                                            style={{
                                                background: bg,
                                                color,
                                                border: isToday
                                                    ? "1.5px solid var(--accent-cyan)"
                                                    : "1px solid transparent",
                                                fontFamily: "DM Mono",
                                                fontSize: 11,
                                            }}
                                            title={dateStr}
                                        >
                                            {log?.status === "success"
                                                ? "✓"
                                                : log?.status === "failed"
                                                  ? "✗"
                                                  : day}
                                        </div>
                                    );
                                },
                            )}
                        </div>
                        <div className="flex items-center gap-4 mt-3 justify-center">
                            {[
                                {
                                    color: "rgba(0,255,157,0.2)",
                                    textColor: "var(--accent-green)",
                                    label: `✓ ${successLogs} Success`,
                                },
                                {
                                    color: "rgba(255,61,113,0.2)",
                                    textColor: "var(--accent-red)",
                                    label: `✗ ${failLogs} Failed`,
                                },
                                {
                                    color: "var(--bg-elevated)",
                                    textColor: "var(--text-muted)",
                                    label: `— ${daysTotal - experiment.logs.length} Pending`,
                                },
                            ].map(({ color, textColor, label }) => (
                                <div
                                    key={label}
                                    className="flex items-center gap-1"
                                >
                                    <div
                                        className="w-3 h-3 rounded"
                                        style={{ background: color }}
                                    />
                                    <span
                                        className="text-[10px] font-mono"
                                        style={{
                                            color: textColor,
                                            fontFamily: "DM Mono",
                                        }}
                                    >
                                        {label}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {activeTab === "chart" && chartData.length > 0 && (
                <div className="px-5 mb-4">
                    <div
                        className="rounded-2xl p-4"
                        style={{
                            background: "var(--bg-card)",
                            border: "1px solid var(--bg-border)",
                        }}
                    >
                        <p
                            className="text-xs font-mono mb-3"
                            style={{
                                color: "var(--text-muted)",
                                fontFamily: "DM Mono",
                            }}
                        >
                            DAILY PERFORMANCE
                        </p>
                        <ResponsiveContainer width="100%" height={140}>
                            <BarChart data={chartData} barSize={12}>
                                <XAxis
                                    dataKey="day"
                                    tick={{
                                        fontSize: 10,
                                        fill: "var(--text-muted)",
                                        fontFamily: "DM Mono",
                                    }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <Tooltip
                                    contentStyle={{
                                        background: "var(--bg-elevated)",
                                        border: "1px solid var(--bg-border)",
                                        borderRadius: 8,
                                        fontSize: 12,
                                        fontFamily: "DM Mono",
                                    }}
                                    formatter={(val) => [
                                        val === 1
                                            ? "✅ Success"
                                            : val === -1
                                              ? "❌ Failed"
                                              : "— No log",
                                        "",
                                    ]}
                                />
                                <Bar dataKey="status" radius={[4, 4, 0, 0]}>
                                    {chartData.map((entry, idx) => (
                                        <Cell
                                            key={idx}
                                            fill={
                                                entry.status === 1
                                                    ? "var(--accent-green)"
                                                    : entry.status === -1
                                                      ? "var(--accent-red)"
                                                      : "var(--bg-border)"
                                            }
                                        />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            {activeTab === "notes" && (
                <div className="px-5 mb-4">
                    <div
                        className="rounded-2xl overflow-hidden"
                        style={{
                            background: "var(--bg-card)",
                            border: "1px solid var(--bg-border)",
                        }}
                    >
                        {experiment.logs.filter((l) => l.note).length === 0 ? (
                            <div className="p-6 text-center">
                                <p
                                    className="text-sm"
                                    style={{ color: "var(--text-muted)" }}
                                >
                                    No notes yet. Add notes during check-ins.
                                </p>
                            </div>
                        ) : (
                            <div
                                className="divide-y"
                                style={{ borderColor: "var(--bg-border)" }}
                            >
                                {[...experiment.logs]
                                    .filter((l) => l.note)
                                    .sort((a, b) =>
                                        b.date.localeCompare(a.date),
                                    )
                                    .map((log, i) => (
                                        <div key={i} className="p-4">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span>
                                                    {log.status === "success"
                                                        ? "✅"
                                                        : "❌"}
                                                </span>
                                                <span
                                                    className="text-xs font-mono"
                                                    style={{
                                                        color: "var(--text-muted)",
                                                        fontFamily: "DM Mono",
                                                    }}
                                                >
                                                    {formatDate(log.date)}
                                                </span>
                                            </div>
                                            <p
                                                className="text-sm"
                                                style={{
                                                    color: "var(--text-secondary)",
                                                }}
                                            >
                                                {log.note}
                                            </p>
                                        </div>
                                    ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Completion summary */}
            {(experiment.status === "completed" ||
                experiment.status === "failed") && (
                <div className="px-5 mb-4">
                    <div
                        ref={shareCardRef}
                        className="rounded-2xl p-5 relative overflow-hidden"
                        style={{
                            background:
                                "linear-gradient(135deg, var(--bg-card), var(--bg-elevated))",
                            border: `1px solid ${experiment.status === "completed" ? "rgba(0,255,157,0.3)" : "rgba(255,61,113,0.3)"}`,
                        }}
                    >
                        <div className="text-center mb-4">
                            <div className="text-4xl mb-2">
                                {experiment.status === "completed"
                                    ? "🏆"
                                    : "💀"}
                            </div>
                            <h3
                                className="text-lg font-bold"
                                style={{ fontFamily: "Syne" }}
                            >
                                {experiment.status === "completed"
                                    ? "Experiment Complete!"
                                    : "Experiment Ended"}
                            </h3>
                            <p
                                className="text-sm mt-1"
                                style={{ color: "var(--text-secondary)" }}
                            >
                                {experiment.title}
                            </p>
                        </div>
                        <div className="grid grid-cols-3 gap-3 mb-4">
                            {[
                                {
                                    label: "Success",
                                    value: successLogs,
                                    color: "var(--accent-green)",
                                },
                                {
                                    label: "Failed",
                                    value: failLogs,
                                    color: "var(--accent-red)",
                                },
                                {
                                    label: "Rate",
                                    value: `${successRate}%`,
                                    color: "var(--accent-cyan)",
                                },
                            ].map(({ label, value, color }) => (
                                <div
                                    key={label}
                                    className="text-center p-2 rounded-xl"
                                    style={{
                                        background: "rgba(255,255,255,0.04)",
                                    }}
                                >
                                    <div
                                        className="text-xl font-bold"
                                        style={{ color, fontFamily: "Syne" }}
                                    >
                                        {value}
                                    </div>
                                    <div
                                        className="text-xs"
                                        style={{
                                            color: "var(--text-muted)",
                                            fontFamily: "DM Mono",
                                        }}
                                    >
                                        {label}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div
                            className="text-center text-xs font-mono"
                            style={{
                                color: "var(--text-muted)",
                                fontFamily: "DM Mono",
                            }}
                        >
                            ⚗️ LabTracker — Personal Experiment Lab
                        </div>
                    </div>
                    <div className="flex gap-3 mt-3">
                        <button
                            onClick={handleShare}
                            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all active:scale-95"
                            style={{
                                background: "var(--bg-card)",
                                border: "1px solid var(--bg-border)",
                                color: "var(--text-primary)",
                                fontFamily: "Syne",
                            }}
                        >
                            <Share2 size={16} /> Share Result
                        </button>
                        <button
                            onClick={handleRestart}
                            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all active:scale-95"
                            style={{
                                background: "rgba(0,229,255,0.12)",
                                border: "1px solid rgba(0,229,255,0.2)",
                                color: "var(--accent-cyan)",
                                fontFamily: "Syne",
                            }}
                        >
                            <RotateCcw size={16} /> Restart
                        </button>
                    </div>
                </div>
            )}

            {/* Danger zone */}
            <div className="px-5 mb-4">
                {!showDeleteConfirm ? (
                    <button
                        onClick={() => setShowDeleteConfirm(true)}
                        className="w-full py-3 rounded-xl text-sm font-semibold transition-all active:scale-95 flex items-center justify-center gap-2"
                        style={{
                            color: "var(--accent-red)",
                            background: "rgba(255,61,113,0.08)",
                            border: "1px solid rgba(255,61,113,0.2)",
                            fontFamily: "DM Mono",
                        }}
                    >
                        <Trash2 size={14} /> Delete Experiment
                    </button>
                ) : (
                    <div
                        className="rounded-xl p-4"
                        style={{
                            background: "rgba(255,61,113,0.1)",
                            border: "1px solid rgba(255,61,113,0.3)",
                        }}
                    >
                        <p
                            className="text-sm mb-3 text-center"
                            style={{ color: "var(--text-primary)" }}
                        >
                            Delete "{experiment.title}"? This cannot be undone.
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                className="flex-1 py-2.5 rounded-lg text-sm font-semibold"
                                style={{
                                    background: "var(--bg-card)",
                                    color: "var(--text-secondary)",
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                className="flex-1 py-2.5 rounded-lg text-sm font-semibold"
                                style={{
                                    background: "var(--accent-red)",
                                    color: "white",
                                }}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
