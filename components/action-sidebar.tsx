"use client"
import * as React from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Save, BarChart3, FileText, Plus } from "lucide-react"

interface ActionSidebarProps {
  onSaveBug?: () => void
  onDashboard?: () => void
  onBugSummary?: () => void
}

const tags = Array.from({ length: 50 }).map(
  (_, i, a) => `v1.2.0-beta.${a.length - i}`
)

export function ActionSidebar({ onSaveBug, onDashboard, onBugSummary }: ActionSidebarProps) {
  return (
    <div className="fixed left-0 top-0 h-full w-60 bg-background border-r border-border z-40 flex flex-col items-center py-4 gap-4 justify-center">
      <Button
        variant="ghost"
        size="icon"
        onClick={onSaveBug}
        className="w-30 h-12 flex flex-col items-center justify-center gap-1 hover:bg-muted text-muted-foreground hover:text-foreground"
        title="Save Bug"
      >
        <Save className="h-5 w-5" />
        <span className="text-xs">Save</span>
      </Button>

      <Button
        variant="ghost"
        size="icon"
        onClick={onDashboard}
        className="w-30 h-12 flex flex-col items-center justify-center gap-1 hover:bg-muted text-muted-foreground hover:text-foreground"
        title="Dashboard"
      >
        <BarChart3 className="h-5 w-5" />
        <span className="text-xs">Dash</span>
      </Button>

      <Button
        variant="ghost"
        size="icon"
        onClick={onBugSummary}
        className="w-30 h-12 flex flex-col items-center justify-center gap-1 hover:bg-muted text-muted-foreground hover:text-foreground"
        title="Bug Summary"
      >
        <FileText className="h-5 w-5" />
        <span className="text-xs">Summary</span>
      </Button>

      <ScrollArea className="h-72 w-48 rounded-md border">
        <div className="p-4">
          <h4 className="mb-4 text-sm font-medium text-center">Cameras</h4>
          {tags.map((tag, idx) => (
            <React.Fragment key={tag}>
              <div className="flex items-center justify-between">
                <span className="text-sm">{tag}</span>
                <Button variant="outline" className="h-8 w-15 content-center">
                  <div className="h-4 w-10">
                    Show
                  </div>
                </Button>
              </div>
              {idx < tags.length - 1 && <Separator className="my-2" />}
            </React.Fragment>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
