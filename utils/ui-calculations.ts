import { MIN_DIMENSIONS, SCALE_FACTORS } from "@/constants/camera-constants"

export const calculateResponsiveDimensions = (containerDimensions: { width: number; height: number }) => {
  return {
    scrollHeight: Math.max(MIN_DIMENSIONS.scrollHeight, containerDimensions.height * SCALE_FACTORS.scrollHeight - 80),
    imageHeight: Math.max(MIN_DIMENSIONS.imageHeight, containerDimensions.height * 0.08),
    fontSize: Math.max(MIN_DIMENSIONS.fontSize, containerDimensions.width * SCALE_FACTORS.fontSize),
    padding: Math.max(MIN_DIMENSIONS.padding, containerDimensions.width * SCALE_FACTORS.padding),
  }
}

export const calculateGridItemHeight = (containerDimensions: { width: number; height: number }) => {
  return {
    minHeight: Math.max(60, containerDimensions.height * 0.08),
    maxHeight: Math.max(120, containerDimensions.height * 0.15),
  }
}
