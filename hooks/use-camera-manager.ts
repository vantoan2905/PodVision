"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import type { CameraStream, DetectedError } from "@/types/camera"

export function useCameraManager() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [currentStream, setCurrentStream] = useState<CameraStream | null>(null)
  const [detectedErrors, setDetectedErrors] = useState<DetectedError[]>([])
  const [capturedImages, setCapturedImages] = useState<DetectedError[]>([])
  const [selectedError, setSelectedError] = useState<string | null>(null)
  const [selectedResolution, setSelectedResolution] = useState<string>("auto")
  const [containerDimensions, setContainerDimensions] = useState({ width: 0, height: 0 })
  const router = useRouter()
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Mock camera stream information
    setCurrentStream({
      id: "cam-001",
      name: "Production Line Camera",
      location: "Assembly Line 1",
      status: "recording",
      streamUrl: "/industrial-production-line-camera-feed.png",
      resolution: "1920x1080",
    })

    // Mock detected errors informations
    const mockErrors: DetectedError[] = [
      {
        id: "err-001",
        timestamp: "2024-01-15 14:23:45",
        type: "Surface Defect",
        severity: "high",
        description: "Scratch detected on product surface",
        imageUrl: "/product-defect-scratch.png",
        location: { x: 320, y: 240 },
      },
      {
        id: "err-002",
        timestamp: "2024-01-15 14:21:12",
        type: "Color Variation",
        severity: "medium",
        description: "Color inconsistency in coating",
        imageUrl: "/color-defect-product.png",
        location: { x: 450, y: 180 },
      },
      {
        id: "err-003",
        timestamp: "2024-01-15 14:18:33",
        type: "Dimensional Error",
        severity: "low",
        description: "Minor size deviation detected",
        imageUrl: "/size-measurement-error.png",
        location: { x: 280, y: 320 },
      },
            {
        id: "err-003",
        timestamp: "2024-01-15 14:18:33",
        type: "Dimensional Error",
        severity: "low",
        description: "Minor size deviation detected",
        imageUrl: "/size-measurement-error.png",
        location: { x: 280, y: 320 },
      },
            {
        id: "err-003",
        timestamp: "2024-01-15 14:18:33",
        type: "Dimensional Error",
        severity: "low",
        description: "Minor size deviation detected",
        imageUrl: "/size-measurement-error.png",
        location: { x: 280, y: 320 },
      },
            {
        id: "err-003",
        timestamp: "2024-01-15 14:18:33",
        type: "Dimensional Error",
        severity: "low",
        description: "Minor size deviation detected",
        imageUrl: "/size-measurement-error.png",
        location: { x: 280, y: 320 },
      },
            {
        id: "err-003",
        timestamp: "2024-01-15 14:18:33",
        type: "Dimensional Error",
        severity: "low",
        description: "Minor size deviation detected",
        imageUrl: "/size-measurement-error.png",
        location: { x: 280, y: 320 },
      },
            {
        id: "err-003",
        timestamp: "2024-01-15 14:18:33",
        type: "Dimensional Error",
        severity: "low",
        description: "Minor size deviation detected",
        imageUrl: "/size-measurement-error.png",
        location: { x: 280, y: 320 },
      },
            {
        id: "err-003",
        timestamp: "2024-01-15 14:18:33",
        type: "Dimensional Error",
        severity: "low",
        description: "Minor size deviation detected",
        imageUrl: "/size-measurement-error.png",
        location: { x: 280, y: 320 },
      },
            {
        id: "err-003",
        timestamp: "2024-01-15 14:18:33",
        type: "Dimensional Error",
        severity: "low",
        description: "Minor size deviation detected",
        imageUrl: "/size-measurement-error.png",
        location: { x: 280, y: 320 },
      },

    ]

    setDetectedErrors(mockErrors)
    setCapturedImages(mockErrors)
  }, [])

  const filteredErrors = detectedErrors.filter(
    (error) =>
      error.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      error.description.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleLogin = () => {
    router.push("/login")
  }

  const handleResolutionChange = (resolution: string) => {
    setSelectedResolution(resolution)
  }

  return {
    // State
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

    // Refs
    videoRef,
    containerRef,

    // Handlers
    handleLogin,
    handleResolutionChange,
  }
}
