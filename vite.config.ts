import { defineConfig } from "vite";
import preact from "@preact/preset-vite";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";

export default defineConfig({
  // @preact/preset-vite already aliases react / react-dom / react/jsx-runtime
  // to preact/compat, which is what lets shadcn + Radix run on Preact.
  plugins: [preact(), tailwindcss()],
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
  server: {
    // Lets the ngrok tunnel (mobile testing, see docs/ if this sticks around)
    // reach the dev server — Vite blocks unrecognized Host headers by default.
    allowedHosts: ["unframed-kindness-selection.ngrok-free.dev"],
  },
});
