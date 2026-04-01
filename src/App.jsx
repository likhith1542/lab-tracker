import { useState, useEffect } from "react";
import { ExperimentsProvider } from "./hooks/useExperiments";
import BottomNav from "./components/BottomNav";
import TodayPage from "./pages/TodayPage";
import ExperimentsPage from "./pages/ExperimentsPage";
import InsightsPage from "./pages/InsightsPage";
import SettingsPage from "./pages/SettingsPage";
import ExperimentDetail from "./pages/ExperimentDetail";

export default function App() {
    const [activeTab, setActiveTab] = useState("dashboard");
    const [detailId, setDetailId] = useState(null);
    const [prevTab, setPrevTab] = useState(null);

    // Handle back button
    useEffect(() => {
        const handlePopState = () => {
            if (detailId) {
                setDetailId(null);
                if (prevTab) setActiveTab(prevTab);
            }
        };
        window.addEventListener("popstate", handlePopState);
        return () => window.removeEventListener("popstate", handlePopState);
    }, [detailId, prevTab]);

    const navigateToDetail = (id) => {
        setPrevTab(activeTab);
        setDetailId(id);
        window.history.pushState({ detailId: id }, "");
    };

    const navigateBack = () => {
        setDetailId(null);
        if (prevTab) setActiveTab(prevTab);
        window.history.back();
    };

    const handleTabChange = (tab) => {
        setDetailId(null);
        setActiveTab(tab);
    };

    return (
        <ExperimentsProvider>
            <div
                className="noise-overlay"
                style={{
                    background: "var(--bg-base)",
                    height: "100dvh",
                    display: "flex",
                    flexDirection: "column",
                }}
            >
                {/* Page content — fills space between top and bottom nav, scrolls inside */}
                <div
                    style={{
                        flex: 1,
                        overflow: "hidden",
                        position: "relative",
                    }}
                >
                    <div
                        style={{
                            position: "absolute",
                            inset: 0,
                            overflowY: "auto",
                            WebkitOverflowScrolling: "touch",
                        }}
                    >
                        {detailId ? (
                            <ExperimentDetail
                                key={detailId}
                                experimentId={detailId}
                                onBack={navigateBack}
                            />
                        ) : (
                            <>
                                {activeTab === "dashboard" && (
                                    <TodayPage
                                        key="dashboard"
                                        onNavigateToDetail={navigateToDetail}
                                    />
                                )}
                                {activeTab === "experiments" && (
                                    <ExperimentsPage
                                        key="experiments"
                                        onNavigateToDetail={navigateToDetail}
                                    />
                                )}
                                {activeTab === "insights" && (
                                    <InsightsPage
                                        key="insights"
                                        onNavigateToDetail={navigateToDetail}
                                    />
                                )}
                                {activeTab === "settings" && (
                                    <SettingsPage key="settings" />
                                )}
                            </>
                        )}
                    </div>
                </div>

                {/* Bottom nav always visible */}
                <BottomNav active={activeTab} onChange={handleTabChange} />
            </div>
        </ExperimentsProvider>
    );
}
