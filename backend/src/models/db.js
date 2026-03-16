const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'certverify',
  waitForConnections: true,
  connectionLimit: 10,
});

const initDB = async () => {
  const conn = await pool.getConnection();
  try {
    await conn.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role ENUM('admin') DEFAULT 'admin',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS students (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(200) NOT NULL,
        email VARCHAR(200) NOT NULL,
        roll VARCHAR(50) NOT NULL UNIQUE,
        course VARCHAR(100) NOT NULL,
        year VARCHAR(10) NOT NULL,
        cert_id VARCHAR(50) NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Seed default admin if not exists
    const bcrypt = require('bcryptjs');
    const [rows] = await conn.query('SELECT id FROM users WHERE username = ?', ['admin']);
    if (rows.length === 0) {
      const hash = await bcrypt.hash('admin123', 10);
      await conn.query('INSERT INTO users (username, password) VALUES (?, ?)', ['admin', hash]);
      console.log('Default admin created: admin / admin123');
    }

    // Seed sample students
    const [students] = await conn.query('SELECT COUNT(*) as cnt FROM students');
    if (students[0].cnt === 0) {
      await conn.query(`
        INSERT INTO students (name, email, roll, course, year, cert_id) VALUES
        ('Sneha',  'sneha@gmail.com',  '101', 'BCA',    '2026', 'CERT001'),
        ('Deepak', 'deepak@gmail.com', '102', 'MCA',    '2025', 'CERT002'),
        ('Anjali', 'anjali@gmail.com', '103', 'BSC',    '2024', 'CERT003'),
        ('Saloni', 'saloni@gmail.com', '104', 'B.TECH', '2023', 'CERT004'),
        ('Deepesh','deepesh@gmail.com','105', 'Arts',   '2020', 'CERT005')
      `);
      console.log('Sample students seeded.');
    }

    console.log('Database initialized successfully.');
  } finally {
    conn.release();
  }
};

module.exports = { pool, initDB };
