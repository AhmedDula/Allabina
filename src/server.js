import app from "./app.js";
import { connectDB } from "./config/db.js";
import { env } from "./config/env.js";



// Handle unexpected errors before app starts
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err.message);
  process.exit(1);
});

// Connect to DB then start server
connectDB().then(() => {
  const server = app.listen(env.app.port, () => {
    console.log(`Server running on port ${env.app.port} [${env.app.nodeEnv}]`);
  });

  // Handle unhandled promise rejections
  process.on("unhandledRejection", (err) => {
    console.error("Unhandled Rejection:", err.message);
    server.close(() => process.exit(1));
  });
});