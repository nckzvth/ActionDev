import { useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { AppShell } from "./components/AppShell";
import { HomePage } from "./pages/HomePage";
import { DashboardPage } from "./pages/DashboardPage";
import { PathPage } from "./pages/PathPage";
import { LessonPage } from "./pages/LessonPage";
import { MilestonesPage } from "./pages/MilestonesPage";
import { ReferencePage } from "./pages/ReferencePage";
import { SettingsPage } from "./pages/SettingsPage";
import { ExercisePage } from "./pages/ExercisePage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { useAppStore } from "./state/appStore";

function RouteEffects() {
  const location = useLocation();
  const setMobileNavOpen = useAppStore((state) => state.setMobileNavOpen);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
    setMobileNavOpen(false);
  }, [location.pathname, setMobileNavOpen]);

  return null;
}

export function App() {
  const setCommandOpen = useAppStore((state) => state.setCommandOpen);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setCommandOpen(true);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [setCommandOpen]);

  return (
    <AppShell>
      <RouteEffects />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/path" element={<PathPage />} />
        <Route path="/lesson/:lessonSlug" element={<LessonPage />} />
        <Route path="/exercise/:lessonSlug" element={<ExercisePage />} />
        <Route path="/milestones" element={<MilestonesPage />} />
        <Route path="/reference" element={<ReferencePage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AppShell>
  );
}
