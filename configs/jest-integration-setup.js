const { execSync } = require('child_process');

module.exports = async () => {
  console.log('Running database reset for integration tests...');
  execSync('node scripts/reset.js --reset', { stdio: 'inherit', env: process.env });
};
