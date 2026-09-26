import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],

  server: {
    headers: {
      // Prevent clickjacking
      "X-Frame-Options": "DENY",
      // Prevent MIME sniffing
      "X-Content-Type-Options": "nosniff",
      // XSS protection (legacy browsers)
      "X-XSS-Protection": "1; mode=block",
      // Referrer policy
      "Referrer-Policy": "strict-origin-when-cross-origin",
      // Content Security Policy
      "Content-Security-Policy": [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com https://*.firebaseapp.com https://*.googleapis.com",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "font-src 'self' https://fonts.gstatic.com",
        "img-src 'self' data: blob: https: http:",
        "connect-src 'self' https://*.googleapis.com https://*.firebaseio.com https://*.firebaseapp.com wss://*.firebaseio.com",
        "frame-src 'self' https://*.firebaseapp.com https://accounts.google.com",
        "object-src 'none'",
        "base-uri 'self'",
      ].join("; "),
      // Permissions Policy — disable unused browser features
      "Permissions-Policy":
        "camera=(), microphone=(), geolocation=(), payment=()",
    },
  },

  // Same headers for preview server
  preview: {
    headers: {
      "X-Frame-Options": "DENY",
      "X-Content-Type-Options": "nosniff",
      "X-XSS-Protection": "1; mode=block",
      "Referrer-Policy": "strict-origin-when-cross-origin",
      "Permissions-Policy":
        "camera=(), microphone=(), geolocation=(), payment=()",
    },
  },
});
