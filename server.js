const express = require('express');
const connectDB = require('./db'); // Assuming you have a database connection file
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

const app = express();

// Connect to database
connectDB();
// CORS configuration
// Enable CORS for requests from specific origin
app.use(cors({
  origin: 'http://localhost:5173',  // Allow requests from this frontend URL
  methods: ['GET', 'POST', 'PUT', 'DELETE'],  // Allowed methods
  credentials: true  // If you are sending cookies or authorization headers
}));
// Parse JSON request bodies
app.use(bodyParser.json());
// Serve static files from the 'uploads' directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));



// Define your API routes
app.use('/api/auth', require('./Routes/auth'));
app.use('/api/employees', require('./Routes/employeeRoutes'));

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
    console.log(`Server started successfully on port ${PORT}`);
});