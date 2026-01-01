import { defineConfig } from 'vite';

export default defineConfig({
    build: {
        lib: {
            entry: 'src/main.ts',
            name: 'SupportWidget',
            fileName: 'widget',
            formats: ['iife'],
        },
        rollupOptions: {
            output: {
                // Ensure single file output
                inlineDynamicImports: true,
            },
        },
        // Target small bundle size
        minify: 'terser',
        terserOptions: {
            compress: {
                drop_console: true,
            },
        },
    },
    define: {
        'process.env.NODE_ENV': JSON.stringify('production'),
    },
});
