#!/usr/bin/env node

/**
 * VoyagerLuxury - Automated Startup Script
 * This script ensures everything is set up correctly before starting the server
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logStep(step, message) {
  log(`\n[${step}] ${message}`, 'cyan');
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

// Check if command exists
function commandExists(command) {
  try {
    execSync(`which ${command}`, { stdio: 'ignore' });
    return true;
  } catch {
    try {
      execSync(`where ${command}`, { stdio: 'ignore' });
      return true;
    } catch {
      return false;
    }
  }
}

// Check Node.js version
function checkNodeVersion() {
  logStep('1', 'Checking Node.js version...');
  try {
    const version = execSync('node --version', { encoding: 'utf-8' }).trim();
    const majorVersion = parseInt(version.replace('v', '').split('.')[0]);
    
    if (majorVersion >= 20) {
      logSuccess(`Node.js ${version} detected`);
      return true;
    } else {
      logError(`Node.js ${version} detected. Requires Node.js 20 or higher.`);
      logInfo('Please upgrade Node.js: https://nodejs.org/');
      return false;
    }
  } catch (error) {
    logError('Node.js not found. Please install Node.js 20+ from https://nodejs.org/');
    return false;
  }
}

// Check if package.json exists
function checkPackageJson() {
  logStep('2', 'Checking project files...');
  if (!fs.existsSync('package.json')) {
    logError('package.json not found. Are you in the correct directory?');
    return false;
  }
  logSuccess('package.json found');
  return true;
}

// Check and install dependencies
async function checkDependencies() {
  logStep('3', 'Checking dependencies...');
  
  const nodeModulesExists = fs.existsSync('node_modules');
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
  const requiredDeps = ['mysql2', 'express', 'react', 'react-dom'];
  
  let needsInstall = false;
  
  if (!nodeModulesExists) {
    logWarning('node_modules not found');
    needsInstall = true;
  } else {
    // Check for critical dependencies
    for (const dep of requiredDeps) {
      const depPath = path.join('node_modules', dep);
      if (!fs.existsSync(depPath)) {
        logWarning(`${dep} not found in node_modules`);
        needsInstall = true;
        break;
      }
    }
  }
  
  if (needsInstall) {
    logInfo('Installing dependencies...');
    try {
      execSync('npm install', { stdio: 'inherit' });
      logSuccess('Dependencies installed successfully');
    } catch (error) {
      logError('Failed to install dependencies');
      logError(error.message);
      return false;
    }
  } else {
    logSuccess('All dependencies are installed');
  }
  
  return true;
}

// Test MySQL connection
async function testDatabaseConnection() {
  logStep('4', 'Testing MySQL database connection...');
  
  // Load mysql2 dynamically (it should be installed by now)
  let mysql;
  try {
    mysql = require('mysql2/promise');
  } catch (e) {
    logError('mysql2 package not found. It should have been installed in step 3.');
    logInfo('Please run: npm install mysql2');
    return false;
  }
  
  const dbConfig = {
    host: 'mysql-200-131.mysql.prositehosting.net',
    user: 'voyageruser12',
    password: '19982206m.M',
    database: 'ocidb_01Raay53dC',
    connectTimeout: 15000,
  };
  
  try {
    logInfo('Attempting to connect to database...');
    const connection = await mysql.createConnection(dbConfig);
    
    // Test query
    await connection.execute('SELECT 1 as test');
    logSuccess('Database connection successful');
    
    // Check if database exists and has tables
    const [tables] = await connection.execute(`
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_schema = ?
    `, [dbConfig.database]);
    
    logInfo(`Database has ${tables[0].count} tables`);
    
    // Check for required tables
    const [requiredTables] = await connection.execute(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = ? 
      AND table_name IN ('trips', 'hotels', 'cars', 'bookings', 'reviews', 'users')
    `, [dbConfig.database]);
    
    const foundTables = requiredTables.map(t => t.table_name);
    const allRequired = ['trips', 'hotels', 'cars', 'bookings', 'reviews', 'users'];
    const missingTables = allRequired.filter(t => !foundTables.includes(t));
    
    if (missingTables.length > 0) {
      logWarning(`Some tables are missing: ${missingTables.join(', ')}`);
      logInfo('Tables will be created automatically on server startup');
    } else {
      logSuccess('All required tables exist');
    }
    
    await connection.end();
    return true;
  } catch (error) {
    logError('Database connection failed!');
    logError(`Error: ${error.message}`);
    logWarning('The server will still start, but database features may not work.');
    logInfo('Please check:');
    logInfo('  - Database server is running');
    logInfo('  - Network connectivity to MySQL server');
    logInfo('  - Firewall rules allow MySQL connections (port 3306)');
    logInfo('  - Database credentials are correct');
    return false;
  }
}

// Check if build exists
function checkBuild() {
  logStep('5', 'Checking production build...');
  
  const distPath = path.join('dist', 'index.cjs');
  const publicPath = path.join('dist', 'public', 'index.html');
  
  if (fs.existsSync(distPath) && fs.existsSync(publicPath)) {
    const stats = fs.statSync(distPath);
    logSuccess(`Production build found (${(stats.size / 1024 / 1024).toFixed(2)} MB)`);
    return true;
  } else {
    logWarning('Production build not found');
    return false;
  }
}

// Build the project
function buildProject() {
  logStep('6', 'Building project for production...');
  
  try {
    logInfo('This may take a few minutes...');
    execSync('npm run build', { stdio: 'inherit' });
    logSuccess('Build completed successfully');
    return true;
  } catch (error) {
    logError('Build failed!');
    logError('Please check the error messages above');
    return false;
  }
}

// Start the server
function startServer() {
  logStep('7', 'Starting server...');
  
  const isProduction = process.env.NODE_ENV === 'production' || fs.existsSync('dist');
  
  if (isProduction && fs.existsSync('dist/index.cjs')) {
    logInfo('Starting production server...');
    logInfo('Server will be available at http://localhost:5000');
    logInfo('Press Ctrl+C to stop the server\n');
    
    const server = spawn('node', ['dist/index.cjs'], {
      stdio: 'inherit',
      env: { ...process.env, NODE_ENV: 'production' }
    });
    
    server.on('error', (error) => {
      logError(`Failed to start server: ${error.message}`);
      process.exit(1);
    });
    
    server.on('exit', (code) => {
      if (code !== 0 && code !== null) {
        logError(`Server exited with code ${code}`);
      }
    });
    
    // Handle graceful shutdown
    process.on('SIGINT', () => {
      log('\n\nShutting down server...', 'yellow');
      server.kill('SIGINT');
      process.exit(0);
    });
    
    process.on('SIGTERM', () => {
      log('\n\nShutting down server...', 'yellow');
      server.kill('SIGTERM');
      process.exit(0);
    });
    
    return server;
  } else {
    logInfo('Starting development server...');
    logInfo('Server will be available at http://localhost:5000');
    logInfo('Press Ctrl+C to stop the server\n');
    
    const server = spawn('npm', ['run', 'dev'], {
      stdio: 'inherit',
      shell: true
    });
    
    server.on('error', (error) => {
      logError(`Failed to start server: ${error.message}`);
      process.exit(1);
    });
    
    // Handle graceful shutdown
    process.on('SIGINT', () => {
      log('\n\nShutting down server...', 'yellow');
      server.kill('SIGINT');
      process.exit(0);
    });
    
    process.on('SIGTERM', () => {
      log('\n\nShutting down server...', 'yellow');
      server.kill('SIGTERM');
      process.exit(0);
    });
    
    return server;
  }
}

// Main execution
async function main() {
  log('\n' + '='.repeat(60), 'cyan');
  log('  VoyagerLuxury - Automated Startup Script', 'cyan');
  log('='.repeat(60) + '\n', 'cyan');
  
  // Step 1: Check Node.js
  if (!checkNodeVersion()) {
    process.exit(1);
  }
  
  // Step 2: Check package.json
  if (!checkPackageJson()) {
    process.exit(1);
  }
  
  // Step 3: Check and install dependencies
  if (!(await checkDependencies())) {
    process.exit(1);
  }
  
  // Step 4: Test database connection
  const dbConnected = await testDatabaseConnection();
  if (!dbConnected) {
    logWarning('Continuing despite database connection issues...');
    logWarning('The server will attempt to connect on startup');
  }
  
  // Step 5 & 6: Check and build if needed
  const buildExists = checkBuild();
  if (!buildExists) {
    logInfo('Building project for production...');
    if (!buildProject()) {
      logError('Cannot start server without a successful build');
      process.exit(1);
    }
  }
  
  // Step 7: Start server
  log('\n' + '='.repeat(60), 'green');
  log('  All checks passed! Starting server...', 'green');
  log('='.repeat(60) + '\n', 'green');
  
  startServer();
}

// Run the script
main().catch((error) => {
  logError('Fatal error during startup:');
  logError(error.message);
  console.error(error);
  process.exit(1);
});

