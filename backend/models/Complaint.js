const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  title: String,
  description: String,
  image: String,
  category: {
    type: String,
    enum: ["hostel", "college"]
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  isAnonymous: {
    type: Boolean,
    default: false
  },
  upvotes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student'
  }],
  status: {
    type: String,
    default: "pending"
  },
  approvedAt: Date,
  rejectedAt: Date,
  resolvedAt: Date,
  comments: [{
    text: { type: String, required: true },
    authorName: { type: String, required: true },
    role: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Complaint', complaintSchema);