const studentSchema = new mongoose.Schema({
  name: String,
  usn: {
    type: String,
    required: true,
    unique: true
  },
  password: String,
  branch: String,
  year: Number,
  hostelBlock: String,
  roomNumber: String
});