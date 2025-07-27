# Portfolio Builder - Complete Self-Hosted Solution

A fully customizable portfolio website builder that runs entirely on-premises or in a local environment. No cloud dependencies required!

## 🚀 Features

### Admin Dashboard
- **Section Management**: Create, edit, delete, and reorder sections (About, Projects, Blog, Contact, Custom)
- **Drag & Drop**: Intuitive section ordering with visual feedback
- **Live Preview**: See changes in real-time
- **Content Editor**: Rich text editing with custom HTML/CSS/JS support
- **Media Manager**: Upload and manage images and files locally
- **Theme Settings**: Configure site-wide settings and appearance
- **Authentication**: Secure JWT-based admin login

### Portfolio Website
- **Dynamic Rendering**: Sections render based on admin configuration
- **Mobile Responsive**: Optimized for all device sizes
- **Dark/Light Theme**: Toggle between themes with persistence
- **Fast Loading**: Optimized performance with local storage
- **SEO Friendly**: Proper meta tags and semantic HTML

### Technical Features
- **Local Storage**: All data stored in SQLite database
- **File Uploads**: Images and media stored locally in `/uploads` folder
- **Export/Import**: Backup and restore site configuration
- **Security**: Helmet.js security headers, input validation, JWT authentication
- **API-First**: RESTful API design for easy integration

## 🛠️ Tech Stack

- **Frontend**: React.js with functional components and hooks
- **Backend**: Node.js + Express.js
- **Database**: SQLite (local, no setup required)
- **Styling**: Tailwind CSS
- **Authentication**: JWT-based login system
- **File Handling**: Multer for local file uploads
- **Security**: Helmet.js, bcrypt password hashing

## 📦 Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

## 🌐 Live Demo

The Portfolio Builder is currently deployed and accessible at:
- **Portfolio Website**: https://work-2-lmpzpehenvuseukh.prod-runtime.all-hands.dev
- **Admin Panel**: https://work-2-lmpzpehenvuseukh.prod-runtime.all-hands.dev/admin
- **Login Credentials**: admin / admin123

### Quick Start

1. **Clone/Download the project**
   ```bash
   # If you have the code, navigate to the project directory
   cd portfolio-builder
   ```

2. **Install Backend Dependencies**
   ```bash
   npm install
   ```

3. **Install Frontend Dependencies**
   ```bash
   cd client
   npm install --legacy-peer-deps
   cd ..
   ```

4. **Start the Backend Server**
   ```bash
   # From the root directory
   PORT=12002 node server.js
   ```
   The backend will run on `http://localhost:12002`

5. **Start the Frontend Development Server**
   ```bash
   # In a new terminal, from the root directory
   cd client
   npm start
   ```
   The frontend will run on `http://localhost:12001`

### Production Setup

1. **Build the Frontend**
   ```bash
   cd client
   npm run build
   cd ..
   ```

2. **Serve Static Files**
   The server is configured to serve the built React app from the `/client/build` directory.

3. **Start Production Server**
   ```bash
   NODE_ENV=production PORT=12002 node server.js
   ```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=12002
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Database Configuration (optional)
DB_PATH=./portfolio.db

# Upload Configuration
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=10485760
```

### Default Admin Credentials

- **Username**: `admin`
- **Password**: `admin123`

**⚠️ Important**: Change these credentials immediately after first login!

## 📁 Project Structure

```
portfolio-builder/
├── server.js                 # Main server file
├── database.js              # Database configuration and models
├── portfolio.db             # SQLite database (auto-created)
├── uploads/                 # Local file storage
├── routes/
│   ├── auth.js             # Authentication routes
│   ├── content.js          # Content management routes
│   └── upload.js           # File upload routes
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── admin/      # Admin dashboard components
│   │   │   └── portfolio/  # Portfolio website components
│   │   ├── contexts/       # React contexts (Auth, Theme)
│   │   ├── utils/          # Utility functions and API client
│   │   └── App.js          # Main React component
│   └── package.json
├── package.json            # Backend dependencies
└── README.md
```

## 🌐 Usage

### Accessing the Application

1. **Portfolio Website**: `http://localhost:12001/`
2. **Admin Dashboard**: `http://localhost:12001/admin`

