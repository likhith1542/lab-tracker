import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// VITE_BASE=/ for subdomain (root)
// VITE_BASE=/lab-tracker/ for GitHub Pages repo subpath
const base = process.env.VITE_BASE || "/";

export default defineConfig({
    base,
    plugins: [react()],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
    build: {
        outDir: "dist",
        emptyOutDir: true,
    },
    server: {
        port: 3000,
    },
});
