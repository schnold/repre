import "./globals.css"
import { Metadata } from "next"
import SidebarTabs from "@/components/calendar/calendar-sidebar/sidebar-tabs"

export const metadata: Metadata = {
  title: "Representation Plan App",
  description: "Next.js representation plan",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body className="bg-background text-foreground min-h-screen">
        <div className="flex min-h-screen">
          <aside className="w-64 border-r bg-gray-50">
            <SidebarTabs />
          </aside>
          <main className="flex-1">{children}</main>
        </div>
      </body>
    </html>
  )
}
