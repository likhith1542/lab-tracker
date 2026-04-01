import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Set VITE_BASE_PATH env var if deploying to a GitHub Pages repo sub-path
// e.g. VITE_BASE_PATH=/lab-tracker/ for github.com/user/lab-tracker
const base = process.env.VITE_BASE_PATH || "/";

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
