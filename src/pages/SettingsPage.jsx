import { useState, useEffect, useRef } from "react";
import {
    Download,
    Upload,
    Trash2,
    Bell,
    BellOff,
    Smartphone,
    ChevronRight,
    X,
    Share,
    MoreVertical,
} from "lucide-react";
import { useExperiments } from "../hooks/useExperiments";
import { storage } from "../utils/storage";

function detectPlatform() {
    const ua = navigator.userAgent;
    const isIOS = /iphone|ipad|ipod/i.test(ua);
    const isAndroid = /android/i.test(ua);
    const isSafari = /safari/i.test(ua) && !/chrome/i.test(ua);
    const isChrome = /chrome/i.test(ua);
    const isStandalone =
        window.matchMedia("(display-mode: standalone)").matches ||
        window.navigator.standalone === true;
    return { isIOS, isAndroid, isSafari, isChrome, isStandalone };
}

function InstallModal({ onClose }) {
    const { isIOS, isAndroid, isChrome } = detectPlatform();

    return (
        <div
            className="fixed inset-0"
            style={{ background: "rgba(0,0,0,0.85)", zIndex: 200 }}
            onClick={onClose}
        >
            <div
                className="absolute bottom-0 left-0 right-0 rounded-t-3xl p-6 page-enter"
                style={{
                    background: "var(--bg-surface)",
                    zIndex: 201,
                    paddingBottom: "max(28px, env(safe-area-inset-bottom))",
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between mb-5">
                    <h3
                        className="text-lg font-bold"
                        style={{ fontFamily: "Syne" }}
                    >
                        📲 Install LabTracker
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-xl"
                        style={{ background: "var(--bg-card)" }}
                    >
                        <X
                            size={16}
                            style={{ color: "var(--text-secondary)" }}
                        />
                    </button>
                </div>

                {isIOS ? (
                    <div className="space-y-4">
                        <p
                            className="text-sm"
                            style={{ color: "var(--text-secondary)" }}
                        >
                            Open this page in{" "}
                            <strong style={{ color: "var(--text-primary)" }}>
                                Safari
                            </strong>{" "}
                            and follow these steps:
                        </p>
                        {[
                            {
                                step: "1",
                                icon: "⬆️",
                                text: "Tap the Share button at the bottom of Safari",
                            },
                            {
                                step: "2",
                                icon: "➕",
                                text: 'Scroll down and tap "Add to Home Screen"',
                            },
                            {
                                step: "3",
                                icon: "✅",
                                text: 'Tap "Add" — app icon appears on your home screen',
                            },
                        ].map(({ step, icon, text }) => (
                            <div
                                key={step}
                                className="flex items-center gap-4 p-3 rounded-2xl"
                                style={{ background: "var(--bg-card)" }}
                            >
                                <div className="text-2xl w-10 text-center flex-shrink-0">
                                    {icon}
                                </div>
                                <p
                                    className="text-sm"
                                    style={{ color: "var(--text-secondary)" }}
                                >
                                    {text}
                                </p>
                            </div>
                        ))}
                    </div>
                ) : isAndroid ? (
                    <div className="space-y-4">
                        <p
                            className="text-sm"
                            style={{ color: "var(--text-secondary)" }}
                        >
                            Open this page in{" "}
                            <strong style={{ color: "var(--text-primary)" }}>
                                Chrome
                            </strong>{" "}
                            and follow these steps:
                        </p>
                        {[
                            {
                                icon: "⋮",
                                text: "Tap the 3-dot menu (⋮) in the top-right of Chrome",
                            },
                            { icon: "➕", text: 'Tap "Add to Home Screen"' },
                            {
                                icon: "✅",
                                text: 'Tap "Add" — app icon appears on your home screen',
                            },
                        ].map(({ icon, text }, i) => (
                            <div
                                key={i}
                                className="flex items-center gap-4 p-3 rounded-2xl"
                                style={{ background: "var(--bg-card)" }}
                            >
                                <div
                                    className="text-2xl w-10 text-center flex-shrink-0 font-bold"
                                    style={{
                                        color: "var(--accent-cyan)",
                                        fontFamily: "DM Mono",
                                    }}
                                >
                                    {i + 1}
                                </div>
                                <p
                                    className="text-sm"
                                    style={{ color: "var(--text-secondary)" }}
                                >
                                    {text}
                                </p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="space-y-4">
                        <p
                            className="text-sm"
                            style={{ color: "var(--text-secondary)" }}
                        >
                            Open this page on your{" "}
                            <strong style={{ color: "var(--text-primary)" }}>
                                mobile device
                            </strong>{" "}
                            for the best experience.
                        </p>
                        <div
                            className="p-4 rounded-2xl text-center"
                            style={{ background: "var(--bg-card)" }}
                        >
                            <div className="text-3xl mb-2">📱</div>
                            <p
                                className="text-sm font-semibold"
                                style={{
                                    color: "var(--text-primary)",
                                    fontFamily: "Syne",
                                }}
                            >
                                On Android
                            </p>
                            <p
                                className="text-xs mt-1"
                                style={{
                                    color: "var(--text-muted)",
                                    fontFamily: "DM Mono",
                                }}
                            >
                                Chrome → ⋮ menu → Add to Home Screen
                            </p>
                        </div>
                        <div
                            className="p-4 rounded-2xl text-center"
                            style={{ background: "var(--bg-card)" }}
                        >
                            <div className="text-3xl mb-2">🍎</div>
                            <p
                                className="text-sm font-semibold"
                                style={{
                                    color: "var(--text-primary)",
                                    fontFamily: "Syne",
                                }}
                            >
                                On iPhone
                            </p>
                            <p
                                className="text-xs mt-1"
                                style={{
                                    color: "var(--text-muted)",
                                    fontFamily: "DM Mono",
                                }}
                            >
                                Safari → Share ⬆️ → Add to Home Screen
                            </p>
                        </div>
                    </div>
                )}

                <div
                    className="mt-5 p-3 rounded-xl"
                    style={{
                        background: "rgba(0,229,255,0.06)",
                        border: "1px solid rgba(0,229,255,0.15)",
                    }}
                >
                    <p
                        className="text-xs text-center"
                        style={{
                            color: "var(--accent-cyan)",
                            fontFamily: "DM Mono",
                        }}
                    >
                        ✓ Works offline · ✓ No browser UI · ✓ Home screen icon
                    </p>
                </div>
            </div>
        </div>
    );
}

export default function SettingsPage() {
    const { experiments, exportData, importData, reload } = useExperiments();
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [isInstalled, setIsInstalled] = useState(false);
    const [showInstallModal, setShowInstallModal] = useState(false);
    const [notifStatus, setNotifStatus] = useState(
        typeof Notification !== "undefined"
            ? Notification.permission
            : "default",
    );
    const [toast, setToast] = useState("");
    const [clearConfirm, setClearConfirm] = useState(false);
    const importRef = useRef(null);

    const showToast = (msg) => {
        setToast(msg);
        setTimeout(() => setToast(""), 2500);
    };

    useEffect(() => {
        const handler = (e) => {
            e.preventDefault();
            setDeferredPrompt(e);
        };
        window.addEventListener("beforeinstallprompt", handler);
        if (
            window.matchMedia("(display-mode: standalone)").matches ||
            window.navigator.standalone
        ) {
            setIsInstalled(true);
        }
        return () => window.removeEventListener("beforeinstallprompt", handler);
    }, []);

    const handleInstall = async () => {
        // Chrome Android — native prompt available
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === "accepted") setIsInstalled(true);
            setDeferredPrompt(null);
            return;
        }
        // iOS or no prompt — show manual instructions
        setShowInstallModal(true);
    };

    const handleRequestNotifications = async () => {
        if (!("Notification" in window)) {
            showToast("Notifications not supported");
            return;
        }
        const perm = await Notification.requestPermission();
        setNotifStatus(perm);
        showToast(
            perm === "granted"
                ? "🔔 Notifications enabled!"
                : "Notifications blocked",
        );
    };

    const handleExport = async () => {
        await exportData();
        showToast("📦 Data exported!");
    };

    const handleImport = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        try {
            const count = await importData(file);
            showToast(`✅ Imported ${count} experiments!`);
        } catch {
            showToast("❌ Import failed. Invalid file.");
        }
        e.target.value = "";
    };

    const handleClear = async () => {
        await storage.clear();
        await reload();
        setClearConfirm(false);
        showToast("🗑️ All data cleared");
    };

    const totalLogs = experiments.flatMap((e) => e.logs || []).length;
    const successLogs = experiments
        .flatMap((e) => e.logs || [])
        .filter((l) => l.status === "success").length;

    const sections = [
        {
            title: "APP",
            items: [
                {
                    icon: Smartphone,
                    label: isInstalled ? "Already Installed ✓" : "Install App",
                    desc: isInstalled
                        ? "Running as standalone app"
                        : "Add to Home Screen for native feel",
                    action: isInstalled ? null : handleInstall,
                    disabled: isInstalled,
                    color: "var(--accent-cyan)",
                },
                {
                    icon: notifStatus === "granted" ? Bell : BellOff,
                    label:
                        notifStatus === "granted"
                            ? "Notifications On"
                            : "Enable Notifications",
                    desc:
                        notifStatus === "granted"
                            ? "Daily reminders active"
                            : "Get reminded to check in daily",
                    action: handleRequestNotifications,
                    disabled: notifStatus === "granted",
                    color: "var(--accent-yellow)",
                },
            ],
        },
        {
            title: "DATA",
            items: [
                {
                    icon: Download,
                    label: "Export Data",
                    desc: `${experiments.length} experiments, ${totalLogs} logs`,
                    action: handleExport,
                    color: "var(--accent-green)",
                },
                {
                    icon: Upload,
                    label: "Import Data",
                    desc: "Restore from JSON backup",
                    action: () => importRef.current?.click(),
                    color: "var(--accent-purple)",
                },
            ],
        },
        {
            title: "DANGER ZONE",
            items: [
                {
                    icon: Trash2,
                    label: "Clear All Data",
                    desc: "Delete all experiments permanently",
                    action: () => setClearConfirm(true),
                    color: "var(--accent-red)",
                    danger: true,
                },
            ],
        },
    ];

    return (
        <div className="flex-1" style={{ paddingBottom: 100 }}>
            <div className="px-5 pt-6 pb-4">
                <h1
                    className="text-2xl font-extrabold gradient-text-cyan"
                    style={{ fontFamily: "Syne" }}
                >
                    Settings
                </h1>
                <p
                    className="text-sm mt-0.5"
                    style={{ color: "var(--text-secondary)" }}
                >
                    Manage your lab
                </p>
            </div>

            <div
                className="mx-5 mb-5 rounded-2xl p-4"
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
                    YOUR LAB SUMMARY
                </p>
                <div className="grid grid-cols-3 gap-3 text-center">
                    {[
                        {
                            label: "Experiments",
                            value: experiments.length,
                            color: "var(--accent-cyan)",
                        },
                        {
                            label: "Total Logs",
                            value: totalLogs,
                            color: "var(--accent-purple)",
                        },
                        {
                            label: "Wins",
                            value: successLogs,
                            color: "var(--accent-green)",
                        },
                    ].map(({ label, value, color }) => (
                        <div key={label}>
                            <div
                                className="text-2xl font-bold"
                                style={{ color, fontFamily: "Syne" }}
                            >
                                {value}
                            </div>
                            <div
                                className="text-xs mt-0.5"
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

            {sections.map((section) => (
                <div key={section.title} className="px-5 mb-5">
                    <p
                        className="text-xs font-mono font-bold mb-2"
                        style={{
                            color: "var(--text-muted)",
                            fontFamily: "DM Mono",
                        }}
                    >
                        {section.title}
                    </p>
                    <div
                        className="rounded-2xl overflow-hidden"
                        style={{ border: "1px solid var(--bg-border)" }}
                    >
                        {section.items.map((item, i) => (
                            <button
                                key={item.label}
                                onClick={
                                    item.disabled ? undefined : item.action
                                }
                                disabled={item.disabled}
                                className="w-full flex items-center gap-4 p-4 transition-all active:opacity-70 text-left"
                                style={{
                                    background: "var(--bg-card)",
                                    borderBottom:
                                        i < section.items.length - 1
                                            ? "1px solid var(--bg-border)"
                                            : "none",
                                    opacity: item.disabled ? 0.5 : 1,
                                    cursor: item.disabled
                                        ? "default"
                                        : "pointer",
                                }}
                            >
                                <div
                                    className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                                    style={{ background: `${item.color}18` }}
                                >
                                    <item.icon
                                        size={18}
                                        style={{ color: item.color }}
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div
                                        className="font-semibold text-sm"
                                        style={{
                                            color: item.danger
                                                ? item.color
                                                : "var(--text-primary)",
                                            fontFamily: "Syne",
                                        }}
                                    >
                                        {item.label}
                                    </div>
                                    <div
                                        className="text-xs mt-0.5 truncate"
                                        style={{
                                            color: "var(--text-muted)",
                                            fontFamily: "DM Mono",
                                        }}
                                    >
                                        {item.desc}
                                    </div>
                                </div>
                                <ChevronRight
                                    size={16}
                                    style={{
                                        color: "var(--text-muted)",
                                        flexShrink: 0,
                                    }}
                                />
                            </button>
                        ))}
                    </div>
                </div>
            ))}

            <div className="px-5 mb-8">
                <div
                    className="rounded-2xl p-4 text-center"
                    style={{
                        background: "var(--bg-card)",
                        border: "1px solid var(--bg-border)",
                    }}
                >
                    <div className="text-3xl mb-2">⚗️</div>
                    <div
                        className="font-bold text-sm"
                        style={{ fontFamily: "Syne" }}
                    >
                        LabTracker v1.0.0
                    </div>
                    <div
                        className="text-xs mt-1"
                        style={{
                            color: "var(--text-muted)",
                            fontFamily: "DM Mono",
                        }}
                    >
                        All data stored locally · No cloud · No tracking
                    </div>
                    <div
                        className="mt-1 text-xs"
                        style={{
                            color: "var(--text-muted)",
                            fontFamily: "DM Mono",
                        }}
                    >
                        Built with React + IndexedDB + PWA
                    </div>
                </div>
            </div>

            {showInstallModal && (
                <InstallModal onClose={() => setShowInstallModal(false)} />
            )}

            {clearConfirm && (
                <div
                    className="fixed inset-0"
                    style={{ background: "rgba(0,0,0,0.8)", zIndex: 200 }}
                    onClick={() => setClearConfirm(false)}
                >
                    <div
                        className="absolute bottom-0 left-0 right-0 rounded-t-3xl p-5 page-enter"
                        style={{
                            background: "var(--bg-surface)",
                            zIndex: 201,
                            paddingBottom:
                                "max(28px, env(safe-area-inset-bottom))",
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="text-center mb-6">
                            <div className="text-3xl mb-2">⚠️</div>
                            <h3
                                className="text-lg font-bold"
                                style={{ fontFamily: "Syne" }}
                            >
                                Clear All Data?
                            </h3>
                            <p
                                className="text-sm mt-1"
                                style={{ color: "var(--text-secondary)" }}
                            >
                                This will permanently delete all{" "}
                                {experiments.length} experiments and {totalLogs}{" "}
                                logs.
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setClearConfirm(false)}
                                className="flex-1 py-4 rounded-xl font-bold text-sm"
                                style={{
                                    background: "var(--bg-card)",
                                    color: "var(--text-secondary)",
                                    fontFamily: "Syne",
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleClear}
                                className="flex-1 py-4 rounded-xl font-bold text-sm"
                                style={{
                                    background: "var(--accent-red)",
                                    color: "white",
                                    fontFamily: "Syne",
                                }}
                            >
                                Delete Everything
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <input
                ref={importRef}
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
            />

            {toast && (
                <div
                    className="fixed top-16 left-1/2 -translate-x-1/2 z-[300] px-4 py-2.5 rounded-2xl text-sm font-semibold animate-scale-in shadow-2xl"
                    style={{
                        background: "var(--bg-card)",
                        border: "1px solid var(--bg-border)",
                        color: "var(--text-primary)",
                        fontFamily: "DM Mono",
                        whiteSpace: "nowrap",
                    }}
                >
                    {toast}
                </div>
            )}
        </div>
    );
}
