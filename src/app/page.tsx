"use client";

import { useState } from "react";
import { Sidebar, type ViewId } from "@/components/sidebar";
import { Topbar } from "@/components/topbar";
import { DashboardView } from "@/components/views/dashboard-view";
import { TasksView } from "@/components/views/tasks-view";
import { ProjectsView } from "@/components/views/projects-view";
import { ActivityView } from "@/components/views/activity-view";

const viewComponents: Record<ViewId, React.ComponentType> = {
  dashboard: DashboardView,
  backlog: TasksView,
  projects: ProjectsView,
  activity: ActivityView,
};

export default function Home() {
  const [activeView, setActiveView] = useState<ViewId>("dashboard");
  const ViewComponent = viewComponents[activeView];

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#0a0a0b]">
      <Sidebar activeView={activeView} onViewChange={setActiveView} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar activeView={activeView} />
        <main key={activeView} className="view-transition flex-1 overflow-hidden">
          <ViewComponent />
        </main>
      </div>
    </div>
  );
}
