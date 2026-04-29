const express = require('express');
const router = express.Router();
const Complaint = require('../models/Complaint');
const { verifyStudent, verifyAdmin, verifyAnyUser } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');

// Create a new complaint (Student only)
router.post('/newcomplaint', verifyStudent, upload.single('image'), async (req, res) => {
  try {
    const { title, description, category, isAnonymous } = req.body;
    
    let imageUrl = '';
    if (req.file) {
      imageUrl = '/uploads/' + req.file.filename;
    }

    const complaint = new Complaint({
      title,
      description,
      category,
      studentId: req.user.id,
      image: imageUrl,
      isAnonymous: isAnonymous === 'true' || isAnonymous === true
    });

    await complaint.save();
    res.status(201).json(complaint);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error while creating complaint.' });
  }
});

// Get all complaints 
// If Admin calling: see all, handled depending on role & category or all
// If Student calling: only see their own
router.get('/', verifyAnyUser, async (req, res) => {
  try {
    const userRole = req.user.role;
    let complaints;

    if (userRole === 'student') {
      // Students only see their own complaints
      complaints = await Complaint.find({ studentId: req.user.id }).sort({ createdAt: -1 });
      res.json(complaints);
    } else if (userRole === 'warden' || userRole === 'faculty' || userRole === 'admin') {
      // Admins (Warden/Faculty) can see complaints
      // Optionally we could filter based on the admin's role, but let's return all based on category filter if sent
      const { category } = req.query;
      let filter = {};
      if (category) filter.category = category;

      // Populate student details, but only if not anonymous
      const rawComplaints = await Complaint.find(filter)
        .populate('studentId', 'name usn branch year hostelBlock roomNumber')
        .sort({ createdAt: -1 })
        .lean();

      // Mask student details if anonymous
      complaints = rawComplaints.map(complaint => {
        if (complaint.isAnonymous) {
          complaint.studentId = null; // Hide the student identity completely
        }
        return complaint;
      });

      res.json(complaints);
    } else {
      res.status(403).json({ error: 'Access denied. Invalid role.' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error while fetching complaints.' });
  }
});

// Get all hostel complaints
router.get('/hostel/all', verifyAnyUser, async (req, res) => {
  try {
    const userRole = req.user.role;
    let complaints;

    if (userRole === 'student') {
      // Students only see their own hostel complaints
      complaints = await Complaint.find({ studentId: req.user.id, category: 'hostel' }).sort({ createdAt: -1 });
      res.json(complaints);
    } else if (userRole === 'warden' || userRole === 'faculty' || userRole === 'admin') {
      // Admins can see all hostel complaints
      const rawComplaints = await Complaint.find({ category: 'hostel' })
        .populate('studentId', 'name usn branch year hostelBlock roomNumber')
        .sort({ createdAt: -1 })
        .lean();

      // Mask student details if anonymous
      complaints = rawComplaints.map(complaint => {
        if (complaint.isAnonymous) {
          complaint.studentId = null;
        }
        return complaint;
      });

      res.json(complaints);
    } else {
      res.status(403).json({ error: 'Access denied. Invalid role.' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error while fetching hostel complaints.' });
  }
});

// Get all college complaints
router.get('/college/all', verifyAnyUser, async (req, res) => {
  try {
    const userRole = req.user.role;
    let complaints;

    if (userRole === 'student') {
      // Students only see their own college complaints
      complaints = await Complaint.find({ studentId: req.user.id, category: 'college' }).sort({ createdAt: -1 });
      res.json(complaints);
    } else if (userRole === 'warden' || userRole === 'faculty' || userRole === 'admin') {
      // Admins can see all college complaints
      const rawComplaints = await Complaint.find({ category: 'college' })
        .populate('studentId', 'name usn branch year hostelBlock roomNumber')
        .sort({ createdAt: -1 })
        .lean();

      // Mask student details if anonymous
      complaints = rawComplaints.map(complaint => {
        if (complaint.isAnonymous) {
          complaint.studentId = null;
        }
        return complaint;
      });

      res.json(complaints);
    } else {
      res.status(403).json({ error: 'Access denied. Invalid role.' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error while fetching college complaints.' });
  }
});

// Get single complaint details
router.get('/:id', verifyAnyUser, async (req, res) => {
  try {
    const userRole = req.user.role;
    let complaint = await Complaint.findById(req.params.id)
      .populate('studentId', 'name usn branch year hostelBlock roomNumber')
      .lean();
    
    if (!complaint) return res.status(404).json({ error: 'Complaint not found.' });

    // If requesting user is student, they can only view their own
    if (userRole === 'student' && complaint.studentId._id.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to view this complaint.' });
    }

    // Hide student details if anonymous (and an admin is viewing it, the author already knows they created it)
    if (userRole !== 'student' && complaint.isAnonymous) {
      complaint.studentId = null;
    }

    res.json(complaint);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error while fetching complaint.' });
  }
});

// Update complaint status (Admin only)
router.put('/:id/status', verifyAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) return res.status(400).json({ error: 'No status provided.' });

    const update = { status };

    // Set the corresponding timestamp
    if (status === 'approved') update.approvedAt = new Date();
    else if (status === 'rejected') update.rejectedAt = new Date();
    else if (status === 'resolved') update.resolvedAt = new Date();

    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      update,
      { new: true }
    ).populate('studentId', 'name usn branch year hostelBlock roomNumber');

    if (!complaint) return res.status(404).json({ error: 'Complaint not found.' });

    res.json(complaint);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error while updating complaint status.' });
  }
});

// Upvote or remove upvote for a complaint (Student only)
router.put('/:id/upvote', verifyStudent, async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ error: 'Complaint not found.' });

    const studentId = req.user.id;
    const hasUpvoted = complaint.upvotes.includes(studentId);

    if (hasUpvoted) {
      // Remove upvote
      complaint.upvotes = complaint.upvotes.filter(id => id.toString() !== studentId);
    } else {
      // Add upvote
      complaint.upvotes.push(studentId);
    }

    await complaint.save();
    
    res.json({ message: 'Upvote toggled successfully', upvotesCount: complaint.upvotes.length, upvotes: complaint.upvotes });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error while toggling upvote.' });
  }
});

// Add a comment to a complaint (Admin/Warden only)
const Admin = require('../models/admin');

router.post('/:id/comments', verifyAdmin, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) return res.status(400).json({ error: 'Comment text is required.' });

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ error: 'Complaint not found.' });

    // Get admin name from DB
    const admin = await Admin.findById(req.user.id);
    const authorName = admin ? admin.name : 'Admin';

    complaint.comments.push({
      text: text.trim(),
      authorName,
      role: req.user.role
    });

    await complaint.save();

    res.status(201).json(complaint);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error while adding comment.' });
  }
});

module.exports = router;
