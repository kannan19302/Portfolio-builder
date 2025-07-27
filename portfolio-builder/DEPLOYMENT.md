# Portfolio Builder - Deployment Guide

## 🚀 Quick Start (Development)

### Option 1: Using the Startup Script
```bash
# Make the script executable
chmod +x start.sh

# Run both servers
./start.sh
```

### Option 2: Manual Start
```bash
# Terminal 1: Backend
PORT=12002 node server.js

# Terminal 2: Frontend (in new terminal)
cd client
PORT=12001 npm start
```

### Option 3: Using npm scripts
```bash
# Install all dependencies
npm run setup

# Run both servers concurrently
npm run dev
```

## 🏭 Production Deployment

### 1. Build for Production

```bash
# Install dependencies
npm install
cd client && npm install --legacy-peer-deps && cd ..

# Build the frontend
cd client && npm run build && cd ..

# The built files will be in client/build/
```

### 2. Environment Configuration

Create a `.env` file:

```env
NODE_ENV=production
PORT=3000
JWT_SECRET=your-super-secure-jwt-secret-change-this
DB_PATH=./data/portfolio.db
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=10485760
```

### 3. Start Production Server

```bash
# Set environment and start
NODE_ENV=production PORT=3000 node server.js
```

The server will:
- Serve the built React app from `/client/build`
- Handle API requests on `/api/*`
- Serve uploaded files from `/uploads/*`

## 🐳 Docker Deployment

### Dockerfile
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY client/package*.json ./client/

# Install dependencies
RUN npm ci --only=production
RUN cd client && npm ci --only=production --legacy-peer-deps

# Copy source code
COPY . .

# Build frontend
RUN cd client && npm run build

# Create necessary directories
RUN mkdir -p uploads data

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

# Start server
CMD ["node", "server.js"]
```

### Docker Compose
```yaml
version: '3.8'

services:
  portfolio-builder:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - JWT_SECRET=your-secure-secret
    volumes:
      - ./data:/app/data
      - ./uploads:/app/uploads
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
```

### Build and Run
```bash
# Build the image
docker build -t portfolio-builder .

# Run the container
docker run -d \
  --name portfolio-builder \
  -p 3000:3000 \
  -v $(pwd)/data:/app/data \
  -v $(pwd)/uploads:/app/uploads \
  -e NODE_ENV=production \
  -e JWT_SECRET=your-secure-secret \
  portfolio-builder

# Or use docker-compose
docker-compose up -d
```

## 🌐 Reverse Proxy Setup

### Nginx Configuration

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    # SSL configuration
    ssl_certificate /path/to/your/certificate.crt;
    ssl_certificate_key /path/to/your/private.key;

    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";

    # File upload size limit
    client_max_body_size 10M;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        proxy_pass http://localhost:3000;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### Apache Configuration

```apache
<VirtualHost *:80>
    ServerName your-domain.com
    Redirect permanent / https://your-domain.com/
</VirtualHost>

<VirtualHost *:443>
    ServerName your-domain.com
    
    # SSL configuration
    SSLEngine on
    SSLCertificateFile /path/to/your/certificate.crt
    SSLCertificateKeyFile /path/to/your/private.key
    
    # Security headers
    Header always set X-Frame-Options DENY
    Header always set X-Content-Type-Options nosniff
    Header always set X-XSS-Protection "1; mode=block"
    
    # Proxy configuration
    ProxyPreserveHost On
    ProxyPass / http://localhost:3000/
    ProxyPassReverse / http://localhost:3000/
    
    # WebSocket support
    RewriteEngine on
    RewriteCond %{HTTP:Upgrade} websocket [NC]
    RewriteCond %{HTTP:Connection} upgrade [NC]
    RewriteRule ^/?(.*) "ws://localhost:3000/$1" [P,L]
</VirtualHost>
```

## 🔧 System Service Setup

### systemd Service (Linux)

Create `/etc/systemd/system/portfolio-builder.service`:

```ini
[Unit]
Description=Portfolio Builder
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/opt/portfolio-builder
ExecStart=/usr/bin/node server.js
Restart=on-failure
RestartSec=10
Environment=NODE_ENV=production
Environment=PORT=3000
Environment=JWT_SECRET=your-secure-secret

# Security settings
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ProtectHome=true
ReadWritePaths=/opt/portfolio-builder/data /opt/portfolio-builder/uploads

[Install]
WantedBy=multi-user.target
```

### Enable and Start Service
```bash
# Reload systemd
sudo systemctl daemon-reload

