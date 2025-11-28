# Deployment Troubleshooting - MySQL Connection Issues

## Issue: Website not reading from MySQL after deployment

### Common Causes and Solutions

## 1. ✅ Check if mysql2 is installed

The `mysql2` package must be installed in production. Run:

```bash
npm install --production
```

Or install mysql2 specifically:
```bash
npm install mysql2
```

## 2. ✅ Verify Database Connection

Check server logs when starting. You should see:
```
✅ Database connected successfully
✅ Database tables initialized successfully
```

If you see errors, check:
- Database credentials in `server/db.ts`
- Network connectivity to MySQL server
- Firewall rules allowing MySQL connections (port 3306)

## 3. ✅ Check Server Startup Logs

When you start the server with `npm start`, you should see:
```
[express] serving on port 5000
✅ Database connected successfully
✅ Database tables initialized successfully
```

If database connection fails, you'll see:
```
❌ Database connection failed: [error details]
```

## 4. ✅ Verify Database Tables Exist

Connect to your MySQL database and check if tables exist:

```sql
USE ocidb_01Raay53dC;
SHOW TABLES;
```

You should see tables like:
- trips
- hotels
- cars
- last_minute_offers
- bookings
- reviews
- support_tickets
- users
- subscribers
- email_templates
- payment_settings
- etc.

## 5. ✅ Test Database Connection Manually

Create a test file `test-db.js`:

```javascript
const mysql = require('mysql2/promise');

async function test() {
  try {
    const connection = await mysql.createConnection({
      host: 'mysql-200-131.mysql.prositehosting.net',
      user: 'voyageruser12',
      password: '19982206m.M',
      database: 'ocidb_01Raay53dC'
    });
    console.log('✅ Connection successful!');
    const [rows] = await connection.execute('SELECT 1 as test');
    console.log('✅ Query successful:', rows);
    await connection.end();
  } catch (error) {
    console.error('❌ Connection failed:', error);
  }
}

test();
```

Run: `node test-db.js`

## 6. ✅ Check Production Build

After rebuilding, verify the build includes database code:

```bash
# Rebuild
npm run build

# Check if dist/index.cjs exists and has reasonable size (~1MB)
ls -lh dist/index.cjs
```

## 7. ✅ Environment Variables

Make sure you're running in production mode:

```bash
NODE_ENV=production npm start
```

Or set in your `.env` file:
```
NODE_ENV=production
```

## 8. ✅ Check Node.js Version

MySQL2 requires Node.js 14+. Verify:

```bash
node --version
```

Should be 20+ for best compatibility.

## 9. ✅ Network/Firewall Issues

If deploying to a different server:
- Ensure the server can reach `mysql-200-131.mysql.prositehosting.net:3306`
- Check firewall rules
- Verify MySQL server allows remote connections
- Check if your hosting provider blocks outbound MySQL connections

## 10. ✅ Rebuild and Redeploy

If issues persist, rebuild and redeploy:

```bash
# Clean build
rm -rf dist node_modules
npm install
npm run build

# Test locally first
npm start

# Then deploy
```

## Quick Diagnostic Script

Create `diagnose.js`:

```javascript
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function diagnose() {
  console.log('🔍 Running diagnostics...\n');
  
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
    console.log(`   ✅ dist/index.cjs exists (${(stats.size / 1024).toFixed(2)} KB)\n`);
  } else {
    console.log('   ❌ dist/index.cjs not found. Run: npm run build\n');
    return;
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
    
    await connection.end();
  } catch (error) {
    console.log('   ❌ Database connection failed:');
    console.log(`      Error: ${error.message}\n`);
    console.log('   Possible causes:');
    console.log('      - Network connectivity issues');
    console.log('      - Firewall blocking MySQL port (3306)');
    console.log('      - Incorrect credentials');
    console.log('      - Database server is down\n');
  }
  
  // 4. Check environment
  console.log('4. Checking environment...');
  console.log(`   NODE_ENV: ${process.env.NODE_ENV || 'not set'}`);
  console.log(`   PORT: ${process.env.PORT || '5000 (default)'}\n`);
  
  console.log('✅ Diagnostics complete!');
}

diagnose().catch(console.error);
```

Run: `node diagnose.js`

## Still Having Issues?

1. **Check server logs** - Look for error messages when starting
2. **Test API endpoints** - Try accessing `/api/trips` to see if data loads
3. **Check browser console** - Look for frontend errors
4. **Verify database** - Connect directly to MySQL and check data exists
5. **Review deployment** - Ensure all files were uploaded correctly

## Contact Support

If none of these solutions work, provide:
- Server startup logs
- Error messages from console
- Database connection test results
- Node.js version
- Operating system details

