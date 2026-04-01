import { useState, useMemo } from "react";
import {
    Plus,
    CheckCircle,
    XCircle,
    Zap,
    Award,
    TrendingUp,
    FlaskConical,
} from "lucide-react";
import { useExperiments } from "../hooks/useExperiments";
import ExperimentCard from "../components/ExperimentCard";
import CreateExperimentModal from "../components/CreateExperimentModal";
import { getSuccessRate, getCurrentStreak, today } from "../utils/experiments";

export default function TodayPage({ onNavigateToDetail }) {
    const {
        experiments,
        activeExperiments,
        loading,
        createExperiment,
        addLog,
    } = useExperiments();
    const [showCreate, setShowCreate] = useState(false);
    const [toastMsg, setToastMsg] = useState("");

    const showToast = (msg) => {
        setToastMsg(msg);
        setTimeout(() => setToastMsg(""), 2500);
    };

    const stats = useMemo(() => {
        const total = experiments.length;
        const active = activeExperiments.length;
        const completed = experiments.filter(
            (e) => e.status === "completed",
        ).length;
        const totalLogs = experiments.flatMap((e) => e.logs || []);
        const successLogs = totalLogs.filter((l) => l.status === "success");
        const overallRate =
            totalLogs.length > 0
                ? Math.round((successLogs.length / totalLogs.length) * 100)
                : 0;
        return { total, active, completed, overallRate };
    }, [experiments, activeExperiments]);

    const pendingToday = useMemo(
        () =>
            activeExperiments.filter(
                (e) => !e.logs?.find((l) => l.date === today()),
            ),
        [activeExperiments],
    );

    const loggedToday = useMemo(
        () =>
            activeExperiments.filter((e) =>
                e.logs?.find((l) => l.date === today()),
            ),
        [activeExperiments],
    );

    const handleQuickLog = async (id, status) => {
        await addLog(id, { status, date: today(), note: "" });
        showToast(
            status === "success"
                ? "✅ Logged as success!"
                : "❌ Logged as failed",
        );
    };

    if (loading) {
        return (
            <div
                className="flex items-center justify-center"
                style={{ height: "60vh" }}
            >
                <div className="text-center space-y-3">
                    <div className="text-4xl animate-float">⚗️</div>
                    <p
                        className="text-sm"
                        style={{
                            color: "var(--text-muted)",
                            fontFamily: "DM Mono",
                        }}
                    >
                        Loading your lab...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div style={{ paddingBottom: 100 }}>
            {/* Sticky header */}
            <div
                className="sticky top-0 z-10 px-5 pt-6 pb-4"
                style={{
                    background: "var(--bg-base)",
                    borderBottom: "1px solid var(--bg-border)",
                }}
            >
                <div className="flex items-start justify-between mb-4">
                    <div>
                        <p
                            className="text-xs font-mono mb-1"
                            style={{
                                color: "var(--text-muted)",
                                fontFamily: "DM Mono",
                            }}
                        >
                            {new Date().toLocaleDateString("en-US", {
                                weekday: "long",
                                month: "long",
                                day: "numeric",
                            })}
                        </p>
                        <h1
                            className="text-2xl font-extrabold gradient-text-cyan"
                            style={{ fontFamily: "Syne" }}
                        >
                            Your Lab 🔬
                        </h1>
                        <p
                            className="text-sm mt-0.5"
                            style={{ color: "var(--text-secondary)" }}
                        >
                            {pendingToday.length > 0
                                ? `${pendingToday.length} check-in${pendingToday.length > 1 ? "s" : ""} pending today`
                                : activeExperiments.length > 0
                                  ? "✅ All done for today!"
                                  : "No active experiments"}
                        </p>
                    </div>
                    <button
                        onClick={() => setShowCreate(true)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold text-sm transition-all active:scale-95"
                        style={{
                            background:
                                "linear-gradient(135deg, var(--accent-cyan), var(--accent-green))",
                            color: "#0a0a0f",
                            fontFamily: "Syne",
                        }}
                    >
                        <Plus size={16} strokeWidth={2.5} /> New
                    </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-4 gap-2">
                    {[
                        {
                            label: "Total",
                            value: stats.total,
                            icon: FlaskConical,
                            color: "var(--accent-cyan)",
                        },
                        {
                            label: "Active",
                            value: stats.active,
                            icon: Zap,
                            color: "var(--accent-yellow)",
                        },
                        {
                            label: "Done",
                            value: stats.completed,
                            icon: Award,
                            color: "var(--accent-green)",
                        },
                        {
                            label: "Rate",
                            value: `${stats.overallRate}%`,
                            icon: TrendingUp,
                            color: "var(--accent-purple)",
                        },
                    ].map(({ label, value, icon: Icon, color }) => (
                        <div
                            key={label}
                            className="rounded-2xl p-3 text-center"
                            style={{
                                background: "var(--bg-card)",
                                border: "1px solid var(--bg-border)",
                            }}
                        >
                            <Icon
                                size={16}
                                style={{ color, margin: "0 auto 4px" }}
                            />
                            <div
                                className="text-lg font-extrabold"
                                style={{
                                    color,
                                    fontFamily: "Syne",
                                    lineHeight: 1,
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

            {/* Pending check-ins */}
            {pendingToday.length > 0 && (
                <div className="px-5 mt-5 mb-2">
                    <p
                        className="text-xs font-mono font-bold mb-3"
                        style={{
                            color: "var(--accent-yellow)",
                            fontFamily: "DM Mono",
                        }}
                    >
                        ⏰ PENDING TODAY ({pendingToday.length})
                    </p>
                    <div className="space-y-3">
                        {pendingToday.map((exp) => (
                            <ExperimentCard
                                key={exp.id}
                                experiment={exp}
                                onTap={onNavigateToDetail}
                                onQuickLog={handleQuickLog}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Logged today */}
            {loggedToday.length > 0 && (
                <div className="px-5 mt-5 mb-2">
                    <p
                        className="text-xs font-mono font-bold mb-3"
                        style={{
                            color: "var(--text-muted)",
                            fontFamily: "DM Mono",
                        }}
                    >
                        ✅ LOGGED TODAY ({loggedToday.length})
                    </p>
                    <div className="space-y-3">
                        {loggedToday.map((exp) => (
                            <ExperimentCard
                                key={exp.id}
                                experiment={exp}
                                onTap={onNavigateToDetail}
                                onQuickLog={handleQuickLog}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Empty state */}
            {experiments.length === 0 && (
                <div className="flex flex-col items-center justify-center px-5 pt-16 text-center">
                    <div className="text-6xl mb-6 animate-float">⚗️</div>
                    <h2
                        className="text-xl font-bold mb-2"
                        style={{ fontFamily: "Syne" }}
                    >
                        Your lab is empty
                    </h2>
                    <p
                        className="text-sm mb-8 max-w-xs"
                        style={{ color: "var(--text-secondary)" }}
                    >
                        Start your first self-improvement experiment.
                    </p>
                    <button
                        onClick={() => setShowCreate(true)}
                        className="px-6 py-3 rounded-2xl font-bold text-base transition-all active:scale-95"
                        style={{
                            background:
                                "linear-gradient(135deg, var(--accent-cyan), var(--accent-green))",
                            color: "#0a0a0f",
                            fontFamily: "Syne",
                        }}
                    >
                        🚀 Launch First Experiment
                    </button>
                </div>
            )}

            {toastMsg && (
                <div
                    className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-2xl text-sm font-semibold animate-scale-in shadow-2xl"
                    style={{
                        background: "var(--bg-card)",
                        border: "1px solid var(--bg-border)",
                        color: "var(--text-primary)",
                        fontFamily: "DM Mono",
                        whiteSpace: "nowrap",
                    }}
                >
                    {toastMsg}
                </div>
            )}

            {showCreate && (
                <CreateExperimentModal
                    onClose={() => setShowCreate(false)}
                    onCreate={createExperiment}
                />
            )}
        </div>
    );
}
