const { pool } = require('../models/db');
const xlsx = require('xlsx');
const path = require('path');

// Helper: generate cert ID
const generateCertId = async () => {
  const [rows] = await pool.query('SELECT cert_id FROM students ORDER BY id DESC LIMIT 1');
  if (rows.length === 0) return 'CERT001';
  const last = rows[0].cert_id.replace('CERT', '');
  const next = String(parseInt(last, 10) + 1).padStart(3, '0');
  return 'CERT' + next;
};

// GET /students — list with optional search
const getStudents = async (req, res) => {
  const { name, course, year } = req.query;
  let query = 'SELECT * FROM students WHERE 1=1';
  const params = [];
  if (name)   { query += ' AND name LIKE ?';    params.push(`%${name}%`); }
  if (course) { query += ' AND course LIKE ?';  params.push(`%${course}%`); }
  if (year)   { query += ' AND year = ?';        params.push(year); }
  query += ' ORDER BY id DESC';
  try {
    const [rows] = await pool.query(query, params);
    res.json({ students: rows, total: rows.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /students/:id
const getStudent = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM students WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Student not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /students
const createStudent = async (req, res) => {
  const { name, email, roll, course, year, cert_id } = req.body;
  if (!name || !email || !roll || !course || !year)
    return res.status(400).json({ message: 'All fields are required' });

  try {
    const certId = cert_id || await generateCertId();
    await pool.query(
      'INSERT INTO students (name, email, roll, course, year, cert_id) VALUES (?, ?, ?, ?, ?, ?)',
      [name, email, roll, course, year, certId]
    );
    res.status(201).json({ message: 'Student created', cert_id: certId });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY')
      return res.status(409).json({ message: 'Roll number or Certificate ID already exists' });
    res.status(500).json({ message: 'Server error' });
  }
};

// PUT /students/:id
const updateStudent = async (req, res) => {
  const { name, email, roll, course, year, cert_id } = req.body;
  try {
    const [result] = await pool.query(
      'UPDATE students SET name=?, email=?, roll=?, course=?, year=?, cert_id=? WHERE id=?',
      [name, email, roll, course, year, cert_id, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Student not found' });
    res.json({ message: 'Student updated' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY')
      return res.status(409).json({ message: 'Roll number or Certificate ID already exists' });
    res.status(500).json({ message: 'Server error' });
  }
};

// DELETE /students/:id
const deleteStudent = async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM students WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Student not found' });
    res.json({ message: 'Student deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /students/verify/:certId — public
const verifyCertificate = async (req, res) => {
  const certId = req.params.certId.toUpperCase();
  try {
    const [rows] = await pool.query('SELECT * FROM students WHERE UPPER(cert_id) = ?', [certId]);
    if (rows.length === 0)
      return res.status(404).json({ valid: false, message: 'Certificate not found' });
    const s = rows[0];
    res.json({
      valid: true,
      student: { name: s.name, email: s.email, course: s.course, year: s.year, cert_id: s.cert_id, roll: s.roll }
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /students/stats
const getStats = async (req, res) => {
  try {
    const [[{ total }]] = await pool.query('SELECT COUNT(*) as total FROM students');
    const [[{ courses }]] = await pool.query('SELECT COUNT(DISTINCT course) as courses FROM students');
    const [[{ latestYear }]] = await pool.query('SELECT MAX(year) as latestYear FROM students');
    res.json({ total, courses, latestYear });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /students/import — upload xlsx/csv
const importStudents = async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
  try {
    const workbook = xlsx.readFile(req.file.path);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = xlsx.utils.sheet_to_json(sheet);

    let added = 0, skipped = 0;
    for (const row of data) {
      const name   = row['name']   || row['Name']   || '';
      const email  = row['email']  || row['Email']  || '';
      const roll   = String(row['roll']   || row['Roll']   || '');
      const course = row['course'] || row['Course'] || '';
      const year   = String(row['year']   || row['Year']   || '');
      const certId = row['cert_id'] || row['Cert ID'] || await generateCertId();

      if (!name || !email || !roll || !course || !year) { skipped++; continue; }

      try {
        await pool.query(
          'INSERT INTO students (name, email, roll, course, year, cert_id) VALUES (?, ?, ?, ?, ?, ?)',
          [name, email, roll, course, year, certId]
        );
        added++;
      } catch {
        skipped++;
      }
    }
    res.json({ message: `Import complete: ${added} added, ${skipped} skipped`, added, skipped });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to parse file' });
  }
};

module.exports = { getStudents, getStudent, createStudent, updateStudent, deleteStudent, verifyCertificate, getStats, importStudents };
