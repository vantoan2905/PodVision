"use client"

import type React from "react"

import { useEffect } from "react"
import type { ResolutionPreset } from "@/types/camera"

export function useAutoResize(
  containerRef: React.RefObject<HTMLDivElement>,
  selectedResolution: string,
  resolutionPresets: ResolutionPreset[],
  setContainerDimensions: (dimensions: { width: number; height: number }) => void,
) {
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        if (selectedResolution === "auto") {
          const { clientWidth, clientHeight } = containerRef.current
          setContainerDimensions({ width: clientWidth, height: clientHeight })
        } else {
          const preset = resolutionPresets.find((p) => p.value === selectedResolution)
          if (preset) {
            setContainerDimensions({ width: preset.width, height: preset.height })
          }
        }
      }
    }

    const resizeObserver = new ResizeObserver(handleResize)
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current)
      handleResize()
    }

    window.addEventListener("resize", handleResize)

    return () => {
      resizeObserver.disconnect()
      window.removeEventListener("resize", handleResize)
    }
  }, [selectedResolution, containerRef, resolutionPresets, setContainerDimensions])
}
