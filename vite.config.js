/* eslint-disable import/no-extraneous-dependencies */
import path from "path"
import { defineConfig } from "vite"

export default defineConfig({
    root: "src",
    server: {
        port: 3000,
        strictPort: true,
    },
    build: {
        outDir: path.join(__dirname, "dist"),
        emptyOutDir: true,
    },
})
