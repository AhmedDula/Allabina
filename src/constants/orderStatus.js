export const ORDER_STATUS = {
  PENDING: "pending",       // Order created, waiting for payment
  ACTIVE: "active",         // Payment confirmed, work in progress
  DELIVERED: "delivered",   // Freelancer submitted delivery
  COMPLETED: "completed",   // Client accepted delivery
  CANCELLED: "cancelled",   // Order cancelled before active
  DISPUTED: "disputed",     // Dispute raised
  REFUNDED: "refunded",     // Order refunded
};