const localtunnel = require('localtunnel');

// Get any command line arguments
const args = process.argv.slice(2);
const subdomain = args[0] || 'mock-ase-bank';

async function startTunnel() {
  console.log('Starting localtunnel...');
  
  try {
    const tunnel = await localtunnel({ 
      port: 3000,
      subdomain: subdomain,
      host: 'https://localtunnel.me',
      local_https: false, // Set to true if you're running HTTPS locally
      allow_invalid_cert: true,
      headers: {
        'bypass-tunnel-reminder': true
      }
    });

    console.log(`✅ Tunnel established! App available at: ${tunnel.url}`);
    
    tunnel.on('close', () => {
      console.log('Tunnel closed');
      process.exit(1);
    });

    // Handle errors
    tunnel.on('error', (err) => {
      console.error(`❌ Error in tunnel: ${err}`);
      process.exit(1);
    });
    
    // Keep the process running
    process.on('SIGINT', () => {
      console.log('Closing tunnel...');
      tunnel.close();
      process.exit(0);
    });

  } catch (error) {
    console.error(`❌ Failed to establish tunnel: ${error.message}`);
    process.exit(1);
  }
}

startTunnel();
