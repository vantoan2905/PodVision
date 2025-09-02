import type { DetectedError, ResolutionPreset } from "@/types/camera"

export const resolutionPresets: ResolutionPreset[] = [
  { label: "Auto", value: "auto", width: 0, height: 0 },
  { label: "1920x1080 (Full HD)", value: "1920x1080", width: 1920, height: 1080 },
  { label: "1366x768 (HD)", value: "1366x768", width: 1366, height: 768 },
  { label: "1280x720 (HD)", value: "1280x720", width: 1280, height: 720 },
  { label: "1024x768 (XGA)", value: "1024x768", width: 1024, height: 768 },
  { label: "800x600 (SVGA)", value: "800x600", width: 800, height: 600 },
]

export const getSeverityColor = (severity: DetectedError["severity"]) => {
  const colors = {
    high: "bg-red-500 text-white",
    medium: "bg-yellow-500 text-black",
    low: "bg-green-500 text-white",
  }
  return colors[severity]
}

export const calculateCameraStreamDimensions = (
  selectedResolution: string,
  containerDimensions: { width: number; height: number },
  resolutionPresets: ResolutionPreset[],
) => {
  const offset = 280 // tăng thêm 80px so với code cũ (200 -> 280)

  if (selectedResolution === "auto") {
    return {
      height: `${Math.max(300, containerDimensions.height - offset)}px`,
      width: "100%",
    }
  }

  const preset = resolutionPresets.find((p) => p.value === selectedResolution)
  return {
    height: `${Math.min(
      containerDimensions.height - offset,
      (((containerDimensions.width * 2) / 3) * 9) / 16,
    )}px`,
    width: `${Math.min(
      (containerDimensions.width * 2) / 3,
      preset?.width || containerDimensions.width,
    )}px`,
  }
}

export const calculateImageHeight = (containerDimensions: { width: number; height: number }) => {
  return `${Math.max(60, Math.min(120, containerDimensions.width / 8))}px`
}

export const calculateScrollAreaHeight = (containerDimensions: { width: number; height: number }) => {
  return `${Math.max(200, (containerDimensions.height - 100) / 2)}px`
}
