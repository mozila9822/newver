const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function diagnose() {
  console.log('🔍 Running MySQL Database Diagnostics...\n');
  
  // 1. Check if mysql2 is installed
  console.log('1. Checking mysql2 package...');
  try {
    require.resolve('mysql2');
    console.log('   ✅ mysql2 is installed\n');
  } catch (e) {
    console.log('   ❌ mysql2 is NOT installed. Run: npm install mysql2\n');
    return;
  }
  
  // 2. Check if dist/index.cjs exists
  console.log('2. Checking build files...');
  const distPath = path.join(__dirname, 'dist', 'index.cjs');
  if (fs.existsSync(distPath)) {
    const stats = fs.statSync(distPath);
    console.log(`   ✅ dist/index.cjs exists (${(stats.size / 1024 / 1024).toFixed(2)} MB)\n`);
  } else {
    console.log('   ❌ dist/index.cjs not found. Run: npm run build\n');
  }
  
  // 3. Test database connection
  console.log('3. Testing database connection...');
  try {
    const connection = await mysql.createConnection({
      host: 'mysql-200-131.mysql.prositehosting.net',
      user: 'voyageruser12',
      password: '19982206m.M',
      database: 'ocidb_01Raay53dC',
      connectTimeout: 10000
    });
    console.log('   ✅ Database connection successful\n');
    
    // Test query
    const [rows] = await connection.execute('SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = ?', ['ocidb_01Raay53dC']);
    console.log(`   ✅ Database accessible. Found ${rows[0].count} tables\n`);
    
    // Check if key tables exist
    const [tables] = await connection.execute(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'ocidb_01Raay53dC' 
      ORDER BY table_name
    `);
    
    const requiredTables = ['trips', 'hotels', 'cars', 'bookings', 'reviews', 'users'];
    const existingTables = tables.map(t => t.table_name);
    
    console.log('   📋 Checking required tables:');
    requiredTables.forEach(table => {
      if (existingTables.includes(table)) {
        console.log(`      ✅ ${table}`);
      } else {
        console.log(`      ❌ ${table} - MISSING!`);
      }
    });
    console.log('');
    
    await connection.end();
  } catch (error) {
    console.log('   ❌ Database connection failed:');
    console.log(`      Error: ${error.message}\n`);
    console.log('   Possible causes:');
    console.log('      - Network connectivity issues');
    console.log('      - Firewall blocking MySQL port (3306)');
    console.log('      - Incorrect credentials');
    console.log('      - Database server is down');
    console.log('      - Database does not allow remote connections\n');
  }
  
  // 4. Check environment
  console.log('4. Checking environment...');
  console.log(`   NODE_ENV: ${process.env.NODE_ENV || 'not set (should be "production" for deployment)'}`);
  console.log(`   PORT: ${process.env.PORT || '5000 (default)'}\n`);
  
  // 5. Check node_modules
  console.log('5. Checking dependencies...');
  const nodeModulesPath = path.join(__dirname, 'node_modules', 'mysql2');
  if (fs.existsSync(nodeModulesPath)) {
    console.log('   ✅ mysql2 found in node_modules\n');
  } else {
    console.log('   ⚠️  mysql2 not in node_modules. Run: npm install\n');
  }
  
  console.log('✅ Diagnostics complete!\n');
  console.log('📝 Next steps:');
  console.log('   1. If database connection failed, check network/firewall');
  console.log('   2. If tables are missing, the server will create them on startup');
  console.log('   3. Start server with: npm start');
  console.log('   4. Check server logs for database initialization messages\n');
}

diagnose().catch(console.error);

