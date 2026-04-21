const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Student = require('../models/Student');
const Admin = require('../models/admin');

// --- Student Auth ---

// Student Signup
router.post('/student/signup', async (req, res) => {
  try {
    const { name, usn, password, branch, year, hostelBlock, roomNumber } = req.body;

    // Check if USN already exists
    let student = await Student.findOne({ usn });
    if (student) return res.status(400).json({ error: 'Student with this USN already exists.' });

    // Hash Password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    student = new Student({
      name, usn, password: hashedPassword, branch, year, hostelBlock, roomNumber
    });
    await student.save();

    // Create JWT
    const token = jwt.sign({ id: student._id, role: 'student' }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, student: { id: student._id, name: student.name, usn: student.usn } });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Student Login
router.post('/student/login', async (req, res) => {
  try {
    const { usn, password } = req.body;

    const student = await Student.findOne({ usn });
    if (!student) return res.status(400).json({ error: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, student.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: student._id, role: 'student' }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, student: { id: student._id, name: student.name, usn: student.usn } });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// --- Admin Auth ---

// Admin Signup
router.post('/admin/signup', async (req, res) => {
  try {
    const { name, email, password, role, department, hostelAssigned } = req.body;
    
    if (role !== 'faculty' && role !== 'warden') {
      return res.status(400).json({ error: 'Role must be faculty or warden.' });
    }

    let admin = await Admin.findOne({ email });
    if (admin) return res.status(400).json({ error: 'Admin with this email already exists.' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    admin = new Admin({
      name, email, password: hashedPassword, role, department, hostelAssigned
    });
    await admin.save();

    const token = jwt.sign({ id: admin._id, role: admin.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, admin: { id: admin._id, name: admin.name, email: admin.email, role: admin.role } });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin Login
router.post('/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(400).json({ error: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: admin._id, role: admin.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, admin: { id: admin._id, name: admin.name, email: admin.email, role: admin.role } });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
