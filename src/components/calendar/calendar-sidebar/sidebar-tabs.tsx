// /src/components/calendar/SidebarTabs.tsx

"use client"

import React, { useState } from "react"
import TeacherMenu from "../teachers/teacher-menu"
import UpcomingEventsTab from "./upcoming-events-tab"
import { cn } from "@/lib/utils"

const TABS = ["Teachers", "Events"]

export default function SidebarTabs() {
  const [activeTab, setActiveTab] = useState<number>(0)

  return (
    <div className="h-full flex flex-col">
      {/* Tab Buttons */}
      <div className="flex border-b bg-card">
        {TABS.map((tabName, idx) => (
          <button
            key={tabName}
            onClick={() => setActiveTab(idx)}
            className={cn(
              "flex-1 py-2 text-sm font-medium text-center transition-colors",
              idx === activeTab
                ? "bg-background text-primary border-b-2 border-primary"
                : "hover:bg-muted text-muted-foreground"
            )}
          >
            {tabName}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 0 && <TeacherMenu />}
        {activeTab === 1 && <UpcomingEventsTab />}
      </div>
    </div>
  )
}