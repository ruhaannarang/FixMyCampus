const complaintSchema = new mongoose.Schema({
  title: String,
  description: String,
  image: String,
  category: {
    type: String,
    enum: ["hostel", "academic"]
  },
  status: {
    type: String,
    default: "pending"
  }
});