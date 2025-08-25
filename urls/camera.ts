





// class CameraService {
//     loadCameraData = async () => {
//       try {
//         setIsLoading(true)
//         console.log("[v0] Loading camera data from API...")

//       const response = await fetch("/api/cameras", {
//         method: "GET",
//         headers: {
//           Authorization: `Bearer ${localStorage.getItem("authToken")}`,
//           "Content-Type": "application/json",
//         },
//       })

//       if (!response.ok) {
//         throw new Error("Failed to load cameras")
//       }

//       const cameraData = await response.json()
//       console.log("[v0] Loaded cameras:", cameraData)
//       setCameras(cameraData)

//       cameraData.forEach((camera: Camera) => {
//         if (camera.status === "online" || camera.status === "recording") {
//           startCameraStream(camera)
//         }
//       })
//     } catch (error) {
//       console.error("[v0] Error loading cameras:", error)
//       const mockCameras: Camera[] = [
//         {
//           id: "1",
//           name: "Front Entrance",
//           location: "Main Building",
//           status: "online",
//           thumbnail: "/placeholder.svg?height=180&width=320",
//           resolution: "1080p",
//           lastActive: "2 min ago",
//           ipAddress: "192.168.1.100",
//           port: "554",
//           username: "admin",
//         },
//         {
//           id: "2",
//           name: "Parking Lot A",
//           location: "North Side",
//           status: "recording",
//           thumbnail: "/placeholder.svg?height=180&width=320",
//           resolution: "4K",
//           lastActive: "Live",
//           ipAddress: "192.168.1.101",
//           port: "554",
//           username: "admin",
//         },
//         {
//           id: "3",
//           name: "Reception Area",
//           location: "Lobby",
//           status: "online",
//           thumbnail: "/placeholder.svg?height=180&width=320",
//           resolution: "1080p",
//           lastActive: "1 min ago",
//           ipAddress: "192.168.1.102",
//           port: "554",
//           username: "admin",
//         },
//         {
//           id: "4",
//           name: "Server Room",
//           location: "Basement",
//           status: "offline",
//           thumbnail: "/placeholder.svg?height=180&width=320",
//           resolution: "720p",
//           lastActive: "1 hour ago",
//           ipAddress: "192.168.1.103",
//           port: "554",
//           username: "admin",
//         },
//         {
//           id: "5",
//           name: "Loading Dock",
//           location: "Warehouse",
//           status: "online",
//           thumbnail: "/placeholder.svg?height=180&width=320",
//           resolution: "1080p",
//           lastActive: "30 sec ago",
//           ipAddress: "192.168.1.104",
//           port: "554",
//           username: "admin",
//         },
//         {
//           id: "6",
//           name: "Conference Room B",
//           location: "2nd Floor",
//           status: "recording",
//           thumbnail: "/placeholder.svg?height=180&width=320",
//           resolution: "4K",
//           lastActive: "Live",
//           ipAddress: "192.168.1.105",
//           port: "554",
//           username: "admin",
//         },
//       ]
//       setCameras(mockCameras)
//     } finally {
//       setIsLoading(false)
//     }
//   }

// }