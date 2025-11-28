# 🚀 Quick Start Guide

## One-Command Startup

Simply run:

```bash
npm run start:auto
```

**That's it!** The script will:
- ✅ Check Node.js version
- ✅ Install missing dependencies
- ✅ Test MySQL connection
- ✅ Build the project if needed
- ✅ Start the server

## What Happens

The automated startup script (`start.js`) performs all necessary checks and fixes:

1. **Node.js Check** - Verifies Node.js 20+ is installed
2. **Dependencies** - Automatically installs missing packages
3. **Database Test** - Connects to MySQL and verifies tables
4. **Build Check** - Builds project if production files are missing
5. **Server Start** - Starts the server on port 5000

## After Startup

Once the server starts, you'll see:
```
✅ Database connected successfully
✅ Database tables initialized successfully
[express] serving on port 5000
```

Then open your browser to: **http://localhost:5000**

## Troubleshooting

### If the script fails:

1. **Check Node.js**: Must be version 20 or higher
   ```bash
   node --version
   ```

2. **Check database**: Run diagnostics
   ```bash
   npm run diagnose
   ```

3. **Manual steps** (if script doesn't work):
   ```bash
   npm install
   npm run build
   npm start
   ```

## Platform-Specific

**Windows:**
```bash
start.bat
```

**Linux/Mac:**
```bash
chmod +x start.sh
./start.sh
```

## Database Connection

The script automatically:
- Tests MySQL connection
- Verifies database credentials
- Checks if tables exist
- Creates tables if missing (on server startup)

Database is configured in `server/db.ts` and will connect automatically.

---

**Need help?** Check `DEPLOYMENT_TROUBLESHOOTING.md` for detailed solutions.

