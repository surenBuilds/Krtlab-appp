import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import geminiRoutes from "./server/routes/gemini";
import { requestLogger } from "./server/middleware/logger";
import { errorHandler } from "./server/middleware/errorHandler";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === "production";

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(requestLogger);
app.use("/api/gemini", geminiRoutes);
app.use(errorHandler);

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", version: "2.0.0-growth-os", timestamp: new Date().toISOString() });
});

if (isProduction) {
  const distPath = path.resolve(import.meta.dirname || __dirname, "dist");
  app.use(express.static(distPath));
  app.get("*", (_req, res) => { res.sendFile(path.join(distPath, "index.html")); });
  app.listen(PORT, () => { console.log("KrtLab Growth OS on http://localhost:" + PORT); });
} else {
  const startDevServer = async () => {
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: "spa" });
    app.use(vite.middlewares);
    app.listen(PORT, () => { console.log("KrtLab Growth OS dev on http://localhost:" + PORT); });
  };
  startDevServer();
}