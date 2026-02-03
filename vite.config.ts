import { defineConfig } from 'vite';

export default defineConfig({
    build: {
        chunkSizeWarningLimit: 1500, // Increase limit to 1500kB
        rollupOptions: {
            output: {
                manualChunks: {
                    phaser: ['phaser'] // Split Phaser into its own chunk
                }
            }
        }
    }
});
