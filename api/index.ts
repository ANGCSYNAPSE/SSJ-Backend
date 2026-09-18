import { createApp } from "../src/app";

// Vercel serverless entry point — wraps the Express app so every request
// (routed here via vercel.json rewrites) is handled by the same app used
// in local dev/server.ts, minus the app.listen() call.
export default createApp();
