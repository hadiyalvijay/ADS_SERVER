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

   
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
   
    cb(null, Date.now() + path.extname(file.originalname));
  }
});


const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 
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


router.post('/', upload.single('profilepic'), async (req, res) => {
  const {
    firstName, middleName, lastName, department, designation, mobileNumber, officeEmail,
    personalEmail, password, confirmPassword, technology, skypeId, employmentType,
    birthDate, joiningDate, aadharCard, panCard, gender, role
  } = req.body;

  if (!req.file) {
    return res.status(400).json({ msg: 'No file uploaded' });
  }

  if (!firstName || !lastName || !department || !designation || !mobileNumber || !officeEmail || !personalEmail || !password || !confirmPassword) {
    return res.status(400).json({ msg: 'All required fields must be filled' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(officeEmail) || !emailRegex.test(personalEmail)) {
    return res.status(400).json({ msg: 'Invalid email format' });
  }

  const phoneRegex = /^[0-9]{10}$/;
  if (!phoneRegex.test(mobileNumber)) {
    return res.status(400).json({ msg: 'Mobile number must be 10 digits' });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ msg: 'Passwords do not match' });
  }

  try {
    const existingEmployee = await Employee.findOne({ officeEmail });
    if (existingEmployee) {
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({ msg: 'Employee already exists with this office email' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

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

    await newEmployee.save();
    res.status(201).json({ 
      msg: 'Employee created successfully', 
      employee: newEmployee,
      profilePic: newEmployee.profilePic,
      profilePicPath: path.join(req.protocol + '://' + req.get('host'), newEmployee.profilePic)
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Internal Server Error');
  }
});


router.get('/', async (req, res) => {
  try {
    const employees = await Employee.find({}, '-password');
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
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ msg: 'Invalid Employee ID' });
    }

    const employee = await Employee.findById(id, '-password');
    if (!employee) {
      return res.status(404).json({ msg: 'Employee not found' });
    }

    res.status(200).json(employee);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Internal Server Error');
  }
});

// PUT route to update an employee by ID
router.put('/:id', upload.single('profilepic'), async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  try {
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ msg: 'Invalid Employee ID' });
    }

    const employee = await Employee.findById(id);
    if (!employee) {
      return res.status(404).json({ msg: 'Employee not found' });
    }

    if (req.file) {
      if (employee.profilePic) {
        fs.unlinkSync(path.join(__dirname, '../..', 'ADS_FRONTEND', employee.profilePic));
      }
      updates.profilePic = path.join('/uploads', req.file.filename);
    }

    const updatedEmployee = await Employee.findByIdAndUpdate(id, updates, { new: true });
    res.status(200).json({ msg: 'Employee updated successfully', employee: updatedEmployee });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Internal Server Error');
  }
});

// DELETE route to delete an employee by ID
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ msg: 'Invalid Employee ID' });
    }

    const employee = await Employee.findById(id);
    if (!employee) {
      return res.status(404).json({ msg: 'Employee not found' });
    }

    if (employee.profilePic) {
      fs.unlinkSync(path.join(__dirname, '../..', 'ADS_FRONTEND', employee.profilePic));
    }

    await Employee.findByIdAndDelete(id);
    res.status(200).json({ msg: 'Employee deleted successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Internal Server Error');
  }
});

module.exports = router;
