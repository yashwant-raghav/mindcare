import { spawn } from 'child_process';

console.log("[MindCare Dev] Starting Flask backend on http://localhost:5001...");
const backend = spawn('py', ['app.py'], { stdio: 'inherit', shell: true });

console.log("[MindCare Dev] Starting Vite frontend on http://localhost:3000...");
const frontend = spawn('npx', ['vite', '--port', '3000'], { stdio: 'inherit', shell: true });

const cleanup = () => {
  console.log("\n[MindCare Dev] Shutting down backend and frontend servers...");
  backend.kill();
  frontend.kill();
  process.exit();
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
process.on('exit', cleanup);
