const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Student = require('../models/Student');
const Admin = require('../models/admin');
const Teacher = require('../models/Teacher');


router.post('/student/signup', async (req, res) => {
  try {
    const { name, usn, password, branch, year, hostelBlock, roomNumber } = req.body;

  
    let student = await Student.findOne({ usn });
    if (student) return res.status(400).json({ error: 'Student with this USN already exists.' });

  
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    student = new Student({
      name, usn, password: hashedPassword, branch, year, hostelBlock, roomNumber
    });
    await student.save();


    const token = jwt.sign({ id: student._id, role: 'student' }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, student: { id: student._id, name: student.name, usn: student.usn } });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});


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


// Teacher signup
router.post('/teacher/signup', async (req, res) => {
  try {
    const { name, email, password, department, subject } = req.body;

    let teacher = await Teacher.findOne({ email });
    if (teacher) return res.status(400).json({ error: 'Teacher with this email already exists.' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    teacher = new Teacher({
      name, email, password: hashedPassword, department, subject
    });
    await teacher.save();

    const token = jwt.sign({ id: teacher._id, role: 'teacher' }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, teacher: { id: teacher._id, name: teacher.name, email: teacher.email, department: teacher.department, subject: teacher.subject } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Teacher login
router.post('/teacher/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const teacher = await Teacher.findOne({ email });
    if (!teacher) return res.status(400).json({ error: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, teacher.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: teacher._id, role: 'teacher' }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, teacher: { id: teacher._id, name: teacher.name, email: teacher.email, department: teacher.department, subject: teacher.subject } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
