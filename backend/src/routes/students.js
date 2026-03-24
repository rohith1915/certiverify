const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const auth = require('../middleware/auth');
const {
  getStudents, getStudent, createStudent, updateStudent,
  deleteStudent, verifyCertificate, getStats, importStudents
} = require('../controllers/studentController');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

// Public
router.get('/verify/:certId', verifyCertificate);

// Protected
router.get('/stats', auth, getStats);
router.get('/', auth, getStudents);
router.get('/:id', auth, getStudent);
router.post('/', auth, createStudent);
router.put('/:id', auth, updateStudent);
router.delete('/:id', auth, deleteStudent);
router.post('/import/excel', auth, upload.single('file'), importStudents);

module.exports = router;
