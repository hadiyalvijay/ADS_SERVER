const express = require('express');
const connectDB = require('./db'); 
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

const app = express();

connectDB();

app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true  
}));


app.use(bodyParser.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', require('./Routes/auth'));
app.use('/api/employees', require('./Routes/employeeRoutes'));

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
    console.log(`Server started successfully on port ${PORT}`);
});