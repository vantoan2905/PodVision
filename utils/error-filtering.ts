import { FRAME_DIMENSIONS } from "@/constants/camera-constants"

export interface ErrorLocation {
  x: number
  y: number
}

export interface CapturedImage {
  id: string
  location?: ErrorLocation
  imageUrl?: string
  type: string
  timestamp: string
  severity: string
}

export interface DetectedError {
  id: string
  location: ErrorLocation
  type: string
  severity: string
  description: string
  timestamp: string
}

export const filterErrorsInFrame = (errors: DetectedError[]): DetectedError[] => {
  return errors.filter(
    (error) =>
      error.location.x >= 0 &&
      error.location.x <= FRAME_DIMENSIONS.width &&
      error.location.y >= 0 &&
      error.location.y <= FRAME_DIMENSIONS.height,
  )
}

export const filterImagesInFrame = (images: CapturedImage[]): CapturedImage[] => {
  return images.filter((image) => {
    return (
      image.location &&
      image.location.x >= 0 &&
      image.location.x <= FRAME_DIMENSIONS.width &&
      image.location.y >= 0 &&
      image.location.y <= FRAME_DIMENSIONS.height
    )
  })
}