# Enable service to start on boot
sudo systemctl enable portfolio-builder

# Start the service
sudo systemctl start portfolio-builder

# Check status
sudo systemctl status portfolio-builder

# View logs
sudo journalctl -u portfolio-builder -f
```

## 📊 Monitoring and Maintenance

### Health Monitoring

```bash
# Simple health check script
#!/bin/bash
HEALTH_URL="http://localhost:3000/api/health"
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" $HEALTH_URL)

if [ $RESPONSE -eq 200 ]; then
    echo "✅ Portfolio Builder is healthy"
    exit 0
else
    echo "❌ Portfolio Builder is unhealthy (HTTP $RESPONSE)"
    exit 1
fi
```

### Log Rotation

```bash
# Add to /etc/logrotate.d/portfolio-builder
/var/log/portfolio-builder/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 www-data www-data
    postrotate
        systemctl reload portfolio-builder
    endscript
}
```

### Backup Script

```bash
#!/bin/bash
# backup.sh

BACKUP_DIR="/backups/portfolio-builder"
DATE=$(date +%Y%m%d_%H%M%S)
APP_DIR="/opt/portfolio-builder"

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Backup database
cp "$APP_DIR/data/portfolio.db" "$BACKUP_DIR/portfolio_$DATE.db"

# Backup uploads
tar -czf "$BACKUP_DIR/uploads_$DATE.tar.gz" -C "$APP_DIR" uploads/

# Backup configuration
cp "$APP_DIR/.env" "$BACKUP_DIR/env_$DATE.backup"

# Clean old backups (keep 30 days)
find "$BACKUP_DIR" -name "*.db" -mtime +30 -delete
find "$BACKUP_DIR" -name "*.tar.gz" -mtime +30 -delete
find "$BACKUP_DIR" -name "*.backup" -mtime +30 -delete

echo "✅ Backup completed: $DATE"
```

## 🔒 Security Hardening

### 1. File Permissions
```bash
# Set proper ownership
sudo chown -R www-data:www-data /opt/portfolio-builder

# Set directory permissions
sudo chmod 755 /opt/portfolio-builder
sudo chmod 755 /opt/portfolio-builder/uploads
sudo chmod 755 /opt/portfolio-builder/data

# Set file permissions
sudo chmod 644 /opt/portfolio-builder/*.js
sudo chmod 600 /opt/portfolio-builder/.env
sudo chmod 644 /opt/portfolio-builder/data/portfolio.db
```

### 2. Firewall Configuration
```bash
# Allow only necessary ports
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw deny 3000/tcp   # Block direct access to app
sudo ufw enable
```

### 3. SSL/TLS Setup
```bash
# Using Let's Encrypt with Certbot
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
sudo certbot renew --dry-run
```

## 📈 Performance Optimization

### 1. Node.js Optimization
```bash
# Use PM2 for process management
npm install -g pm2

# Create ecosystem file
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'portfolio-builder',
    script: 'server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
}
EOF

# Start with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 2. Database Optimization
```sql
-- Add indexes for better performance
CREATE INDEX idx_sections_visible_order ON sections(is_visible, sort_order);
CREATE INDEX idx_media_created_at ON media(created_at);
```

### 3. Caching Strategy
```javascript
// Add to server.js for static file caching
app.use(express.static(path.join(__dirname, 'client/build'), {
  maxAge: '1y',
  etag: true,
  lastModified: true
}));
```

## 🚨 Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   sudo lsof -i :3000
   sudo kill -9 <PID>
   ```

2. **Database Locked**
   ```bash
   sudo systemctl stop portfolio-builder
   sudo rm /opt/portfolio-builder/data/portfolio.db-wal
   sudo rm /opt/portfolio-builder/data/portfolio.db-shm
   sudo systemctl start portfolio-builder
   ```

3. **File Upload Issues**
   ```bash
   sudo chmod 755 /opt/portfolio-builder/uploads
   sudo chown www-data:www-data /opt/portfolio-builder/uploads
   ```

4. **Memory Issues**
   ```bash
   # Increase Node.js memory limit
   node --max-old-space-size=4096 server.js
   ```

### Log Analysis
```bash
# View application logs
sudo journalctl -u portfolio-builder -f

# View Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# View system resources
htop
df -h
free -h
```

---

**Deployment Guide Version**: 1.0  
**Last Updated**: 2025-07-23  
**Compatibility**: Node.js 16+, Linux/macOS/Windows