const mongoose = require('mongoose');

const EmployeeSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  middleName: { type: String },
  lastName: { type: String, required: true },
  department: { type: String, required: true },
  designation: { type: String, required: true },
  mobileNumber: { type: String, required: true },
  officeEmail: { type: String, required: true, unique: true },
  personalEmail: { type: String, required: true },
  password: { type: String, required: true },
  technology: { type: String },
  skypeId: { type: String },
  employmentType: { type: String },
  birthDate: { type: Date },
  joiningDate: { type: Date },
  aadharCard: { type: String },
  panCard: { type: String },
  gender: { type: String },
  role: { type: String },
  profilepic: { type: String }, // Store image path
});

module.exports = mongoose.model('Employee', EmployeeSchema);
