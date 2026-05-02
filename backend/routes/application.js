const express = require('express');
const router = express.Router();
const Application = require('../models/Application');
const Teacher = require('../models/Teacher');
const Student = require('../models/Student');
const { verifyStudent, verifyTeacher, verifyAnyUser } = require('../middleware/auth');

// Get all teachers (for students to browse and select)
router.get('/teachers', verifyStudent, async (req, res) => {
  try {
    const teachers = await Teacher.find({}, '-password').sort({ department: 1, name: 1 });
    res.json(teachers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error while fetching teachers.' });
  }
});

// Create a new application (Student only)
router.post('/', verifyStudent, async (req, res) => {
  try {
    const { teacherId, templateType, subject, description } = req.body;

    if (!teacherId || !templateType || !subject || !description) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    // Verify teacher exists
    const teacher = await Teacher.findById(teacherId);
    if (!teacher) {
      return res.status(404).json({ error: 'Teacher not found.' });
    }

    const application = new Application({
      studentId: req.user.id,
      teacherId,
      templateType,
      subject,
      description
    });

    await application.save();

    // Populate for response
    const populated = await Application.findById(application._id)
      .populate('teacherId', 'name email department subject')
      .populate('studentId', 'name usn branch year');

    res.status(201).json(populated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error while creating application.' });
  }
});

// Get all applications sent by the logged-in student
router.get('/my', verifyStudent, async (req, res) => {
  try {
    const applications = await Application.find({ studentId: req.user.id })
      .populate('teacherId', 'name email department subject')
      .sort({ createdAt: -1 });

    res.json(applications);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error while fetching your applications.' });
  }
});

// Get all applications sent to the logged-in teacher (Teacher inbox)
router.get('/inbox', verifyTeacher, async (req, res) => {
  try {
    const applications = await Application.find({ teacherId: req.user.id })
      .populate('studentId', 'name usn branch year hostelBlock roomNumber')
      .sort({ createdAt: -1 });

    res.json(applications);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error while fetching applications.' });
  }
});

// Accept or reject an application (Teacher only)
router.put('/:id/respond', verifyTeacher, async (req, res) => {
  try {
    const { status, remarks } = req.body;

    if (!status || (status !== 'accepted' && status !== 'rejected')) {
      return res.status(400).json({ error: 'Status must be "accepted" or "rejected".' });
    }

    const application = await Application.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ error: 'Application not found.' });
    }

    // Ensure only the target teacher can respond
    if (application.teacherId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to respond to this application.' });
    }

    application.status = status;
    application.teacherRemarks = remarks || '';
    application.respondedAt = new Date();
    await application.save();

    const populated = await Application.findById(application._id)
      .populate('studentId', 'name usn branch year hostelBlock roomNumber')
      .populate('teacherId', 'name email department subject');

    res.json(populated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error while responding to application.' });
  }
});

module.exports = router;
