/**
 * Feature flags for controlling optional features
 * Set to false to disable resource-intensive demo features in production
 */

export const FEATURE_FLAGS = {
  // Enable notifications polling (can be disabled to improve performance)
  ENABLE_NOTIFICATION_POLLING: false,
  
  // Enable presence tracking simulation (disable in production)
  ENABLE_PRESENCE_SIMULATION: false,
  
  // Enable live editing simulation (disable in production)
  ENABLE_LIVE_EDITING_SIMULATION: false,
  
  // Enable activity stream simulation (disable in production)
  ENABLE_ACTIVITY_SIMULATION: false,
};

// Check if we're in production
export const isProduction = process.env.NODE_ENV === "production";

// Auto-disable demo features in production
if (isProduction) {
  FEATURE_FLAGS.ENABLE_PRESENCE_SIMULATION = false;
  FEATURE_FLAGS.ENABLE_LIVE_EDITING_SIMULATION = false;
  FEATURE_FLAGS.ENABLE_ACTIVITY_SIMULATION = false;
}
