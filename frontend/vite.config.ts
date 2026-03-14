import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import JavaScriptObfuscator from "javascript-obfuscator";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const isProd = mode === 'production';

  return {
    server: {
      host: "::",
      port: 5173,
      proxy: {
        '/api': {
          target: 'http://localhost:5001',
          changeOrigin: true,
          secure: false,
          ws: true,
        },
      },
    },
    plugins: [
      react(),
      mode === 'development' && componentTagger(),
      isProd && {
        name: 'js-obfuscator',
        renderChunk(code: string, chunk: { fileName: string; name: string }) {
          if (!chunk.fileName.endsWith('.js')) return null;
          // Skip third-party vendor chunks — obfuscating Firebase/React breaks auth
          const vendorChunks = ['vendor', 'router', 'ui', 'icons', 'utils'];
          if (vendorChunks.includes(chunk.name)) return null;
          const result = JavaScriptObfuscator.obfuscate(code, {
            compact: true,
            controlFlowFlattening: false,
            deadCodeInjection: false,
            debugProtection: false,
            disableConsoleOutput: true,
            identifierNamesGenerator: 'hexadecimal',
            log: false,
            renameGlobals: false,
            rotateStringArray: true,
            selfDefending: false,
            shuffleStringArray: true,
            splitStrings: false,
            stringArray: true,
            stringArrayCallsTransform: true,
            stringArrayEncoding: ['base64'],
            stringArrayIndexShift: true,
            stringArrayThreshold: 0.75,
            unicodeEscapeSequence: false,
          });
          return { code: result.getObfuscatedCode() };
        },
      },
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    define: {
      __API_BASE_URL__: JSON.stringify(env.VITE_API_BASE_URL || ''),
    },
    build: {
      target: 'esnext',
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true,
          pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.warn'],
        },
        mangle: {
          toplevel: true,
        },
        format: {
          comments: false,
        },
      },
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
            router: ['react-router-dom'],
            ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-toast'],
            icons: ['lucide-react'],
            utils: ['date-fns', 'clsx', 'tailwind-merge'],
          },
          // Hash-only names — no readable file paths exposed
          chunkFileNames: 'js/[hash].js',
          entryFileNames: 'js/[hash].js',
          assetFileNames: (assetInfo) => {
            if (!assetInfo.name) return 'assets/[hash].[ext]';
            if (/\.css$/.test(assetInfo.name)) return 'css/[hash].css';
            return 'assets/[hash].[ext]';
          },
        },
      },
      // Disable source maps in production — never expose original source
      sourcemap: false,
      cssCodeSplit: true,
      chunkSizeWarningLimit: 1000,
    },
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-router-dom',
        'lucide-react',
        '@radix-ui/react-dialog',
        '@radix-ui/react-dropdown-menu',
        '@radix-ui/react-toast',
      ],
    },
    preview: {
      port: 4173,
    },
  };
});
