import "dotenv/config";
import express from "express";
import path from "path";
import fs from "fs";
import { migrate } from "./db";
import { sessionMiddleware } from "./auth";
import { registerRoutes } from "./routes";

migrate();

const app = express();
app.use(express.json());
app.use(sessionMiddleware());

registerRoutes(app);

const distPath = path.resolve(process.cwd(), "dist", "client");
if (process.env.NODE_ENV === "production" && fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get("*", (_req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}

const port = Number(process.env.PORT) || 3001;
app.listen(port, () => {
  console.log(`[shoe-store] API server listening on http://localhost:${port}`);
});
