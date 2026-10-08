import { createServer } from 'vite';

async function start() {
  try {
    const server = await createServer({
      configFile: './vite.config.js',
      server: {
        port: 3000,
        host: true
      }
    });
    await server.listen();
    console.log('\n🌿 BestGrassFedCattle Client Dev Server running at:');
    server.printUrls();
    console.log('🔗 Proxying /api to http://localhost:5000\n');
  } catch (err) {
    console.error('Failed to start Vite dev server:', err);
    process.exit(1);
  }
}

start();
