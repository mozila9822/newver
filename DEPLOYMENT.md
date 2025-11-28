# VoyagerLuxury - Deployment Guide

## Build Status
✅ **Build completed successfully!**

The production build has been created in the `dist/` directory:
- **Client**: `dist/public/` - Frontend static files
- **Server**: `dist/index.cjs` - Backend server bundle

## Production Files Structure

```
dist/
├── index.cjs          # Server bundle (962.8 KB)
└── public/            # Client static files
    ├── index.html
    ├── assets/
    │   ├── index-*.js    # Main JavaScript bundle (1.74 MB)
    │   ├── index-*.css   # Styles (129.81 KB)
    │   └── *.png         # Images
```

## Deployment Steps

### 1. Prerequisites
- Node.js 20+ installed on the server
- MySQL database accessible
- Environment variables configured (if needed)

### 2. Database Configuration
The database connection is configured in `server/db.ts`:
- Host: `mysql-200-131.mysql.prositehosting.net`
- Database: `ocidb_01Raay53dC`
- User: `voyageruser12`
- Password: `19982206m.M`

**Note**: The database tables will be automatically created on first run via `initializeDatabase()`.

### 3. Environment Variables (Optional)
Create a `.env` file in the project root if you need to override defaults:

```env
# Stripe (if not configured in admin panel)
STRIPE_SECRET_KEY=sk_live_your_key_here
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_your_key_here

# Server Port (default: 5000)
PORT=5000
NODE_ENV=production
```

### 4. Install Production Dependencies
```bash
npm install --production
```

**IMPORTANT**: Make sure `mysql2` is installed. If you get MySQL connection errors, run:
```bash
npm install mysql2
```

### 4.1. Run Database Diagnostics (Optional but Recommended)
Before starting the server, test your database connection:
```bash
node diagnose-db.js
```

This will check:
- ✅ mysql2 package installation
- ✅ Database connectivity
- ✅ Required tables existence
- ✅ Environment configuration

### 5. Start the Production Server

**Recommended: Use the automated startup script** (checks everything automatically):
```bash
npm run start:auto
```

Or on Windows:
```bash
start.bat
```

Or on Linux/Mac:
```bash
chmod +x start.sh
./start.sh
```

**Manual start** (if you prefer):
```bash
npm start
```

Or directly:
```bash
NODE_ENV=production node dist/index.cjs
```

**What the automated script does:**
- ✅ Checks Node.js version (requires 20+)
- ✅ Verifies project files exist
- ✅ Installs missing dependencies automatically
- ✅ Tests MySQL database connection
- ✅ Checks if production build exists
- ✅ Builds project if needed
- ✅ Starts the server with proper configuration

The server will:
- Connect to MySQL database
- Initialize all database tables if they don't exist
- Start on port 5000 (or PORT environment variable)
- Serve the frontend from `dist/public/`

### 6. Verify Deployment
1. Open your browser and navigate to `http://your-server:5000`
2. Test the following:
   - ✅ Homepage loads
   - ✅ Trips/Hotels/Cars pages work
   - ✅ Admin login works (admin@voyager.com / admin123)
   - ✅ Booking functionality
   - ✅ Database connections

## Production Checklist

### Before Going Live:
- [ ] Configure Stripe API keys in Admin → Settings → Payments
- [ ] Configure email settings in Admin → Settings → Email
- [ ] Set up bank transfer details in Admin → Settings → Payments
- [ ] Test all payment methods
- [ ] Verify database backups are set up
- [ ] Set up SSL/HTTPS certificate
- [ ] Configure firewall rules
- [ ] Set up process manager (PM2, systemd, etc.)

### Recommended Process Manager (PM2)
```bash
# Install PM2 globally
npm install -g pm2

# Start the application
pm2 start dist/index.cjs --name voyagerluxury

# Save PM2 configuration
pm2 save

# Set up PM2 to start on system boot
pm2 startup
```

### Systemd Service (Alternative)
Create `/etc/systemd/system/voyagerluxury.service`:
```ini
[Unit]
Description=VoyagerLuxury Application
After=network.target

[Service]
Type=simple
User=your-user
WorkingDirectory=/path/to/VoyagerLuxury
ExecStart=/usr/bin/node dist/index.cjs
Restart=always
Environment=NODE_ENV=production
Environment=PORT=5000

[Install]
WantedBy=multi-user.target
```

Then:
```bash
sudo systemctl enable voyagerluxury
sudo systemctl start voyagerluxury
```

## Performance Optimization

### Current Build Stats:
- Client JS: 1.74 MB (429.80 KB gzipped)
- Client CSS: 129.81 KB (20.29 KB gzipped)
- Server: 962.8 KB

### Recommendations:
1. **Enable Gzip compression** on your web server (Nginx/Apache)
2. **Use CDN** for static assets
3. **Enable HTTP/2** for better performance
4. **Set up caching** for static assets
5. **Consider code splitting** for large chunks (warning shown in build)

## Security Checklist

- [ ] Change default admin credentials
- [ ] Use strong database passwords
- [ ] Enable HTTPS/SSL
- [ ] Set up CORS properly if needed
- [ ] Configure rate limiting
- [ ] Set up firewall rules
- [ ] Regular security updates
- [ ] Database backup strategy

## Troubleshooting

### ⚠️ MySQL Not Reading After Deployment

**Most Common Issue**: The build has been updated to include `mysql2` in the bundle. If you're still having issues:

1. **Run diagnostics first**:
   ```bash
   node diagnose-db.js
   ```

2. **Check server startup logs** - You should see:
   ```
   ✅ Database connected successfully
   ✅ Database tables initialized successfully
   ```

3. **Verify mysql2 is installed**:
   ```bash
   npm install mysql2
   ```

4. **Rebuild if needed**:
   ```bash
   npm run build
   ```

5. **Check network connectivity**:
   - Ensure server can reach `mysql-200-131.mysql.prositehosting.net:3306`
   - Check firewall rules
   - Verify MySQL allows remote connections

6. **See detailed troubleshooting**: Check `DEPLOYMENT_TROUBLESHOOTING.md`

### Server won't start:
- Check if port 5000 is available
- Verify database connection
- Check Node.js version (requires 20+)
- Review server logs

### Database connection errors:
- Verify database credentials in `server/db.ts`
- Check firewall rules allow MySQL connections
- Ensure database server is running
- Run `node diagnose-db.js` for detailed diagnostics

### Payment errors:
- Configure Stripe keys in Admin panel
- Check Stripe API key validity
- Verify webhook endpoints if using webhooks

## Support

For issues or questions:
1. Check server logs
2. Check browser console for frontend errors
3. Verify database connectivity
4. Review this deployment guide

---

**Build Date**: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
**Version**: 1.0.0
**Status**: ✅ Ready for Production

