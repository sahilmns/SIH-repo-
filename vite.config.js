import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],

  preview: {
    allowedHosts: ["niyamdrishti-fw1j.onrender.com"],
  },
});
