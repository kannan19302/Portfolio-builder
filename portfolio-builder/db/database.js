const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

const DB_PATH = path.join(__dirname, '../data/portfolio.db');

class Database {
  constructor() {
    this.db = null;
  }

  async init() {
    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database(DB_PATH, (err) => {
        if (err) {
          console.error('Error opening database:', err);
          reject(err);
        } else {
          console.log('📦 Connected to SQLite database');
          this.createTables().then(resolve).catch(reject);
        }
      });
    });
  }

  async createTables() {
    const tables = [
      // Users table for admin authentication
      `CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        email TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      
      // Sections table for portfolio sections
      `CREATE TABLE IF NOT EXISTS sections (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        title TEXT,
        content TEXT,
        custom_html TEXT,
        custom_css TEXT,
        custom_js TEXT,
        is_visible BOOLEAN DEFAULT 1,
        sort_order INTEGER DEFAULT 0,
        settings TEXT DEFAULT '{}',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      
      // Site settings table
      `CREATE TABLE IF NOT EXISTS site_settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        key TEXT UNIQUE NOT NULL,
        value TEXT,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      
      // Media files table
      `CREATE TABLE IF NOT EXISTS media (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        filename TEXT NOT NULL,
        original_name TEXT NOT NULL,
        mime_type TEXT NOT NULL,
        size INTEGER NOT NULL,
        path TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`
    ];

    for (const table of tables) {
      await this.run(table);
    }

    // Run migrations
    await this.runMigrations();
    
    // Create default admin user if not exists
    await this.createDefaultAdmin();
    
    // Create default sections if not exists
    await this.createDefaultSections();
    
    // Create default site settings
    await this.createDefaultSettings();
  }

  async runMigrations() {
    try {
      // Check if email column exists in users table
      const tableInfo = await this.all("PRAGMA table_info(users)");
      const hasEmailColumn = tableInfo.some(column => column.name === 'email');
      
      if (!hasEmailColumn) {
        await this.run('ALTER TABLE users ADD COLUMN email TEXT');
        console.log('📦 Migration: Added email column to users table');
      }
    } catch (error) {
      console.error('Migration error:', error);
    }
  }

  async createDefaultAdmin() {
    const username = process.env.ADMIN_USERNAME || 'admin';
    const password = process.env.ADMIN_PASSWORD || 'admin123';
    
    const existingUser = await this.get('SELECT * FROM users WHERE username = ?', [username]);
    
    if (!existingUser) {
      const hashedPassword = await bcrypt.hash(password, 10);
      await this.run('INSERT INTO users (username, password, email) VALUES (?, ?, ?)', [username, hashedPassword, null]);
      console.log(`👤 Default admin user created: ${username}`);
    }
  }

  async createDefaultSections() {
    const existingSections = await this.get('SELECT COUNT(*) as count FROM sections');
    
    if (existingSections.count === 0) {
      const defaultSections = [
        {
          name: 'hero',
          type: 'hero',
          title: 'Welcome to My Portfolio',
          content: JSON.stringify({
            subtitle: 'Full Stack Developer & Designer',
            description: 'I create beautiful and functional web applications.',
            buttonText: 'View My Work',
            buttonLink: '#projects'
          }),
          sort_order: 1
        },
        {
          name: 'about',
          type: 'about',
          title: 'About Me',
          content: JSON.stringify({
            description: 'I am a passionate developer with experience in modern web technologies. I love creating solutions that make a difference.',
            skills: ['React', 'Node.js', 'JavaScript', 'Python', 'SQL']
          }),
          sort_order: 2
        },
        {
          name: 'projects',
          type: 'projects',
          title: 'My Projects',
          content: JSON.stringify({
            projects: [
              {
                title: 'Portfolio Builder',
                description: 'A customizable portfolio website builder',
                technologies: ['React', 'Node.js', 'SQLite'],
                image: '',
                link: '',
                github: ''
              }
            ]
          }),
          sort_order: 3
        },
        {
          name: 'contact',
          type: 'contact',
          title: 'Get In Touch',
          content: JSON.stringify({
            description: 'Feel free to reach out for collaborations or just a friendly hello!',
            email: 'your.email@example.com',
            phone: '+1 (555) 123-4567',
            social: {
              github: 'https://github.com/yourusername',
              linkedin: 'https://linkedin.com/in/yourusername',
              twitter: 'https://twitter.com/yourusername'
            }
          }),
          sort_order: 4
        }
      ];

      for (const section of defaultSections) {
        await this.run(
          'INSERT INTO sections (name, type, title, content, sort_order) VALUES (?, ?, ?, ?, ?)',
          [section.name, section.type, section.title, section.content, section.sort_order]
        );
      }
      console.log('📄 Default sections created');
    }
  }

  async createDefaultSettings() {
    const defaultSettings = [
      { key: 'site_title', value: 'My Portfolio' },
      { key: 'site_description', value: 'A customizable portfolio website' },
      { key: 'theme', value: 'light' },
      { key: 'primary_color', value: '#3B82F6' },
      { key: 'font_family', value: 'Inter' }
    ];

    for (const setting of defaultSettings) {
      const existing = await this.get('SELECT * FROM site_settings WHERE key = ?', [setting.key]);
      if (!existing) {
        await this.run('INSERT INTO site_settings (key, value) VALUES (?, ?)', [setting.key, setting.value]);
      }
    }
    console.log('⚙️ Default settings created');
  }

  // Database helper methods
  run(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id: this.lastID, changes: this.changes });
        }
      });
    });
  }

  get(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  all(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  close() {
    return new Promise((resolve, reject) => {
      this.db.close((err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }
}

const database = new Database();
module.exports = database;
