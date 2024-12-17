const express = require('express');
const bcrypt = require('bcryptjs');
const Employee = require('../Models/Employee');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();

// Configure Multer storage for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../..', 'ADS_FRONTEND', 'uploads');

    // Create the uploads directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate a unique filename based on the current timestamp
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

// File filter for validating file types and size (5MB max for images)
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedFileTypes = /jpeg|jpg|png|gif/;
    const extname = allowedFileTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedFileTypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Only images are allowed (jpeg, jpg, png, gif)'));
    }
  }
});

// POST route for creating an employee
router.post('/', upload.single('profilepic'), async (req, res) => {
  const {
    firstName, middleName, lastName, department, designation, mobileNumber, officeEmail,
    personalEmail, password, confirmPassword, technology, skypeId, employmentType,
    birthDate, joiningDate, aadharCard, panCard, gender, role
  } = req.body;

  // Check if file is uploaded
  if (!req.file) {
    return res.status(400).json({ msg: 'No file uploaded' });
  }

  // Validate required fields
  if (!firstName || !lastName || !department || !designation || !mobileNumber || !officeEmail || !personalEmail || !password || !confirmPassword) {
    return res.status(400).json({ msg: 'All required fields must be filled' });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(officeEmail) || !emailRegex.test(personalEmail)) {
    return res.status(400).json({ msg: 'Invalid email format' });
  }

  // Validate phone number format (10 digits)
  const phoneRegex = /^[0-9]{10}$/;
  if (!phoneRegex.test(mobileNumber)) {
    return res.status(400).json({ msg: 'Mobile number must be 10 digits' });
  }

  // Check if passwords match
  if (password !== confirmPassword) {
    return res.status(400).json({ msg: 'Passwords do not match' });
  }

  try {
    // Check if employee already exists by office email
    const existingEmployee = await Employee.findOne({ officeEmail });
    if (existingEmployee) {
      // Remove the uploaded file if the employee already exists
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({ msg: 'Employee already exists with this office email' });
    }

    // Hash the password using bcrypt
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create a new Employee object
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
      profilePic: req.file ? path.join('/uploads', req.file.filename) : '',
    });

    // Save the employee to the database
    await newEmployee.save();
    res.status(201).json({ msg: 'Employee created successfully', employee: newEmployee, profilePic: newEmployee.profilePic });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Internal Server Error');
  }
});

// GET route to fetch all employees
router.get('/', async (req, res) => {
  try {
    const employees = await Employee.find({}, '-password'); // Exclude password field from the response
    res.status(200).json(employees);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Internal Server Error');
  }
});

// GET route to fetch a single employee by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    // Validate if the ID is a valid ObjectId
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ msg: 'Invalid Employee ID' });
    }

    const employee = await Employee.findById(id, '-password'); // Exclude password field from the response
    if (!employee) {
      return res.status(404).json({ msg: 'Employee not found' });
    }

    res.status(200).json(employee);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Internal Server Error');
  }
});

module.exports = router;
