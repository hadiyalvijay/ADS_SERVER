const express = require('express');
const connectDB = require('./db'); // Assuming you have a database connection file
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();

// Connect to database
connectDB();

// CORS configuration
app.use(cors({
  origin: 'https://adsbyuv.surge.sh' // Replace with your frontend's origin
}));

// Parse JSON request bodies
app.use(bodyParser.json());

// Define your API routes
app.use('/api/auth', require('./Routes/auth'));
app.use('/api/employees', require('./Routes/employeeRoutes'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));