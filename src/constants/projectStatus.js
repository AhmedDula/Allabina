export const PROJECT_STATUS = {
  DRAFT: "draft",           // Project created but not published yet
  PENDING: "pending",       // Published, waiting for admin approval
  OPEN: "open",             // Approved, accepting proposals
  IN_PROGRESS: "in_progress", // Freelancer assigned, work started
  COMPLETED: "completed",   // Work finished, payment released
  CANCELLED: "cancelled",   // Cancelled by client or admin
  CLOSED: "closed",         // Closed (no longer accepting proposals)
};
