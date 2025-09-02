"use client"

import { useState, useRef } from "react"
import { useTheme } from "next-themes"

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

export function useCameraManager() {
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
  const [cameras, setCameras] = useState<Camera[]>([])
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const { theme, setTheme } = useTheme()
  const wsConnections = useRef<Map<string, WebSocket>>(new Map())

  // // Mock cameras fallback
  // const mockCameras: Camera[] = [
  //   {
  //     id: "1",
  //     name: "Front Entrance",
  //     location: "Main Building",
  //     status: "online",
  //     thumbnail: "/placeholder.svg?height=180&width=320",
  //     resolution: "1080p",
  //     lastActive: "2 min ago",
  //     ipAddress: "192.168.1.100",
  //     port: "554",
  //     username: "admin",
  //   },
  //   {
  //     id: "2",
  //     name: "Parking Lot A",
  //     location: "North Side",
  //     status: "recording",
  //     thumbnail: "/placeholder.svg?height=180&width=320",
  //     resolution: "4K",
  //     lastActive: "Live",
  //     ipAddress: "192.168.1.101",
  //     port: "554",
  //     username: "admin",
  //   },
  //   {
  //     id: "3",
  //     name: "Reception Area",
  //     location: "Lobby",
  //     status: "online",
  //     thumbnail: "/placeholder.svg?height=180&width=320",
  //     resolution: "1080p",
  //     lastActive: "1 min ago",
  //     ipAddress: "192.168.1.102",
  //     port: "554",
  //     username: "admin",
  //   },
  //   {
  //     id: "4",
  //     name: "Server Room",
  //     location: "Basement",
  //     status: "offline",
  //     thumbnail: "/placeholder.svg?height=180&width=320",
  //     resolution: "720p",
  //     lastActive: "1 hour ago",
  //     ipAddress: "192.168.1.103",
  //     port: "554",
  //     username: "admin",
  //   },
  //   {
  //     id: "5",
  //     name: "Loading Dock",
  //     location: "Warehouse",
  //     status: "online",
  //     thumbnail: "/placeholder.svg?height=180&width=320",
  //     resolution: "1080p",
  //     lastActive: "30 sec ago",
  //     ipAddress: "192.168.1.104",
  //     port: "554",
  //     username: "admin",
  //   },
  //   {
  //     id: "6",
  //     name: "Conference Room B",
  //     location: "2nd Floor",
  //     status: "recording",
  //     thumbnail: "/placeholder.svg?height=180&width=320",
  //     resolution: "4K",
  //     lastActive: "Live",
  //     ipAddress: "192.168.1.105",
  //     port: "554",
  //     username: "admin",
  //   },
  // ]

  const cameradata: Camera[] = []

  const loadCameraData = async () => {
    try {
      setIsLoading(true)

      const response = await fetch("/api/cameras", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) throw new Error("Failed to load cameras")

      const data = await response.json()
      setCameras(data)

      data.forEach((camera: Camera) => {
        if (camera.status === "online" || camera.status === "recording") {
          startCameraStream(camera)
        }
      })
    } catch (error) {
      console.error("Error loading cameras:", error)
      setCameras(cameradata)
    } finally {
      setIsLoading(false)
    }
  }

  const startCameraStream = (camera: Camera) => {
    try {
      const existingWs = wsConnections.current.get(camera.id)
      if (existingWs) existingWs.close()

      const ws = new WebSocket(`ws://localhost:8080/stream/${camera.id}`)

      ws.onopen = () => {
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
            const videoEl = document.getElementById(
              `camera-${camera.id}`,
            ) as HTMLImageElement

            if (videoEl && data.frame) {
              videoEl.src = `data:image/jpeg;base64,${data.frame}`
            }
          }

          if (data.type === "status_update") {
            setCameras((prev) =>
              prev.map((cam) =>
                cam.id === camera.id
                  ? { ...cam, status: data.status, lastActive: "Live" }
                  : cam,
              ),
            )
          }
        } catch (err) {
          console.error("Error parsing WebSocket message:", err)
        }
      }

      ws.onerror = (err) => {
        console.error("WebSocket error:", err)
      }

      ws.onclose = () => {
        wsConnections.current.delete(camera.id)
        setCameras((prev) =>
          prev.map((cam) =>
            cam.id === camera.id ? { ...cam, status: "offline" } : cam,
          ),
        )
      }

      wsConnections.current.set(camera.id, ws)
    } catch (err) {
      console.error("Error starting camera stream:", err)
    }
  }

  return {
    searchQuery,
    setSearchQuery,
    viewMode,
    setViewMode,
    selectedCamera,
    setSelectedCamera,
    isPopupOpen,
    setIsPopupOpen,
    popupCamera,
    setPopupCamera,
    isConnectDialogOpen,
    setIsConnectDialogOpen,
    newCamera,
    setNewCamera,
    cameras,
    setCameras,
    isAuthenticated,
    setIsAuthenticated,
    isLoading,
    setIsLoading,
    theme,
    setTheme,
    loadCameraData,
    startCameraStream,
  }
}
