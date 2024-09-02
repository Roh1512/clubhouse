import { defineConfig, UserConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(
  (configEnv: { mode: string }): UserConfig => ({
    plugins: [react()],
    server:
      configEnv.mode === "development"
        ? {
            proxy: {
              "/api": {
                target: "http://localhost:3000",
                secure: false,
              },
            },
          }
        : {},
  })
);
