import { useMemo } from "react";
import { useExperiments } from "../hooks/useExperiments";
import {
    getSuccessRate,
    getCurrentStreak,
    getCategoryById,
    getLongestStreak,
} from "../utils/experiments";
import {
    BarChart,
    Bar,
    XAxis,
    Tooltip,
    ResponsiveContainer,
    Cell,
    RadialBarChart,
    RadialBar,
    PieChart,
    Pie,
} from "recharts";

export default function InsightsPage({ onNavigateToDetail }) {
    const { experiments, loading } = useExperiments();

    const stats = useMemo(() => {
        if (!experiments.length) return null;

        const allLogs = experiments.flatMap((e) => e.logs || []);
        const successLogs = allLogs.filter((l) => l.status === "success");
        const failLogs = allLogs.filter((l) => l.status === "failed");
        const overallRate = allLogs.length
            ? Math.round((successLogs.length / allLogs.length) * 100)
            : 0;

        // By category
        const catStats = {};
        experiments.forEach((exp) => {
            const cat = exp.category;
            if (!catStats[cat]) catStats[cat] = { success: 0, total: 0 };
            exp.logs?.forEach((l) => {
                catStats[cat].total++;
                if (l.status === "success") catStats[cat].success++;
            });
        });
        const categoryData = Object.entries(catStats)
            .map(([id, s]) => {
                const cat = getCategoryById(id);
                return {
                    id,
                    name: cat.label,
                    emoji: cat.emoji,
                    color: cat.color,
                    rate: s.total ? Math.round((s.success / s.total) * 100) : 0,
                    total: s.total,
                };
            })
            .filter((c) => c.total > 0)
            .sort((a, b) => b.rate - a.rate);

        // By day of week
        const dowStats = Array(7)
            .fill(null)
            .map((_, i) => ({
                day: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][i],
                success: 0,
                total: 0,
            }));
        allLogs.forEach((l) => {
            const dow = new Date(l.date).getDay();
            dowStats[dow].total++;
            if (l.status === "success") dowStats[dow].success++;
        });
        const dowData = dowStats.map((d) => ({
            ...d,
            rate: d.total ? Math.round((d.success / d.total) * 100) : 0,
        }));

        // Top performer
        const topExp = experiments.reduce((best, e) => {
            const rate = getSuccessRate(e);
            return !best || rate > getSuccessRate(best) ? e : best;
        }, null);

        // Longest streak across all
        const maxStreakExp = experiments.reduce((best, e) => {
            const s = getLongestStreak(e);
            return !best || s > getLongestStreak(best) ? e : best;
        }, null);

        return {
            overallRate,
            categoryData,
            dowData,
            topExp,
            maxStreakExp,
            totalLogs: allLogs.length,
            successLogs: successLogs.length,
            failLogs: failLogs.length,
        };
    }, [experiments]);

    if (loading)
        return (
            <div className="flex-1 flex items-center justify-center">
                <div className="text-4xl animate-float">📊</div>
            </div>
        );

    if (!experiments.length)
        return (
            <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
                <div className="text-5xl mb-4 animate-float">📊</div>
                <h2
                    className="text-xl font-bold mb-2"
                    style={{ fontFamily: "Syne" }}
                >
                    No data yet
                </h2>
                <p
                    className="text-sm"
                    style={{ color: "var(--text-secondary)" }}
                >
                    Create experiments and log your progress to unlock insights
                </p>
            </div>
        );

    const weekdayRate =
        stats?.dowData?.slice(1, 6).reduce((s, d) => s + d.rate, 0) / 5;
    const weekendRate =
        (stats?.dowData?.[0]?.rate + stats?.dowData?.[6]?.rate) / 2;

    return (
        <div className="flex-1" style={{ paddingBottom: 100 }}>
            <div className="px-5 pt-6 pb-4">
                <h1
                    className="text-2xl font-extrabold gradient-text-cyan"
                    style={{ fontFamily: "Syne" }}
                >
                    Insights 📊
                </h1>
                <p
                    className="text-sm mt-0.5"
                    style={{ color: "var(--text-secondary)" }}
                >
                    Your experiment analytics
                </p>
            </div>

            {/* Overall rate */}
            <div className="px-5 mb-4">
                <div
                    className="rounded-2xl p-5 text-center relative overflow-hidden"
                    style={{
                        background: "var(--bg-card)",
                        border: "1px solid var(--bg-border)",
                    }}
                >
                    <div
                        className="absolute inset-0 opacity-5"
                        style={{
                            background: `radial-gradient(circle at 50% 50%, var(--accent-cyan), transparent 70%)`,
                        }}
                    />
                    <div
                        className="text-6xl font-extrabold gradient-text-cyan"
                        style={{ fontFamily: "Syne" }}
                    >
                        {stats?.overallRate ?? 0}%
                    </div>
                    <div
                        className="text-sm mt-1"
                        style={{ color: "var(--text-secondary)" }}
                    >
                        Overall Success Rate
                    </div>
                    <div
                        className="flex justify-center gap-6 mt-4 text-xs font-mono"
                        style={{ fontFamily: "DM Mono" }}
                    >
                        <span style={{ color: "var(--accent-green)" }}>
                            ✓ {stats?.successLogs ?? 0} wins
                        </span>
                        <span style={{ color: "var(--text-muted)" }}>|</span>
                        <span style={{ color: "var(--accent-red)" }}>
                            ✗ {stats?.failLogs ?? 0} fails
                        </span>
                        <span style={{ color: "var(--text-muted)" }}>|</span>
                        <span style={{ color: "var(--text-secondary)" }}>
                            {stats?.totalLogs ?? 0} total
                        </span>
                    </div>
                </div>
            </div>

            {/* Weekday insight */}
            {stats?.totalLogs > 5 && (
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
                            WEEKDAY VS WEEKEND
                        </p>
                        <div className="flex gap-3">
                            <div
                                className="flex-1 p-3 rounded-xl text-center"
                                style={{
                                    background:
                                        weekdayRate > weekendRate
                                            ? "rgba(0,255,157,0.08)"
                                            : "var(--bg-elevated)",
                                }}
                            >
                                <div
                                    className="text-2xl font-bold"
                                    style={{
                                        color: "var(--accent-green)",
                                        fontFamily: "Syne",
                                    }}
                                >
                                    {Math.round(weekdayRate)}%
                                </div>
                                <div
                                    className="text-xs mt-0.5"
                                    style={{
                                        color: "var(--text-muted)",
                                        fontFamily: "DM Mono",
                                    }}
                                >
                                    Weekdays
                                </div>
                                {weekdayRate > weekendRate && (
                                    <div
                                        className="text-xs mt-1"
                                        style={{ color: "var(--accent-green)" }}
                                    >
                                        🏆 Better
                                    </div>
                                )}
                            </div>
                            <div
                                className="flex-1 p-3 rounded-xl text-center"
                                style={{
                                    background:
                                        weekendRate > weekdayRate
                                            ? "rgba(0,255,157,0.08)"
                                            : "var(--bg-elevated)",
                                }}
                            >
                                <div
                                    className="text-2xl font-bold"
                                    style={{
                                        color: "var(--accent-cyan)",
                                        fontFamily: "Syne",
                                    }}
                                >
                                    {Math.round(weekendRate)}%
                                </div>
                                <div
                                    className="text-xs mt-0.5"
                                    style={{
                                        color: "var(--text-muted)",
                                        fontFamily: "DM Mono",
                                    }}
                                >
                                    Weekend
                                </div>
                                {weekendRate > weekdayRate && (
                                    <div
                                        className="text-xs mt-1"
                                        style={{ color: "var(--accent-green)" }}
                                    >
                                        🏆 Better
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Day of week chart */}
            {stats?.totalLogs > 0 && (
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
                            SUCCESS BY DAY OF WEEK
                        </p>
                        <ResponsiveContainer width="100%" height={120}>
                            <BarChart data={stats.dowData} barSize={24}>
                                <XAxis
                                    dataKey="day"
                                    tick={{
                                        fontSize: 11,
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
                                        fontSize: 11,
                                        fontFamily: "DM Mono",
                                    }}
                                    formatter={(v) => [`${v}%`, "Success Rate"]}
                                />
                                <Bar dataKey="rate" radius={[4, 4, 0, 0]}>
                                    {stats.dowData.map((entry, i) => (
                                        <Cell
                                            key={i}
                                            fill={
                                                entry.rate >= 70
                                                    ? "var(--accent-green)"
                                                    : entry.rate >= 40
                                                      ? "var(--accent-cyan)"
                                                      : "var(--accent-red)"
                                            }
                                        />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            {/* By category */}
            {stats?.categoryData?.length > 0 && (
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
                            BY CATEGORY
                        </p>
                        <div className="space-y-3">
                            {stats.categoryData.map((c) => (
                                <div key={c.id}>
                                    <div className="flex items-center justify-between mb-1">
                                        <span
                                            className="text-sm font-semibold"
                                            style={{ fontFamily: "Syne" }}
                                        >
                                            {c.emoji} {c.name}
                                        </span>
                                        <span
                                            className="text-sm font-mono font-bold"
                                            style={{
                                                color: c.color,
                                                fontFamily: "DM Mono",
                                            }}
                                        >
                                            {c.rate}%
                                        </span>
                                    </div>
                                    <div
                                        className="w-full h-1.5 rounded-full overflow-hidden"
                                        style={{
                                            background: "var(--bg-border)",
                                        }}
                                    >
                                        <div
                                            className="h-full rounded-full transition-all duration-1000"
                                            style={{
                                                width: `${c.rate}%`,
                                                background: c.color,
                                            }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Top experiments */}
            {stats?.topExp && (
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
                            🏆 BEST EXPERIMENT
                        </p>
                        <div
                            className="flex items-center gap-3 cursor-pointer"
                            onClick={() =>
                                onNavigateToDetail?.(stats.topExp.id)
                            }
                        >
                            <div className="text-2xl">
                                {getCategoryById(stats.topExp.category).emoji}
                            </div>
                            <div className="flex-1">
                                <div
                                    className="font-bold"
                                    style={{ fontFamily: "Syne" }}
                                >
                                    {stats.topExp.title}
                                </div>
                                <div
                                    className="text-xs font-mono mt-0.5"
                                    style={{
                                        color: "var(--text-secondary)",
                                        fontFamily: "DM Mono",
                                    }}
                                >
                                    {getSuccessRate(stats.topExp)}% success rate
                                    · {stats.topExp.logs?.length || 0} logs
                                </div>
                            </div>
                            <div
                                className="text-2xl font-extrabold"
                                style={{
                                    color: "var(--accent-green)",
                                    fontFamily: "Syne",
                                }}
                            >
                                {getSuccessRate(stats.topExp)}%
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
