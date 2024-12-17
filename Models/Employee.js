const mongoose = require('mongoose');

const EmployeeSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  middleName: { type: String, default: '' },
  lastName: { type: String, required: true },
  department: { type: String, required: true },
  designation: { type: String, required: true },
  mobileNumber: { type: String, required: true },
  officeEmail: { type: String, required: true, unique: true },
  personalEmail: { type: String, required: true },
  password: { type: String, required: true },
  technology: { type: String, default: '' },
  skypeId: { type: String, default: '' },
  employmentType: { type: String, default: '' },
  birthDate: { type: Date },
  joiningDate: { type: Date },
  aadharCard: { type: String, default: '' },
  panCard: { type: String, default: '' },
  gender: { type: String, default: '' },
  role: { type: String, required: true },
  profilePic: {
    type: String 
  }
}, {
  timestamps: true 
});

module.exports = mongoose.model('Employee', EmployeeSchema);
