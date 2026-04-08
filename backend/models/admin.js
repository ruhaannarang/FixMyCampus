const adminSchema = new mongoose.Schema({
  name: String,
  email: {
    type: String,
    unique: true
  },
  password: String,
  role: {
    type: String,
    enum: ["faculty", "warden"]
  },
  department: String,       
  hostelAssigned: String    
});