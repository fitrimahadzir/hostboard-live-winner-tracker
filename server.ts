import express from "express";
import path from "path";
import multer from "multer";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { createServer as createViteServer } from "vite";
import fs from "fs";

const app = express();
const PORT = 3000;

// Setup multer for in-memory file handling
const storage = multer.memoryStorage();
const upload = multer({ 
  storage, 
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Configure S3 Client for Cloudflare R2
const getS3Client = () => {
  let accountId = process.env.CLOUDFLARE_R2_ACCOUNT_ID || "";
  const accessKeyId = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY;

  // Clean accountId: remove protocol and trailing slashes if user mistakenly added them
  accountId = accountId.replace(/^https?:\/\//i, "").replace(/\/+$/, "").trim();

  if (!accountId || !accessKeyId || !secretAccessKey || 
      accountId.includes("YOUR") || accessKeyId.includes("YOUR")) {
    throw new Error("Invalid or missing Cloudflare R2 credentials. Please set CLOUDFLARE_R2_ACCOUNT_ID, ACCESS_KEY_ID, and SECRET_ACCESS_KEY in the app settings.");
  }

  return new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });
};

app.post("/api/upload-avatar", upload.single("avatar"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const bucketName = process.env.CLOUDFLARE_R2_BUCKET_NAME;
    const publicUrl = process.env.CLOUDFLARE_R2_PUBLIC_URL;

    if (!bucketName || !publicUrl) {
      return res.status(500).json({ error: "Missing Cloudflare R2 bucket configuration." });
    }

    const file = req.file;
    const fileExtension = file.originalname.split('.').pop()?.toLowerCase() || 'jpg';
    
    // Validate image extension to allow standard formats (simplified safety check)
    if (!['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(fileExtension)) {
       return res.status(400).json({ error: "Invalid file type. Only jpg, png, webp, and gif are allowed." });
    }

    // Since we handle resizing client-side, we directly upload the buffer
    const filename = `avatars/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExtension}`;

    const s3Client = getS3Client();
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: filename,
      Body: file.buffer,
      ContentType: file.mimetype,
    });

    await s3Client.send(command);

    // Format public URL
    const baseUrl = publicUrl.endsWith('/') ? publicUrl.slice(0, -1) : publicUrl;
    const finalUrl = `${baseUrl}/${filename}`;

    res.json({ url: finalUrl });
  } catch (error: any) {
    console.error("Avatar Upload Error:", error);
    res.status(500).json({ error: error.message || "Failed to upload avatar" });
  }
});

async function startServer() {
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
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
