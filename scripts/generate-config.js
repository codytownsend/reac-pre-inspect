// scripts/generate-config.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to the public directory
const publicDir = path.join(__dirname, '../public');

// Ensure the public directory exists
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Create the config content using environment variables
const configContent = `// This file is auto-generated during the build process
// Do not edit it directly

window.FIREBASE_CONFIG = {
  apiKey: "${process.env.VITE_FIREBASE_API_KEY || ''}",
  authDomain: "${process.env.VITE_FIREBASE_AUTH_DOMAIN || ''}",
  projectId: "${process.env.VITE_FIREBASE_PROJECT_ID || ''}",
  storageBucket: "${process.env.VITE_FIREBASE_STORAGE_BUCKET || ''}",
  messagingSenderId: "${process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || ''}",
  appId: "${process.env.VITE_FIREBASE_APP_ID || ''}"
};

console.log('Firebase configuration loaded');
`;

// Write the config file
const configPath = path.join(publicDir, 'config.js');
fs.writeFileSync(configPath, configContent);

console.log(`Firebase config generated at ${configPath}`);