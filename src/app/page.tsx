"use client";

import { useState } from "react";
import { Sidebar, MobileNav, type ViewId } from "@/components/sidebar";
import { Topbar } from "@/components/topbar";
import { DashboardView } from "@/components/views/dashboard-view";
import { TasksView } from "@/components/views/tasks-view";
import { ProjectsView } from "@/components/views/projects-view";
import { ActivityView } from "@/components/views/activity-view";
import { CronsView } from "@/components/views/crons-view";

const viewComponents: Record<ViewId, React.ComponentType> = {
  dashboard: DashboardView,
  backlog: TasksView,
  projects: ProjectsView,
  activity: ActivityView,
  crons: CronsView,
};

export default function Home() {
  const [activeView, setActiveView] = useState<ViewId>("dashboard");
  const ViewComponent = viewComponents[activeView];

  return (
    <div className="flex h-[100dvh] w-screen overflow-hidden bg-[#0a0a0b]">
      {/* Desktop sidebar — hidden on mobile */}
      <div className="hidden md:block">
        <Sidebar activeView={activeView} onViewChange={setActiveView} />
      </div>

      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar activeView={activeView} />
        <main key={activeView} className="view-transition flex-1 overflow-hidden pb-16 md:pb-0">
          <ViewComponent />
        </main>
      </div>

      {/* Mobile bottom tab bar — visible only on mobile */}
      <MobileNav activeView={activeView} onViewChange={setActiveView} />
    </div>
  );
}
