const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
    required: true
  },
  templateType: {
    type: String,
    enum: ['leave', 'permission', 'event', 'medical', 'other'],
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending'
  },
  teacherRemarks: {
    type: String,
    default: ''
  },
  respondedAt: Date
}, { timestamps: true });

module.exports = mongoose.model('Application', applicationSchema);
