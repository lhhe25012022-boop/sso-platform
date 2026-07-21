/**
 * Infrastructure configuration validator
 */

const fs = require('fs');
const path = require('path');

const CONFIG_FILES = [
  'docker-compose.yml',
  'kubernetes/deployment.yml',
  'kubernetes/service.yml',
];

const validateConfig = () => {
  console.log('🔍 Validating infrastructure configuration...');

  let errors = 0;

  CONFIG_FILES.forEach(file => {
    const filePath = path.join(__dirname, '..', file);
    if (!fs.existsSync(filePath)) {
      console.error(`❌ Missing: ${file}`);
      errors++;
    } else {
      console.log(`✅ Found: ${file}`);
    }
  });

  if (errors === 0) {
    console.log('\n✨ All configurations valid!');
    process.exit(0);
  } else {
    console.error(`\n❌ ${errors} configuration file(s) missing!`);
    process.exit(1);
  }
};

validateConfig();
