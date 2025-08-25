"use client"

import { useState, useEffect, useRef } from "react"
import {
  Search,
  Video,
  Settings,
  Grid3X3,
  List,
  MoreVertical,
  Play,
  Volume2,
  Maximize2,
  X,
  User,
  Sun,
  Moon,
  Plus,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"
import LoginPage from "@/app/login/page"
import { useRouter } from "next/navigation"
import { ThemeProvider } from "@/components/theme-provider"


interface Camera {
  id: string
  name: string
  location: string
  status: "online" | "offline" | "recording"
  thumbnail: string
  resolution: string
  lastActive: string
  ipAddress: string
  port: string
  username: string
  streamUrl?: string
}

export function CameraManager() {
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [selectedCamera, setSelectedCamera] = useState<string | null>(null)
  const [isPopupOpen, setIsPopupOpen] = useState(false)
  const [popupCamera, setPopupCamera] = useState<Camera | null>(null)
  const [isConnectDialogOpen, setIsConnectDialogOpen] = useState(false)
  const [newCamera, setNewCamera] = useState({
    name: "",
    location: "",
    ipAddress: "",
    port: "",
    username: "",
    password: "",
  })
  const { theme, setTheme } = useTheme()

  const [cameras, setCameras] = useState<Camera[]>([])
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const wsConnections = useRef<Map<string, WebSocket>>(new Map())

  const router = useRouter()





  const loadCameraData = async () => {
    try {
      setIsLoading(true)
      console.log("[v0] Loading camera data from API...")

      const response = await fetch("/api/cameras", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error("Failed to load cameras")
      }

      const cameraData = await response.json()
      console.log("[v0] Loaded cameras:", cameraData)
      setCameras(cameraData)

      cameraData.forEach((camera: Camera) => {
        if (camera.status === "online" || camera.status === "recording") {
          startCameraStream(camera)
        }
      })
    } catch (error) {
      console.error("[v0] Error loading cameras:", error)
      const mockCameras: Camera[] = [
        {
          id: "1",
          name: "Front Entrance",
          location: "Main Building",
          status: "online",
          thumbnail: "/placeholder.svg?height=180&width=320",
          resolution: "1080p",
          lastActive: "2 min ago",
          ipAddress: "192.168.1.100",
          port: "554",
          username: "admin",
        },
        {
          id: "2",
          name: "Parking Lot A",
          location: "North Side",
          status: "recording",
          thumbnail: "/placeholder.svg?height=180&width=320",
          resolution: "4K",
          lastActive: "Live",
          ipAddress: "192.168.1.101",
          port: "554",
          username: "admin",
        },
        {
          id: "3",
          name: "Reception Area",
          location: "Lobby",
          status: "online",
          thumbnail: "/placeholder.svg?height=180&width=320",
          resolution: "1080p",
          lastActive: "1 min ago",
          ipAddress: "192.168.1.102",
          port: "554",
          username: "admin",
        },
        {
          id: "4",
          name: "Server Room",
          location: "Basement",
          status: "offline",
          thumbnail: "/placeholder.svg?height=180&width=320",
          resolution: "720p",
          lastActive: "1 hour ago",
          ipAddress: "192.168.1.103",
          port: "554",
          username: "admin",
        },
        {
          id: "5",
          name: "Loading Dock",
          location: "Warehouse",
          status: "online",
          thumbnail: "/placeholder.svg?height=180&width=320",
          resolution: "1080p",
          lastActive: "30 sec ago",
          ipAddress: "192.168.1.104",
          port: "554",
          username: "admin",
        },
        {
          id: "6",
          name: "Conference Room B",
          location: "2nd Floor",
          status: "recording",
          thumbnail: "/placeholder.svg?height=180&width=320",
          resolution: "4K",
          lastActive: "Live",
          ipAddress: "192.168.1.105",
          port: "554",
          username: "admin",
        },
      ]
      setCameras(mockCameras)
    } finally {
      setIsLoading(false)
    }
  }

  const startCameraStream = (camera: Camera) => {
    try {
      console.log("[v0] Starting stream for camera:", camera.name)

      const existingWs = wsConnections.current.get(camera.id)
      if (existingWs) {
        existingWs.close()
      }

      const wsUrl = `ws://localhost:8080/stream/${camera.id}`
      const ws = new WebSocket(wsUrl)

      ws.onopen = () => {
        console.log("[v0] WebSocket connected for camera:", camera.name)
        ws.send(
          JSON.stringify({
            type: "connect",
            cameraId: camera.id,
            ipAddress: camera.ipAddress,
            port: camera.port,
            username: camera.username,
            authToken: localStorage.getItem("authToken"),
          }),
        )
      }

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)

          if (data.type === "video_frame") {
            const videoElement = document.getElementById(`camera-${camera.id}`) as HTMLImageElement
            if (videoElement && data.frame) {
              videoElement.src = `data:image/jpeg;base64,${data.frame}`
            }
          } else if (data.type === "status_update") {
            setCameras((prev) =>
              prev.map((cam) => (cam.id === camera.id ? { ...cam, status: data.status, lastActive: "Live" } : cam)),
            )
          }
        } catch (error) {
          console.error("[v0] Error parsing WebSocket message:", error)
        }
      }

      ws.onerror = (error) => {
        console.error("[v0] WebSocket error for camera", camera.name, ":", error)
      }

      ws.onclose = () => {
        console.log("[v0] WebSocket closed for camera:", camera.name)
        wsConnections.current.delete(camera.id)

        setCameras((prev) => prev.map((cam) => (cam.id === camera.id ? { ...cam, status: "offline" as const } : cam)))
      }

      wsConnections.current.set(camera.id, ws)
    } catch (error) {
      console.error("[v0] Error starting camera stream:", error)
    }
  }


  // TODO: Implement login action 
  // TODO: Call page login
  const handleLogin = async () => {
    try {
      console.log("[v0] Attempting login...")
      // const authToken = "demo-auth-token-" + Date.now()
      // localStorage.setItem("authToken", authToken)
      // setIsAuthenticated(true)
      // await loadCameraData()
      // TODO: Show login page or redirect to login route here
      router.push("/login")
    } catch (error) {
      console.error("[v0] Login error:", error)
    }
  }

  useEffect(() => {
    return () => {
      wsConnections.current.forEach((ws) => {
        ws.close()
      })
      wsConnections.current.clear()
    }
  }, [])

  useEffect(() => {
    if (isAuthenticated) {
      loadCameraData()
    }
  }, [isAuthenticated])

  const filteredCameras = cameras.filter(
    (camera) =>
      camera.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      camera.location.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const getStatusColor = (status: Camera["status"]) => {
    switch (status) {
      case "online":
        return "bg-green-500"
      case "recording":
        return "bg-red-500"
      case "offline":
        return "bg-gray-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusText = (status: Camera["status"]) => {
    switch (status) {
      case "online":
        return "Online"
      case "recording":
        return "Recording"
      case "offline":
        return "Offline"
      default:
        return "Unknown"
    }
  }

  const handleCameraClick = (camera: Camera) => {
    setPopupCamera(camera)
    setIsPopupOpen(true)
    if (camera.status !== "offline") {
      startCameraStream(camera)
    }
  }

  const handleConnectCamera = async () => {
    try {
      console.log("[v0] Connecting new camera:", newCamera)

      const response = await fetch("/api/cameras", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newCamera),
      })

      if (response.ok) {
        const addedCamera = await response.json()
        setCameras((prev) => [...prev, addedCamera])

        if (addedCamera.status !== "offline") {
          startCameraStream(addedCamera)
        }
      }

      setIsConnectDialogOpen(false)
      setNewCamera({
        name: "",
        location: "",
        ipAddress: "",
        port: "",
        username: "",
        password: "",
      })
    } catch (error) {
      console.error("[v0] Error connecting camera:", error)
    }
  }

  return (
    <div className="flex h-screen bg-background">
      <div className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col">
        <div className="p-4 border-b border-sidebar-border">
          <h1 className="text-xl font-semibold text-sidebar-foreground flex items-center gap-2">
            <Video className="h-6 w-6 text-gray-600" />
            Camera Manager
          </h1>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <Button
            onClick={() => setIsConnectDialogOpen(true)}
            className="w-full justify-start bg-gray-600 hover:bg-gray-700 text-white mb-4"
          >
            <Plus className="h-4 w-4 mr-2" />
            Connect New Camera
          </Button>

          <Button
            variant="ghost"
            className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          >
            <Grid3X3 className="h-4 w-4 mr-2" />
            All Cameras
          </Button>

          <Button
            variant="ghost"
            className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          >
            <Play className="h-4 w-4 mr-2" />
            Live Feeds
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          >
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </nav>

        <div className="p-4 border-t border-sidebar-border">
          <div className="text-sm text-sidebar-foreground">
            <div className="flex items-center justify-between mb-2">
              <span>Status Overview</span>
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  Online
                </span>
                <span>{cameras.filter((c) => c.status === "online").length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500"></div>
                  Recording
                </span>
                <span>{cameras.filter((c) => c.status === "recording").length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-gray-500"></div>
                  Offline
                </span>
                <span>{cameras.filter((c) => c.status === "offline").length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <header className="bg-card border-b border-border p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search cameras..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-input"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
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


              {/* Dark/Light Mode Toggle */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
                    <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
                    <span className="sr-only">Toggle theme</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setTheme("light")}>
                    Light
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme("dark")}>
                    Dark
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme("system")}>
                    System
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>




              
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className={viewMode === "grid" ? "bg-gray-600 hover:bg-gray-700" : ""}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("list")}
                className={viewMode === "list" ? "bg-gray-600 hover:bg-gray-700" : ""}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 overflow-auto">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-600 mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading cameras...</p>
            </div>
          ) : (
            <div
              className={cn(
                viewMode === "grid"
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                  : "space-y-4",
              )}
            >
              {filteredCameras.map((camera) => (
                <Card
                  key={camera.id}
                  className={cn(
                    "group cursor-pointer transition-all duration-200 hover:shadow-lg",
                    selectedCamera === camera.id && "ring-2 ring-gray-500",
                    viewMode === "list" && "flex flex-row",
                  )}
                  onClick={() => handleCameraClick(camera)}
                >
                  <CardContent className={cn("p-0", viewMode === "list" && "flex flex-row w-full")}>
                    <div className={cn("relative", viewMode === "list" ? "w-48 flex-shrink-0" : "w-full")}>
                      <img
                        id={`camera-${camera.id}`}
                        src={camera.thumbnail || "/placeholder.svg"}
                        alt={camera.name}
                        className="w-full h-48 object-cover rounded-t-lg"
                      />
                      <div className="absolute top-2 left-2">
                        <Badge variant="secondary" className={cn("text-xs", getStatusColor(camera.status))}>
                          <div className={cn("w-2 h-2 rounded-full mr-1", getStatusColor(camera.status))}></div>
                          {getStatusText(camera.status)}
                        </Badge>
                      </div>
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="secondary" size="sm" className="bg-gray-600 hover:bg-gray-700 text-white">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem>
                              <Play className="h-4 w-4 mr-2" />
                              View Live
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Settings className="h-4 w-4 mr-2" />
                              Settings
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Maximize2 className="h-4 w-4 mr-2" />
                              Fullscreen
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <div className="absolute bottom-2 left-2 right-2 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="flex items-center gap-2">
                          <Button variant="secondary" size="sm" className="bg-gray-600 hover:bg-gray-700 text-white">
                            <Play className="h-3 w-3" />
                          </Button>
                          <Button variant="secondary" size="sm" className="bg-gray-600 hover:bg-gray-700 text-white">
                            <Volume2 className="h-3 w-3" />
                          </Button>
                        </div>
                        <Badge variant="secondary" className="text-xs bg-gray-600 text-white">
                          {camera.resolution}
                        </Badge>
                      </div>
                    </div>

                    <div className={cn("p-4", viewMode === "list" && "flex-1 flex flex-col justify-center")}>
                      <h3 className="font-semibold text-card-foreground mb-1">{camera.name}</h3>
                      <p className="text-sm text-muted-foreground mb-2">{camera.location}</p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Last active: {camera.lastActive}</span>
                        {viewMode === "list" && (
                          <Badge variant="outline" className="ml-2">
                            {camera.resolution}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {filteredCameras.length === 0 && (
            <div className="text-center py-12">
              <Video className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No cameras found</h3>
              <p className="text-muted-foreground">Try adjusting your search query</p>
            </div>
          )}
        </main>
      </div>

      <Dialog open={isPopupOpen} onOpenChange={setIsPopupOpen}>
        <DialogContent className="max-w-4xl w-full h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Video className="h-5 w-5" />
                {popupCamera?.name}
                <Badge variant="secondary" className={cn("text-xs", popupCamera && getStatusColor(popupCamera.status))}>
                  <div
                    className={cn("w-2 h-2 rounded-full mr-1", popupCamera && getStatusColor(popupCamera.status))}
                  ></div>
                  {popupCamera && getStatusText(popupCamera.status)}
                </Badge>
              </div>
              <Button variant="secondary" size="sm" onClick={() => setIsPopupOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 flex flex-col gap-4">
            <div className="flex-1 bg-black rounded-lg relative overflow-hidden">
              <img
                src={popupCamera?.thumbnail || "/placeholder.svg?height=480&width=854&query=live camera feed"}
                alt={popupCamera?.name}
                className="w-full h-full object-cover"
              />

              {popupCamera?.status === "recording" && (
                <div className="absolute top-4 left-4 flex items-center gap-2 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  LIVE
                </div>
              )}

              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button variant="secondary" size="sm" className="bg-gray-600 hover:bg-gray-700 text-white">
                    <Play className="h-4 w-4" />
                  </Button>
                  <Button variant="secondary" size="sm" className="bg-gray-600 hover:bg-gray-700 text-white">
                    <Volume2 className="h-4 w-4" />
                  </Button>
                  <Button variant="secondary" size="sm" className="bg-gray-600 hover:bg-gray-700 text-white">
                    <Maximize2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex items-center gap-2 text-white text-sm">
                  <Badge variant="secondary" className="bg-gray-600 text-white">
                    {popupCamera?.resolution}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-1">Location</h4>
                <p className="text-sm">{popupCamera?.location}</p>
              </div>
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-1">Last Active</h4>
                <p className="text-sm">{popupCamera?.lastActive}</p>
              </div>
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-1">Resolution</h4>
                <p className="text-sm">{popupCamera?.resolution}</p>
              </div>
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-1">Status</h4>
                <p className="text-sm">{popupCamera && getStatusText(popupCamera.status)}</p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isConnectDialogOpen} onOpenChange={setIsConnectDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Connect New Camera
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="camera-name">Camera Name</Label>
              <Input
                id="camera-name"
                placeholder="e.g., Front Door Camera"
                value={newCamera.name}
                onChange={(e) => setNewCamera({ ...newCamera, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="camera-location">Location</Label>
              <Input
                id="camera-location"
                placeholder="e.g., Main Entrance"
                value={newCamera.location}
                onChange={(e) => setNewCamera({ ...newCamera, location: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ip-address">IP Address</Label>
                <Input
                  id="ip-address"
                  placeholder="192.168.1.100"
                  value={newCamera.ipAddress}
                  onChange={(e) => setNewCamera({ ...newCamera, ipAddress: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="port">Port</Label>
                <Input
                  id="port"
                  placeholder="554"
                  value={newCamera.port}
                  onChange={(e) => setNewCamera({ ...newCamera, port: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                placeholder="admin"
                value={newCamera.username}
                onChange={(e) => setNewCamera({ ...newCamera, username: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={newCamera.password}
                onChange={(e) => setNewCamera({ ...newCamera, password: e.target.value })}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button variant="outline" className="flex-1 bg-transparent" onClick={() => setIsConnectDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                className="flex-1 bg-gray-600 hover:bg-gray-700"
                onClick={handleConnectCamera}
                disabled={!newCamera.name || !newCamera.ipAddress}
              >
                Connect Camera
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
