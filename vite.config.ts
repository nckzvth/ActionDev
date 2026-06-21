import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { cwd } from "node:process";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, cwd(), "");
  return {
    base: env.VITE_APP_BASE_URL || "/",
    plugins: [...react(), ...tailwindcss()],
    build: {
      sourcemap: true,
      target: "es2022",
    },
  };
});
