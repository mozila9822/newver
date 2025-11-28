# 🚀 Automated Startup Script

## Quick Start

Simply run one of these commands:

**Windows:**
```bash
npm run start:auto
```
or
```bash
start.bat
```

**Linux/Mac:**
```bash
npm run start:auto
```
or
```bash
chmod +x start.sh
./start.sh
```

## What the Script Does

The automated startup script (`start.js`) performs the following checks and fixes:

### ✅ Step 1: Node.js Version Check
- Verifies Node.js 20+ is installed
- Shows error if version is too old

### ✅ Step 2: Project Files Check
- Verifies `package.json` exists
- Ensures you're in the correct directory

### ✅ Step 3: Dependencies Check & Install
- Checks if `node_modules` exists
- Verifies critical packages (`mysql2`, `express`, `react`, etc.)
- **Automatically installs missing dependencies** with `npm install`

### ✅ Step 4: MySQL Database Connection Test
- Tests connection to MySQL database
- Verifies database credentials
- Checks if required tables exist
- Shows helpful error messages if connection fails

### ✅ Step 5: Production Build Check
- Checks if `dist/` folder exists
- Verifies build files are present

### ✅ Step 6: Build Project (if needed)
- **Automatically builds the project** if build is missing
- Uses `npm run build` to create production files

### ✅ Step 7: Start Server
- Starts the server in production mode
- Shows server URL (http://localhost:5000)
- Handles graceful shutdown (Ctrl+C)

## Features

- 🔧 **Auto-fix**: Installs missing dependencies automatically
- 🔍 **Smart checks**: Verifies everything before starting
- 📊 **Clear feedback**: Color-coded status messages
- 🛡️ **Error handling**: Helpful error messages with solutions
- 🚀 **One command**: Everything in a single script

## Output Example

```
============================================================
  VoyagerLuxury - Automated Startup Script
============================================================

[1] Checking Node.js version...
✅ Node.js v20.10.0 detected

[2] Checking project files...
✅ package.json found

[3] Checking dependencies...
✅ All dependencies are installed

[4] Testing MySQL database connection...
ℹ️  Attempting to connect to database...
✅ Database connection successful
ℹ️  Database has 15 tables
✅ All required tables exist

[5] Checking production build...
✅ Production build found (1.90 MB)

============================================================
  All checks passed! Starting server...
============================================================

[7] Starting server...
ℹ️  Starting production server...
ℹ️  Server will be available at http://localhost:5000
ℹ️  Press Ctrl+C to stop the server

✅ Database connected successfully
✅ Database tables initialized successfully
[express] serving on port 5000
```

## Troubleshooting

### If the script fails:

1. **Node.js not found**: Install Node.js 20+ from https://nodejs.org/
2. **Dependencies fail to install**: Check your internet connection
3. **Database connection fails**: 
   - Check network connectivity
   - Verify firewall allows MySQL (port 3306)
   - Check database credentials in `server/db.ts`
4. **Build fails**: Check for TypeScript errors with `npm run check`

### Manual Steps (if script doesn't work):

```bash
# 1. Install dependencies
npm install

# 2. Test database
node diagnose-db.js

# 3. Build project
npm run build

# 4. Start server
npm start
```

## Environment Variables

The script respects these environment variables:

- `NODE_ENV`: Set to `production` for production mode
- `PORT`: Server port (default: 5000)

## Database Configuration

The database connection is configured in `server/db.ts`:
- Host: `mysql-200-131.mysql.prositehosting.net`
- Database: `ocidb_01Raay53dC`
- User: `voyageruser12`
- Password: `19982206m.M`

**Note**: Tables are automatically created on first run if they don't exist.

## Support

If you encounter issues:
1. Run `node diagnose-db.js` for database diagnostics
2. Check server logs for error messages
3. Verify all prerequisites are met
4. Review `DEPLOYMENT_TROUBLESHOOTING.md` for detailed help

---

**Made with ❤️ for VoyagerLuxury**

