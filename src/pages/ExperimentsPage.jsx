import { useState } from "react";
import { Plus, Search, Filter } from "lucide-react";
import { useExperiments } from "../hooks/useExperiments";
import ExperimentCard from "../components/ExperimentCard";
import CreateExperimentModal from "../components/CreateExperimentModal";
import { today } from "../utils/experiments";

const FILTERS = ["all", "active", "completed", "failed"];

export default function ExperimentsPage({ onNavigateToDetail }) {
    const { experiments, loading, createExperiment, addLog } = useExperiments();
    const [showCreate, setShowCreate] = useState(false);
    const [filter, setFilter] = useState("all");
    const [search, setSearch] = useState("");

    const filtered = experiments.filter((e) => {
        const matchFilter = filter === "all" || e.status === filter;
        const matchSearch =
            !search || e.title.toLowerCase().includes(search.toLowerCase());
        return matchFilter && matchSearch;
    });

    const handleQuickLog = async (id, status) => {
        await addLog(id, { status, date: today(), note: "" });
    };

    return (
        <div className="flex-1" style={{ paddingBottom: 100 }}>
            {/* Header */}
            <div className="px-5 pt-6 pb-4">
                <div className="flex items-center justify-between mb-4">
                    <h1
                        className="text-2xl font-extrabold gradient-text-cyan"
                        style={{ fontFamily: "Syne" }}
                    >
                        Experiments
                    </h1>
                    <button
                        onClick={() => setShowCreate(true)}
                        className="p-2.5 rounded-xl transition-all active:scale-90"
                        style={{
                            background:
                                "linear-gradient(135deg, var(--accent-cyan), var(--accent-green))",
                        }}
                    >
                        <Plus
                            size={18}
                            style={{ color: "#0a0a0f" }}
                            strokeWidth={2.5}
                        />
                    </button>
                </div>

                {/* Search */}
                <div className="relative mb-3">
                    <Search
                        size={15}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2"
                        style={{ color: "var(--text-muted)" }}
                    />
                    <input
                        className="lab-input pl-10"
                        placeholder="Search experiments..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                {/* Filter chips */}
                <div className="flex gap-2 overflow-x-auto pb-1">
                    {FILTERS.map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition-all active:scale-95 border"
                            style={{
                                background:
                                    filter === f
                                        ? "rgba(0,229,255,0.12)"
                                        : "var(--bg-card)",
                                borderColor:
                                    filter === f
                                        ? "var(--accent-cyan)"
                                        : "var(--bg-border)",
                                color:
                                    filter === f
                                        ? "var(--accent-cyan)"
                                        : "var(--text-secondary)",
                                fontFamily: "DM Mono",
                                textTransform: "uppercase",
                                fontSize: 11,
                                letterSpacing: "0.05em",
                            }}
                        >
                            {f}{" "}
                            {f !== "all" &&
                                `(${experiments.filter((e) => e.status === f).length})`}
                        </button>
                    ))}
                </div>
            </div>

            {/* List */}
            <div className="px-5 space-y-3">
                {loading ? (
                    Array(3)
                        .fill(0)
                        .map((_, i) => (
                            <div
                                key={i}
                                className="h-32 rounded-2xl skeleton"
                            />
                        ))
                ) : filtered.length === 0 ? (
                    <div className="text-center py-16">
                        <div className="text-4xl mb-3 animate-float">🔬</div>
                        <p
                            className="font-semibold mb-1"
                            style={{ fontFamily: "Syne" }}
                        >
                            {search
                                ? "No experiments found"
                                : `No ${filter === "all" ? "" : filter} experiments yet`}
                        </p>
                        <p
                            className="text-sm"
                            style={{ color: "var(--text-muted)" }}
                        >
                            {!search &&
                                filter === "all" &&
                                "Start your first experiment"}
                        </p>
                    </div>
                ) : (
                    filtered.map((exp) => (
                        <ExperimentCard
                            key={exp.id}
                            experiment={exp}
                            onTap={onNavigateToDetail}
                            onQuickLog={handleQuickLog}
                        />
                    ))
                )}
            </div>

            {showCreate && (
                <CreateExperimentModal
                    onClose={() => setShowCreate(false)}
                    onCreate={createExperiment}
                />
            )}
        </div>
    );
}
