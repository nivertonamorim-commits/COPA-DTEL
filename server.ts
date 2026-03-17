import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "50mb" }));

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Mock database for leads
  const leads: any[] = [];

  app.post("/api/leads", (req, res) => {
    const { name, phone, city } = req.body;
    if (!name || !phone || !city) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    const lead = { id: Date.now(), name, phone, city, createdAt: new Date() };
    leads.push(lead);
    console.log("New lead captured:", lead);
    res.status(201).json({ success: true, leadId: lead.id });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
