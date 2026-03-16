// Strips sensitive or internal fields from objects before sending response
export const stripFields = (obj, fields = []) => {
  const result = { ...obj };
  fields.forEach((field) => delete result[field]);
  return result;
};