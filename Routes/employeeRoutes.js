const express = require('express');
const bcrypt = require('bcryptjs');
const Employee = require('../Models/Employee');
const router = express.Router();

// Create Employee (POST)
router.post('/', async (req, res) => {
  const {
    firstName, middleName, lastName, department, designation, mobileNumber, officeEmail,
    personalEmail, password, confirmPassword, technology, skypeId, employmentType,
    birthDate, joiningDate, aadharCard, panCard, gender, role, profilepic
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
      profilepic,
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
    const employees = await Employee.find();  // Fetch all employees from the database
    res.status(200).json(employees);  // Return all employees in the response
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// GET a single employee by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const employee = await Employee.findById(id);  // Fetch a single employee by its ID
    if (!employee) {
      return res.status(404).json({ msg: 'Employee not found' });
    }
    res.status(200).json(employee);  // Return the employee data
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
