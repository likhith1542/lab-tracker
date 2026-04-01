export const generateId = () =>
    `exp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

export const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
};

export const formatDateShort = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

export const today = () => new Date().toISOString().split("T")[0];

export const daysBetween = (a, b) => {
    const ms = new Date(b) - new Date(a);
    return Math.floor(ms / 86400000);
};

export const addDays = (dateStr, n) => {
    const d = new Date(dateStr);
    d.setDate(d.getDate() + n);
    return d.toISOString().split("T")[0];
};

export const getExperimentProgress = (exp) => {
    const start = new Date(exp.startDate);
    const now = new Date();
    const elapsed = Math.max(0, Math.floor((now - start) / 86400000)) + 1;
    const daysCompleted = Math.min(elapsed, exp.duration);
    const progress =
        exp.duration > 0 ? (daysCompleted / exp.duration) * 100 : 0;
    const endDate = addDays(exp.startDate, exp.duration);

    return {
        daysCompleted,
        daysTotal: exp.duration,
        daysRemaining: Math.max(0, exp.duration - daysCompleted),
        progress: Math.min(100, progress),
        endDate,
        isOverdue: daysCompleted >= exp.duration && exp.status === "active",
    };
};

export const getLogForDate = (exp, dateStr) =>
    exp.logs?.find((l) => l.date === dateStr) || null;

export const getSuccessRate = (exp) => {
    const { daysCompleted } = getExperimentProgress(exp);
    if (!daysCompleted) return 0;
    const successes = (exp.logs || []).filter(
        (l) => l.status === "success",
    ).length;
    return Math.round((successes / daysCompleted) * 100);
};

export const getCurrentStreak = (exp) => {
    if (!exp.logs || exp.logs.length === 0) return 0;
    const sorted = [...exp.logs].sort((a, b) => b.date.localeCompare(a.date));
    let streak = 0;
    let checkDate = today();

    for (const log of sorted) {
        if (log.date === checkDate && log.status === "success") {
            streak++;
            const d = new Date(checkDate);
            d.setDate(d.getDate() - 1);
            checkDate = d.toISOString().split("T")[0];
        } else if (log.date === checkDate && log.status === "failed") {
            break;
        } else {
            // Gap day — check if it's today (might not have checked in yet)
            if (log.date < checkDate) break;
        }
    }
    return streak;
};

export const getLongestStreak = (exp) => {
    if (!exp.logs || exp.logs.length === 0) return 0;
    const sorted = [...exp.logs].sort((a, b) => a.date.localeCompare(b.date));
    let max = 0,
        current = 0;

    for (let i = 0; i < sorted.length; i++) {
        if (sorted[i].status === "success") {
            current++;
            max = Math.max(max, current);
        } else {
            current = 0;
        }
    }
    return max;
};

export const updateExperimentStatus = (exp) => {
    const { daysCompleted, isOverdue } = getExperimentProgress(exp);
    if (exp.status === "active") {
        if (isOverdue || daysCompleted >= exp.duration) {
            return { ...exp, status: "completed" };
        }
    }
    return exp;
};

export const getInsights = (exp) => {
    const insights = [];
    if (!exp.logs || exp.logs.length < 3) return insights;

    const logs = exp.logs;

    // Weekday vs weekend analysis
    const weekdaySuccesses = logs.filter((l) => {
        const d = new Date(l.date).getDay();
        return d >= 1 && d <= 5 && l.status === "success";
    });
    const weekdayTotal = logs.filter((l) => {
        const d = new Date(l.date).getDay();
        return d >= 1 && d <= 5;
    });
    const weekendSuccesses = logs.filter((l) => {
        const d = new Date(l.date).getDay();
        return (d === 0 || d === 6) && l.status === "success";
    });
    const weekendTotal = logs.filter((l) => {
        const d = new Date(l.date).getDay();
        return d === 0 || d === 6;
    });

    if (weekdayTotal.length > 0 && weekendTotal.length > 0) {
        const weekdayRate = weekdaySuccesses.length / weekdayTotal.length;
        const weekendRate = weekendSuccesses.length / weekendTotal.length;
        if (weekdayRate > weekendRate + 0.2) {
            insights.push({
                icon: "📅",
                text: "You perform better on weekdays",
                type: "positive",
            });
        } else if (weekendRate > weekdayRate + 0.2) {
            insights.push({
                icon: "🏖️",
                text: "You perform better on weekends",
                type: "positive",
            });
        }
    }

    // Early failure detection
    const sorted = [...logs].sort((a, b) => a.date.localeCompare(b.date));
    const first3 = sorted.slice(0, 3);
    const fails3 = first3.filter((l) => l.status === "failed").length;
    if (fails3 >= 2) {
        insights.push({
            icon: "⚡",
            text: "The first 3 days are your biggest challenge",
            type: "warning",
        });
    }

    // Day 3+ failure pattern
    if (sorted.length >= 4) {
        const after3 = sorted.slice(3);
        const failRate =
            after3.filter((l) => l.status === "failed").length / after3.length;
        if (failRate > 0.5) {
            insights.push({
                icon: "🔥",
                text: "Most failures happen after Day 3",
                type: "warning",
            });
        }
    }

    // Consistency
    const successRate = getSuccessRate(exp);
    if (successRate >= 80) {
        insights.push({
            icon: "🏆",
            text: `${successRate}% success rate — exceptional consistency!`,
            type: "positive",
        });
    }

    const streak = getCurrentStreak(exp);
    if (streak >= 3) {
        insights.push({
            icon: "🔥",
            text: `${streak}-day streak! Keep it going`,
            type: "positive",
        });
    }

    return insights;
};

export const CATEGORIES = [
    { id: "health", label: "Health", emoji: "💪", color: "#00ff9d" },
    {
        id: "productivity",
        label: "Productivity",
        emoji: "⚡",
        color: "#00e5ff",
    },
    { id: "mind", label: "Mind", emoji: "🧠", color: "#a855f7" },
    { id: "social", label: "Social", emoji: "🤝", color: "#ff6b35" },
    { id: "finance", label: "Finance", emoji: "💰", color: "#ffd600" },
    { id: "custom", label: "Custom", emoji: "🔬", color: "#ff3d71" },
];

export const DIFFICULTIES = [
    { id: "easy", label: "Easy", color: "#00ff9d", xp: 10 },
    { id: "medium", label: "Medium", color: "#ffd600", xp: 25 },
    { id: "hard", label: "Hard", color: "#ff3d71", xp: 50 },
];

export const getCategoryById = (id) =>
    CATEGORIES.find((c) => c.id === id) || CATEGORIES[5];
export const getDifficultyById = (id) =>
    DIFFICULTIES.find((d) => d.id === id) || DIFFICULTIES[0];

export const getStreakBadges = (streak) => {
    const badges = [];
    if (streak >= 3) badges.push({ emoji: "🔥", label: "3-Day Streak" });
    if (streak >= 7) badges.push({ emoji: "⚡", label: "1-Week Streak" });
    if (streak >= 14) badges.push({ emoji: "💎", label: "2-Week Streak" });
    if (streak >= 21) badges.push({ emoji: "🏆", label: "21-Day Streak" });
    if (streak >= 30) badges.push({ emoji: "👑", label: "30-Day Legend" });
    return badges;
};
