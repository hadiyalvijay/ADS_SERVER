const express = require('express');
const path = require('path');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const Employee = require('../Models/Employee');
const router = express.Router();

// Configure multer for image upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../public/images')); // Set destination folder
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName); // Set unique file name
  },
});

const upload = multer({ storage });

// Create Employee (POST)
router.post('/', upload.single('profilepic'), async (req, res) => {
  const {
    firstName, middleName, lastName, department, designation, mobileNumber, officeEmail,
    personalEmail, password, confirmPassword, technology, skypeId, employmentType,
    birthDate, joiningDate, aadharCard, panCard, gender, role,
  } = req.body;

  try {
    // Check if all required fields are provided
    if (!firstName || !lastName || !department || !designation || !mobileNumber || !officeEmail || !personalEmail || !password || !confirmPassword) {
      return res.status(400).json({ msg: 'Please fill in all fields' });
    }

    // Check if employee already exists
    const existingEmployee = await Employee.findOne({ officeEmail });
    if (existingEmployee) {
      return res.status(400).json({ msg: 'Employee already exists with this office email' });
    }

    // Validate password confirmation
    if (password !== confirmPassword) {
      return res.status(400).json({ msg: 'Passwords do not match' });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Get the profile picture path
    const profilePicPath = req.file ? `/images/${req.file.filename}` : null;

    // Create new employee
    const newEmployee = new Employee({
      firstName,
      middleName,
      lastName,
      department,
      designation,
      mobileNumber,
      officeEmail,
      personalEmail,
      password: hashedPassword,
      technology,
      skypeId,
      employmentType,
      birthDate,
      joiningDate,
      aadharCard,
      panCard,
      gender,
      role,
      profilepic: profilePicPath, // Save the image path
    });

    await newEmployee.save();
    res.status(201).json({ msg: 'Employee created successfully', employee: newEmployee });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// GET all employees
router.get('/', async (req, res) => {
  try {
    const employees = await Employee.find();
    res.status(200).json({ employees });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// GET a single employee by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const employee = await Employee.findById(id);
    if (!employee) {
      return res.status(404).json({ msg: 'Employee not found' });
    }
    res.status(200).json(employee);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
