import type React from "react"
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

export const loadCameraData = async (
  setIsLoading: (loading: boolean) => void,
  setCameras: (cameras: Camera[] | ((prev: Camera[]) => Camera[])) => void,
  startCameraStream: (camera: Camera) => void,
) => {
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

export const startCameraStream = (
  camera: Camera,
  wsConnections: React.MutableRefObject<Map<string, WebSocket>>,
  setCameras: (cameras: Camera[] | ((prev: Camera[]) => Camera[])) => void,
) => {
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
