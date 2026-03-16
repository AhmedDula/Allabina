import { v4 as uuidv4 } from "uuid";

// Generate a unique idempotency key for financial operations
export const generateIdempotencyKey = () => uuidv4();

// Validate idempotency key format
export const isValidIdempotencyKey = (key) => {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(key);
};