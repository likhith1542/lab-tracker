import { useState } from "react";
import { X, FlaskConical, ChevronDown } from "lucide-react";
import { CATEGORIES, DIFFICULTIES } from "../utils/experiments";

const today = () => new Date().toISOString().split("T")[0];

export default function CreateExperimentModal({ onClose, onCreate }) {
    const [form, setForm] = useState({
        title: "",
        description: "",
        duration: "7",
        startDate: today(),
        category: "health",
        difficulty: "medium",
    });
    const [creating, setCreating] = useState(false);
    const [error, setError] = useState("");

    const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

    const handleSubmit = async () => {
        if (!form.title.trim()) {
            setError("Title is required");
            return;
        }
        if (!form.duration || parseInt(form.duration) < 1) {
            setError("Duration must be at least 1 day");
            return;
        }
        setCreating(true);
        try {
            await onCreate(form);
            onClose();
        } catch (e) {
            setError("Failed to create experiment. Try again.");
            setCreating(false);
        }
    };

    const presets = [
        {
            title: "No Sugar",
            duration: "7",
            category: "health",
            difficulty: "hard",
        },
        {
            title: "Wake up at 6 AM",
            duration: "14",
            category: "productivity",
            difficulty: "medium",
        },
        {
            title: "No social media after 9 PM",
            duration: "30",
            category: "mind",
            difficulty: "medium",
        },
        {
            title: "Read 20 pages/day",
            duration: "21",
            category: "mind",
            difficulty: "easy",
        },
        {
            title: "Daily workout",
            duration: "30",
            category: "health",
            difficulty: "hard",
        },
        {
            title: "Meditate 10 min",
            duration: "14",
            category: "mind",
            difficulty: "easy",
        },
    ];

    return (
        <div
            className="fixed inset-0 z-50"
            style={{ background: "rgba(0,0,0,0.8)" }}
            onClick={onClose}
        >
            <div
                className="absolute bottom-0 left-0 right-0 rounded-t-3xl page-enter"
                style={{
                    background: "var(--bg-surface)",
                    height: "92dvh",
                    overflowY: "auto",
                    WebkitOverflowScrolling: "touch",
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Handle */}
                <div className="flex justify-center pt-3 pb-1">
                    <div
                        className="w-10 h-1 rounded-full"
                        style={{ background: "var(--bg-border)" }}
                    />
                </div>

                {/* Header */}
                <div className="flex items-center justify-between px-5 py-3">
                    <div className="flex items-center gap-2">
                        <FlaskConical
                            size={20}
                            style={{ color: "var(--accent-cyan)" }}
                        />
                        <h2
                            className="text-lg font-bold"
                            style={{ fontFamily: "Syne" }}
                        >
                            New Experiment
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-xl"
                        style={{ background: "var(--bg-card)" }}
                    >
                        <X
                            size={18}
                            style={{ color: "var(--text-secondary)" }}
                        />
                    </button>
                </div>

                <div className="px-5 pb-8 space-y-5">
                    {/* Presets */}
                    <div>
                        <p
                            className="text-xs font-mono mb-2"
                            style={{
                                color: "var(--text-muted)",
                                fontFamily: "DM Mono",
                            }}
                        >
                            QUICK PRESETS
                        </p>
                        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
                            {presets.map((p) => (
                                <button
                                    key={p.title}
                                    onClick={() =>
                                        setForm((f) => ({ ...f, ...p }))
                                    }
                                    className="flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all active:scale-95 border"
                                    style={{
                                        background:
                                            form.title === p.title
                                                ? "rgba(0,229,255,0.12)"
                                                : "var(--bg-card)",
                                        borderColor:
                                            form.title === p.title
                                                ? "var(--accent-cyan)"
                                                : "var(--bg-border)",
                                        color:
                                            form.title === p.title
                                                ? "var(--accent-cyan)"
                                                : "var(--text-secondary)",
                                        fontFamily: "DM Mono",
                                    }}
                                >
                                    {p.title}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Title */}
                    <div>
                        <label
                            className="block text-xs font-mono mb-1.5"
                            style={{
                                color: "var(--text-secondary)",
                                fontFamily: "DM Mono",
                            }}
                        >
                            EXPERIMENT TITLE *
                        </label>
                        <input
                            className="lab-input"
                            placeholder="e.g. No sugar for 7 days"
                            value={form.title}
                            onChange={(e) => set("title", e.target.value)}
                            maxLength={60}
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label
                            className="block text-xs font-mono mb-1.5"
                            style={{
                                color: "var(--text-secondary)",
                                fontFamily: "DM Mono",
                            }}
                        >
                            DESCRIPTION (optional)
                        </label>
                        <textarea
                            className="lab-input resize-none"
                            rows={2}
                            placeholder="Why are you running this experiment?"
                            value={form.description}
                            onChange={(e) => set("description", e.target.value)}
                            maxLength={200}
                        />
                    </div>

                    {/* Duration + Start Date */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label
                                className="block text-xs font-mono mb-1.5"
                                style={{
                                    color: "var(--text-secondary)",
                                    fontFamily: "DM Mono",
                                }}
                            >
                                DURATION (days)
                            </label>
                            <input
                                type="number"
                                className="lab-input"
                                placeholder="7"
                                min={1}
                                max={365}
                                value={form.duration}
                                onChange={(e) =>
                                    set("duration", e.target.value)
                                }
                            />
                        </div>
                        <div>
                            <label
                                className="block text-xs font-mono mb-1.5"
                                style={{
                                    color: "var(--text-secondary)",
                                    fontFamily: "DM Mono",
                                }}
                            >
                                START DATE
                            </label>
                            <input
                                type="date"
                                className="lab-input"
                                value={form.startDate}
                                onChange={(e) =>
                                    set("startDate", e.target.value)
                                }
                                style={{ colorScheme: "dark" }}
                            />
                        </div>
                    </div>

                    {/* Category */}
                    <div>
                        <label
                            className="block text-xs font-mono mb-2"
                            style={{
                                color: "var(--text-secondary)",
                                fontFamily: "DM Mono",
                            }}
                        >
                            CATEGORY
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {CATEGORIES.map((c) => (
                                <button
                                    key={c.id}
                                    onClick={() => set("category", c.id)}
                                    className="category-chip transition-all"
                                    style={{
                                        background:
                                            form.category === c.id
                                                ? `${c.color}18`
                                                : "var(--bg-card)",
                                        borderColor:
                                            form.category === c.id
                                                ? c.color
                                                : "var(--bg-border)",
                                        color:
                                            form.category === c.id
                                                ? c.color
                                                : "var(--text-secondary)",
                                    }}
                                >
                                    {c.emoji} {c.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Difficulty */}
                    <div>
                        <label
                            className="block text-xs font-mono mb-2"
                            style={{
                                color: "var(--text-secondary)",
                                fontFamily: "DM Mono",
                            }}
                        >
                            DIFFICULTY
                        </label>
                        <div className="flex gap-2">
                            {DIFFICULTIES.map((d) => (
                                <button
                                    key={d.id}
                                    onClick={() => set("difficulty", d.id)}
                                    className="flex-1 py-2.5 rounded-xl font-semibold text-sm transition-all border active:scale-95"
                                    style={{
                                        background:
                                            form.difficulty === d.id
                                                ? `${d.color}18`
                                                : "var(--bg-card)",
                                        borderColor:
                                            form.difficulty === d.id
                                                ? d.color
                                                : "var(--bg-border)",
                                        color:
                                            form.difficulty === d.id
                                                ? d.color
                                                : "var(--text-secondary)",
                                        fontFamily: "DM Mono",
                                        fontSize: 13,
                                    }}
                                >
                                    {d.label}
                                    <div className="text-xs opacity-60 mt-0.5">
                                        +{d.xp} XP
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {error && (
                        <p
                            className="text-sm px-3 py-2 rounded-xl"
                            style={{
                                background: "rgba(255,61,113,0.1)",
                                color: "var(--accent-red)",
                                fontFamily: "DM Mono",
                            }}
                        >
                            ⚠ {error}
                        </p>
                    )}

                    {/* Submit */}
                    <button
                        onClick={handleSubmit}
                        disabled={creating}
                        className="w-full py-4 rounded-2xl font-bold text-base transition-all active:scale-98 disabled:opacity-50"
                        style={{
                            background: creating
                                ? "var(--bg-border)"
                                : "linear-gradient(135deg, var(--accent-cyan), var(--accent-green))",
                            color: "#0a0a0f",
                            fontFamily: "Syne",
                            fontSize: 15,
                        }}
                    >
                        {creating ? "⚗️ Creating..." : "🚀 Launch Experiment"}
                    </button>
                </div>
            </div>
        </div>
    );
}
