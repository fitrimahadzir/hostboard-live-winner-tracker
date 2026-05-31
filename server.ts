import express from "express";
import path from "path";
import multer from "multer";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { createServer as createViteServer } from "vite";
import fs from "fs";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware for parsing JSON and URL-encoded bodies
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // API Health Check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", time: new Date().toISOString() });
  });

  // Setup multer
  const storage = multer.memoryStorage();
  const upload = multer({ 
    storage, 
    limits: { fileSize: 5 * 1024 * 1024 } 
  });

  // API Routes
  app.post("/api/upload-avatar", upload.single("avatar"), async (req, res) => {
    console.log("POST /api/upload-avatar request received");
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const bucketName = process.env.CLOUDFLARE_R2_BUCKET_NAME;
      const publicUrl = process.env.CLOUDFLARE_R2_PUBLIC_URL;

      if (!bucketName || !publicUrl) {
        throw new Error("Missing Cloudflare R2 bucket configuration.");
      }

      // Configure S3 Client for Cloudflare R2
      let accountId = process.env.CLOUDFLARE_R2_ACCOUNT_ID || "";
      const accessKeyId = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID;
      const secretAccessKey = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY;

      accountId = accountId.replace(/^https?:\/\//i, "").replace(/\/+$/, "").trim();
      if (accountId.includes('.r2.cloudflarestorage.com')) {
        accountId = accountId.split('.r2.cloudflarestorage.com')[0];
      }

      if (!accountId || !accessKeyId || !secretAccessKey) {
        throw new Error("Invalid or missing Cloudflare R2 credentials.");
      }

      const s3Client = new S3Client({
        region: "auto",
        endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
        forcePathStyle: true,
        credentials: {
          accessKeyId,
          secretAccessKey,
        },
      });

      const file = req.file;
      const fileExtension = file.originalname.split('.').pop()?.toLowerCase() || 'jpg';
      const filename = `avatars/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExtension}`;

      await s3Client.send(new PutObjectCommand({
        Bucket: bucketName,
        Key: filename,
        Body: file.buffer,
        ContentType: file.mimetype,
      }));

      let baseUrl = publicUrl.trim();
      if (baseUrl.endsWith('/')) baseUrl = baseUrl.slice(0, -1);
      if (!baseUrl.startsWith('http')) baseUrl = `https://${baseUrl}`;

      const finalUrl = `${baseUrl}/${filename}`;
      res.json({ url: finalUrl });
    } catch (error: any) {
      console.error("Upload Error:", error);
      res.status(500).json({ error: error.message || "Failed to upload avatar" });
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
    }
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Catch-all for any other requests that weren't handled
  app.use((req, res) => {
    console.log(`404 Not Found: ${req.method} ${req.url}`);
    res.status(404).json({ error: `Route ${req.method} ${req.url} not found` });
  });

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
