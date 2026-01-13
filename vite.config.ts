import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react-swc";
import { defineConfig, PluginOption } from "vite";
import { resolve } from 'path'

// Import Spark plugins only if needed
let sparkPlugins: PluginOption[] = []
if (process.env.USE_SPARK_PLUGINS === 'true') {
  try {
    const sparkVitePlugin = require("@github/spark/spark-vite-plugin").default
    const createIconImportProxy = require("@github/spark/vitePhosphorIconProxyPlugin").default
    sparkPlugins = [
      createIconImportProxy() as PluginOption,
      sparkVitePlugin() as PluginOption,
    ]
  } catch (e) {
    console.warn('Spark plugins not available')
  }
}

const projectRoot = process.env.PROJECT_ROOT || import.meta.dirname

// https://vite.dev/config/
export default defineConfig({
  base: process.env.NODE_ENV === 'production' ? '/gestione-studio-carl/' : '/',
  plugins: [
    react(),
    tailwindcss(),
    ...sparkPlugins,
  ],
  resolve: {
    alias: {
      '@': resolve(projectRoot, 'src')
    }
  },
});
