export const createSidebarActions = () => {
  const handleSaveBug = () => {
    console.log("Save bug clicked")
    // Add save bug logic here
  }

  const handleDashboard = () => {
    console.log("Dashboard clicked")
    // Add dashboard navigation logic here
  }

  const handleBugSummary = () => {
    console.log("Bug summary clicked")
    // Add bug summary logic here
  }

  return {
    handleSaveBug,
    handleDashboard,
    handleBugSummary,
  }
}