### Admin Dashboard Features

#### 1. Section Management
- Navigate to "Sections" in the admin panel
- Create new sections with different types (Hero, About, Projects, Contact, Custom)
- Drag and drop to reorder sections
- Toggle section visibility
- Edit content with rich text editor

#### 2. Content Editing
- Click "Edit" on any section
- Use the built-in editor for text content
- Add custom HTML, CSS, and JavaScript
- Upload images and media files
- Preview changes in real-time

#### 3. Media Management
- Upload images, documents, and other files
- Organize media in the uploads folder
- Reference uploaded files in your content
- Automatic file optimization and security

#### 4. Site Settings
- Configure site title, description, and metadata
- Set up social media links
- Customize theme colors and fonts
- Export/import site configuration

### API Endpoints

#### Authentication
- `POST /api/auth/login` - Admin login
- `POST /api/auth/logout` - Admin logout
- `GET /api/auth/verify` - Verify JWT token

#### Content Management
- `GET /api/content/sections` - Get all sections
- `POST /api/content/sections` - Create new section
- `PUT /api/content/sections/:id` - Update section
- `DELETE /api/content/sections/:id` - Delete section
- `PUT /api/content/sections/reorder` - Reorder sections

#### File Upload
- `POST /api/upload` - Upload files
- `GET /api/upload/:filename` - Serve uploaded files

#### Site Settings
- `GET /api/content/settings` - Get site settings
- `PUT /api/content/settings` - Update site settings

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt for secure password storage
- **Input Validation**: Server-side validation for all inputs
- **File Upload Security**: File type and size restrictions
- **CORS Protection**: Configured for local development
- **Helmet.js**: Security headers and protection
- **SQL Injection Prevention**: Parameterized queries

## 🚀 Deployment Options

### Local Network Access

To access from other devices on your network:

1. Find your local IP address
2. Update the server to bind to all interfaces:
   ```javascript
   app.listen(PORT, '0.0.0.0', () => {
     console.log(`Server running on http://0.0.0.0:${PORT}`);
   });
   ```
3. Access via `http://YOUR_LOCAL_IP:12002`

### Docker Deployment (Optional)

Create a `Dockerfile`:

```dockerfile
FROM node:16-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY client/package*.json ./client/

# Install dependencies
RUN npm install
RUN cd client && npm install --legacy-peer-deps

# Copy source code
COPY . .

# Build frontend
RUN cd client && npm run build

# Expose port
EXPOSE 12002

# Start server
CMD ["node", "server.js"]
```

## 🛠️ Development

### Adding New Section Types

1. **Backend**: Add new section type to database schema
2. **Frontend**: Create new component in `client/src/components/portfolio/`
3. **Admin**: Add editing interface in `client/src/components/admin/`

### Customizing Themes

1. Edit `client/src/contexts/ThemeContext.js`
2. Add new theme variables
3. Update Tailwind configuration if needed

### Database Modifications

1. Update `database.js` with new schema
2. Add migration logic for existing databases
3. Update API routes as needed

## 🐛 Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   # Kill processes using the port
   pkill -f "node server.js"
   # Or use a different port
   PORT=3001 node server.js
   ```

2. **Database Locked**
   ```bash
   # Remove the database file and restart
   rm portfolio.db
   node server.js
   ```

3. **File Upload Issues**
   ```bash
   # Check uploads directory permissions
   chmod 755 uploads/
   ```

4. **Frontend Build Issues**
   ```bash
   # Clear npm cache and reinstall
   cd client
   rm -rf node_modules package-lock.json
   npm install --legacy-peer-deps
   ```

### Debug Mode

Enable debug logging:

```bash
DEBUG=portfolio:* node server.js
```

## 📝 License

This project is open source and available under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

For issues and questions:
1. Check the troubleshooting section
2. Review the API documentation
3. Check the browser console for errors
4. Verify server logs for backend issues

---

**Happy Building! 🎉**

Create beautiful, customizable portfolios with complete control over your data and hosting.