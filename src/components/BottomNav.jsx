import { FlaskConical, CalendarCheck, BarChart2, Settings } from "lucide-react";

const tabs = [
    { id: "dashboard", icon: CalendarCheck, label: "Today" },
    { id: "experiments", icon: FlaskConical, label: "Experiments" },
    { id: "insights", icon: BarChart2, label: "Insights" },
    { id: "settings", icon: Settings, label: "Settings" },
];

export default function BottomNav({ active, onChange }) {
    return (
        <nav
            className="bottom-nav fixed bottom-0 left-0 right-0 bg-bg-surface border-t border-bg-border"
            style={{ zIndex: 50 }}
        >
            <div className="flex items-center justify-around px-2 pt-2">
                {tabs.map(({ id, icon: Icon, label }) => {
                    const isActive = active === id;
                    return (
                        <button
                            key={id}
                            onClick={() => onChange(id)}
                            className="flex flex-col items-center gap-0.5 px-4 py-2 rounded-xl transition-all duration-200 relative"
                            style={{ minWidth: 64 }}
                        >
                            {isActive && (
                                <span
                                    className="absolute inset-0 rounded-xl"
                                    style={{
                                        background: "rgba(0, 229, 255, 0.08)",
                                    }}
                                />
                            )}
                            <Icon
                                size={22}
                                strokeWidth={isActive ? 2.5 : 1.8}
                                style={{
                                    color: isActive
                                        ? "var(--accent-cyan)"
                                        : "var(--text-muted)",
                                    transition: "color 0.2s",
                                }}
                            />
                            <span
                                className="text-[10px] font-semibold tracking-wide"
                                style={{
                                    color: isActive
                                        ? "var(--accent-cyan)"
                                        : "var(--text-muted)",
                                    fontFamily: "DM Mono",
                                }}
                            >
                                {label}
                            </span>
                            {isActive && (
                                <span
                                    className="absolute -top-px left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full"
                                    style={{ background: "var(--accent-cyan)" }}
                                />
                            )}
                        </button>
                    );
                })}
            </div>
        </nav>
    );
}
