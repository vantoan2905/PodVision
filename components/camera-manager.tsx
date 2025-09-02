"use client"

import {
  Search,
  Video,
  Settings,
  MoreVertical,
  Play,
  Volume2,
  Maximize2,
  User,
  Sun,
  Moon,
  AlertTriangle,
  Camera,
  Clock,
  Monitor,
  Menu,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"
import { useCameraManager } from "@/hooks/use-camera-manager"
import { useAutoResize } from "@/hooks/use-auto-resize"
import { ActionSidebar } from "@/components/action-sidebar"
import { useState } from "react"

import {
  resolutionPresets,
  getSeverityColor,
  calculateCameraStreamDimensions,
  calculateImageHeight,
  calculateScrollAreaHeight,
} from "@/utils/camera-helpers"
import { filterErrorsInFrame, filterImagesInFrame } from "@/utils/error-filtering"
import { calculateResponsiveDimensions, calculateGridItemHeight } from "@/utils/ui-calculations"
import { createSidebarActions } from "@/utils/sidebar-actions"

export function CameraManager() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const {
    searchQuery,
    setSearchQuery,
    isAuthenticated,
    currentStream,
    detectedErrors,
    capturedImages,
    selectedError,
    setSelectedError,
    selectedResolution,
    containerDimensions,
    setContainerDimensions,
    filteredErrors,
    containerRef,
    handleLogin,
    handleResolutionChange,
  } = useCameraManager()

  const { theme, setTheme } = useTheme()

  useAutoResize(containerRef, selectedResolution, resolutionPresets, setContainerDimensions)

  const { handleSaveBug, handleDashboard, handleBugSummary } = createSidebarActions()

  const visibleCapturedImages = filterImagesInFrame(capturedImages)
  const errorsInFrame = filterErrorsInFrame(detectedErrors)

  const responsiveDimensions = calculateResponsiveDimensions(containerDimensions)
  const gridItemHeight = calculateGridItemHeight(containerDimensions)

  const getSeverityIcon = () => <AlertTriangle className="h-4 w-4" />
  const streamDimensions = calculateCameraStreamDimensions(selectedResolution, containerDimensions, resolutionPresets)
  const hasActiveErrors = detectedErrors.length > 0
  const hasVisibleImages = visibleCapturedImages.length > 0

  return (
    <div className="flex h-screen bg-background">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-30 bg-card border-b border-border p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="flex items-center gap-2"
            >
              <Menu className="h-4 w-4" />
              Menu
            </Button>

            <h1 className="text-xl font-semibold text-foreground flex items-center gap-2">
              <Video className="h-6 w-6 text-gray-600" />
              Quality Control Monitor
            </h1>
            {hasActiveErrors && (
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search errors..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-input w-80"
                />
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-2 bg-transparent">
                  <Monitor className="h-4 w-4" />
                  {resolutionPresets.find((p) => p.value === selectedResolution)?.label || "Resolution"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {resolutionPresets.map((preset) => (
                  <DropdownMenuItem
                    key={preset.value}
                    onClick={() => handleResolutionChange(preset.value)}
                    className={selectedResolution === preset.value ? "bg-accent" : ""}
                  >
                    {preset.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2 bg-transparent"
              onClick={handleLogin}
              disabled={isAuthenticated}
            >
              <User className="h-4 w-4" />
              {isAuthenticated ? "Logged In" : "Login"}
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
                  <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
                  <span className="sr-only">Toggle theme</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setTheme("light")}>Light</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")}>Dark</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("system")}>System</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 pt-20 p-6" ref={containerRef}>
        {isSidebarOpen && <div className="fixed inset-0 bg-black/50 z-10" onClick={() => setIsSidebarOpen(false)} />}

        <div className="flex gap-6 h-full relative">
          {/* Sidebar - positioned within main content */}
          {isSidebarOpen && (
            <div className="absolute left-0 top-0 w-16 z-20 bg-card border-r border-border center">
              <ActionSidebar onSaveBug={handleSaveBug} onDashboard={handleDashboard} onBugSummary={handleBugSummary} />
            </div>
          )}

          {/* Left: Production Line Camera (2/3 width) */}
          <div className={cn("w-2/3 min-w-0 transition-all duration-300", isSidebarOpen && "ml-20")}>
            <Card className="w-full h-full pl-7 pr-7 ml-0 text-black">
              <CardHeader className="pb-3 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Camera className="h-5 w-5" />
                    {currentStream?.name || "No Camera Selected"}
                    {currentStream && (
                      <Badge variant="secondary" className="bg-red-500 text-white ml-2">
                        <div className="w-2 h-2 rounded-full bg-white mr-1 animate-pulse"></div>
                        LIVE
                      </Badge>
                    )}
                  </CardTitle>
                  {currentStream && (
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Play className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Volume2 className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Maximize2 className="h-4 w-4" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem>Record Stream</DropdownMenuItem>
                          <DropdownMenuItem>Take Screenshot</DropdownMenuItem>
                          <DropdownMenuItem>Camera Settings</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-0 flex-1 min-h-0">
                <div
                  className="relative bg-black rounded-b-lg overflow-hidden rounded-lg"
                  style={{
                    height: streamDimensions.height,
                    maxHeight: "80vh",
                    width: streamDimensions.width,
                  }}
                >
                  <video
                    src={currentStream?.streamUrl}
                    autoPlay
                    muted
                    controls
                    className="w-full h-full object-contain bg-black"
                    style={{
                      aspectRatio: "16/9",
                      objectFit: "contain",
                    }}
                  /> 
                  {/* show bug on video */}
                  {/* {errorsInFrame.map((error) => (
                    <div
                      key={error.id}
                      className="absolute w-4 h-4 border-2 border-red-500 bg-red-500/20 rounded-full cursor-pointer animate-pulse"
                      style={{
                        left: `${(error.location.x / 854) * 100}%`,
                        top: `${(error.location.y / 480) * 100}%`,
                        transform: "translate(-50%, -50%)",
                      }}
                      onClick={() => setSelectedError(error.id)}
                    />
                  ))} */}

                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                    <div className="text-white text-sm">
                      <p>{currentStream?.location}</p>
                      <p className="text-xs opacity-75">{currentStream?.resolution}</p>
                      <p className="text-xs opacity-50">
                        {selectedResolution === "auto"
                          ? `Auto-size: ${containerDimensions.width}x${containerDimensions.height}`
                          : `Fixed: ${selectedResolution}`}
                      </p>
                    </div>
                    <div className="text-white text-sm text-right">
                      <p>Errors Detected: {errorsInFrame.length}</p>
                      <p className="text-xs opacity-75">Last Update: {new Date().toLocaleTimeString()}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right: Captured Error Images and Error List (1/3 width) */}
          <div className="w-1/3 flex flex-col gap-6 min-w-0">
            {hasVisibleImages && (
              <Card className="flex flex-col flex-1 min-h-0 max-h-full">
                <CardHeader className="pb-3 flex-shrink-0">
                  <CardTitle className="flex items-center gap-2">
                    <Camera className="h-5 w-5" />
                    Captured Error Images
                    <Badge variant="secondary" className="ml-2">
                      {visibleCapturedImages.length}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 p-0 min-h-0">
                  <ScrollArea
                    className="p-2 md:p-4 md:py-0 md:px-4"
                    style={{
                      height: calculateScrollAreaHeight(containerDimensions),
                      maxHeight: `${responsiveDimensions.scrollHeight}px`,
                    }}
                  >
                    <div
                      className="grid grid-cols-1 gap-2 md:gap-4"
                      style={{
                        gridTemplateRows: `repeat(auto-fit, minmax(${gridItemHeight.minHeight}px, auto))`,
                      }}
                    >
                      {visibleCapturedImages.map((image) => (
                        <div
                          key={image.id}
                          className={cn(
                            "relative group cursor-pointer rounded-lg overflow-hidden border-2 transition-all",
                            selectedError === image.id ? "border-blue-500" : "border-transparent hover:border-gray-300",
                          )}
                          onClick={() => setSelectedError(image.id)}
                          style={{
                            minHeight: `${gridItemHeight.minHeight}px`,
                            maxHeight: `${gridItemHeight.maxHeight}px`,
                          }}
                        >
                          <img
                            src={image.imageUrl || "/placeholder.svg"}
                            alt={`Error ${image.type}`}
                            className="w-full object-cover"
                            style={{
                              height: calculateImageHeight(containerDimensions),
                              minHeight: `${gridItemHeight.minHeight}px`,
                            }}
                          />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <div
                              className="text-white text-center"
                              style={{
                                fontSize: `${Math.max(10, containerDimensions.width * 0.008)}px`,
                              }}
                            >
                              <p className="font-medium">{image.type}</p>
                              <p className="opacity-75">{image.timestamp.split(" ")[1]}</p>
                            </div>
                          </div>
                          <div className="absolute top-1 right-1">
                            <Badge
                              className={cn("text-xs", getSeverityColor(image.severity as "low" | "medium" | "high"))}
                              style={{
                                fontSize: `${Math.max(8, containerDimensions.width * 0.006)}px`,
                                padding: `${Math.max(2, containerDimensions.width * 0.002)}px ${Math.max(4, containerDimensions.width * 0.004)}px`,
                              }}
                            >
                              {getSeverityIcon()}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}

            {/* Error List */}
            {filteredErrors.length > 0 && (
              <Card className="flex flex-col flex-1 min-h-0">
                <CardHeader className="pb-3 flex-shrink-0">
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    Error List
                    <Badge variant="secondary" className="ml-2">
                      {filteredErrors.length}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 p-0 min-h-0">
                  <ScrollArea
                    style={{
                      height: calculateScrollAreaHeight(containerDimensions),
                      maxHeight: `${responsiveDimensions.scrollHeight}px`,
                    }}
                  >
                    <div
                      className="p-2 md:p-4"
                      style={{
                        gap: `${Math.max(4, containerDimensions.height * 0.008)}px`,
                      }}
                    >
                      <div
                        className="space-y-2"
                        style={{
                          gap: `${Math.max(6, containerDimensions.height * 0.01)}px`,
                        }}
                      >
                        {filteredErrors.map((error) => (
                          <div
                            key={error.id}
                            className={cn(
                              "p-3 rounded-lg border cursor-pointer transition-all hover:shadow-md",
                              selectedError === error.id
                                ? "border-blue-500 bg-blue-50 dark:bg-blue-950/20"
                                : "border-border",
                            )}
                            onClick={() => setSelectedError(error.id)}
                            style={{
                              padding: `${Math.max(8, containerDimensions.height * 0.01)}px ${Math.max(12, containerDimensions.width * 0.008)}px`,
                              minHeight: `${Math.max(60, containerDimensions.height * 0.08)}px`,
                            }}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <Badge
                                  className={cn("text-xs", getSeverityColor(error.severity))}
                                  style={{
                                    fontSize: `${Math.max(8, containerDimensions.width * 0.006)}px`,
                                    padding: `${Math.max(2, containerDimensions.width * 0.002)}px ${Math.max(4, containerDimensions.width * 0.004)}px`,
                                  }}
                                >
                                  {getSeverityIcon()}
                                  {error.severity.toUpperCase()}
                                </Badge>
                                <span
                                  className="font-medium"
                                  style={{
                                    fontSize: `${Math.max(12, containerDimensions.width * 0.008)}px`,
                                  }}
                                >
                                  {error.type}
                                </span>
                              </div>
                              <div className="flex items-center gap-1 text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                <span
                                  style={{
                                    fontSize: `${Math.max(10, containerDimensions.width * 0.006)}px`,
                                  }}
                                >
                                  {error.timestamp.split(" ")[1]}
                                </span>
                              </div>
                            </div>
                            <p
                              className="text-muted-foreground mb-2"
                              style={{
                                fontSize: `${Math.max(11, containerDimensions.width * 0.007)}px`,
                              }}
                            >
                              {error.description}
                            </p>
                            <div className="flex items-center justify-between text-muted-foreground">
                              <span
                                style={{
                                  fontSize: `${Math.max(9, containerDimensions.width * 0.005)}px`,
                                }}
                              >
                                Position: ({error.location.x}, {error.location.y})
                              </span>
                              <span
                                style={{
                                  fontSize: `${Math.max(9, containerDimensions.width * 0.005)}px`,
                                }}
                              >
                                {error.timestamp.split(" ")[0]}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}

            {!hasActiveErrors && (
              <Card className="flex flex-col flex-1 min-h-0">
                <CardContent className="flex-1 flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <Camera className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium mb-2">No Errors Detected</p>
                    <p className="text-sm">Production line is running smoothly</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
