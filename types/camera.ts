export interface DetectedError {
  id: string
  timestamp: string
  type: string
  severity: "low" | "medium" | "high"
  description: string
  imageUrl: string
  location: { x: number; y: number }
}

export interface CameraStream {
  id: string
  name: string
  location: string
  status: "online" | "offline" | "recording"
  streamUrl: string
  resolution: string
}

export interface ResolutionPreset {
  label: string
  value: string
  width: number
  height: number
}

export interface Camera {
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