import { type Express } from "express";
import { createServer as createViteServer, createLogger } from "vite";
import { type Server } from "http";
import viteConfig from "../vite.config";
import fs from "fs";
import path from "path";
import { nanoid } from "nanoid";

const viteLogger = createLogger();

export async function setupVite(server: Server, app: Express) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server, path: "/lantern/vite-hmr" },
    allowedHosts: true as const,
  };

  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      },
    },
    server: serverOptions,
    appType: "custom",
  });

  // Mount vite.middlewares on root
  app.use(vite.middlewares);

  app.use(async (req, res, next) => {
    const url = req.originalUrl || req.url;
    const pathName = req.path;

    // Check if it's an API request
    if (url.startsWith("/api")) {
      return next();
    }

    // Strict asset check: If it has an extension or is a Vite internal path, 
    // it MUST be handled by Vite or fall through to static serving.
    const hasExtension = path.extname(pathName) !== "";
    const isViteInternal =
      pathName.includes("@vite") ||
      pathName.includes("@fs") ||
      pathName.includes("/src/") ||
      pathName.includes("/node_modules/") ||
      pathName.includes("vite-hmr") ||
      pathName.startsWith("/lantern/src/") ||
      pathName.startsWith("/lantern/node_modules/");

    if (hasExtension || isViteInternal) {
      // Ensure we don't accidentally serve HTML for these
      return next();
    }

    // Only handle HTML requests for navigation starting with /lantern
    if (!url.startsWith("/lantern")) {
      return next();
    }

    try {
      const clientTemplate = path.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html",
      );

      let template = await fs.promises.readFile(clientTemplate, "utf-8");

      // Transform HTML using Vite (handles base path and module script transformation)
      // Always use the base /lantern/ for transformation to ensure consistent asset resolution on subroutes
      const page = await vite.transformIndexHtml("/lantern/", template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}
