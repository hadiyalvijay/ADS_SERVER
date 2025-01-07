const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Timesheet = require('../Models/Timesheet');
const ActivityLog = require('../Models/ActivityLog');

// Log activity helper function
const logActivity = async (employeeId, timesheetId, activity) => {
    const activityLog = new ActivityLog({
        employeeId,
        timesheetId,
        activity
    });
    await activityLog.save();
};

// Authentication middleware
const auth = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) {
        return res.status(403).json({ message: 'No token provided' });
    }

    jwt.verify(token, config.secret, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        req.employee = { id: decoded.id }; // Attach user id to request
        next();
    });
};

// Punch In
router.post('/punch-in', auth, async (req, res) => {
    try {
        const employeeId = req.employee.id;

        // Check for active timesheet
        const activeTimesheet = await Timesheet.findOne({
            employeeId,
            status: { $ne: 'PUNCHED_OUT' }
        });

        if (activeTimesheet) {
            return res.status(400).json({ message: 'Already punched in' });
        }

        const timesheet = new Timesheet({
            employeeId,
            startTime: new Date(),
            status: 'PUNCHED_IN'
        });

        await timesheet.save();
        await logActivity(employeeId, timesheet._id, 'PUNCH_IN');

        res.status(201).json(timesheet);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Lunch In
router.post('/lunch-in', auth, async (req, res) => {
    try {
        const employeeId = req.employee.id;

        const timesheet = await Timesheet.findOne({
            employeeId,
            status: 'PUNCHED_IN'
        });

        if (!timesheet) {
            return res.status(400).json({ message: 'No active timesheet found' });
        }

        const currentTime = new Date();
        const elapsedTime = Math.floor((currentTime - timesheet.startTime) / 1000);

        timesheet.workTime += elapsedTime;
        timesheet.startTime = currentTime;
        timesheet.status = 'ON_LUNCH';

        await timesheet.save();
        await logActivity(employeeId, timesheet._id, 'LUNCH_IN');

        res.json(timesheet);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Lunch Out
router.post('/lunch-out', auth, async (req, res) => {
    try {
        const employeeId = req.employee.id;

        const timesheet = await Timesheet.findOne({
            employeeId,
            status: 'ON_LUNCH'
        });

        if (!timesheet) {
            return res.status(400).json({ message: 'Not on lunch break' });
        }

        const currentTime = new Date();
        const lunchDuration = Math.floor((currentTime - timesheet.startTime) / 1000);

        timesheet.lunchTime += lunchDuration;
        timesheet.startTime = currentTime;
        timesheet.status = 'PUNCHED_IN';

        await timesheet.save();
        await logActivity(employeeId, timesheet._id, 'LUNCH_OUT');

        res.json(timesheet);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Break In
router.post('/break-in', auth, async (req, res) => {
    try {
        const employeeId = req.employee.id;

        const timesheet = await Timesheet.findOne({
            employeeId,
            status: 'PUNCHED_IN'
        });

        if (!timesheet) {
            return res.status(400).json({ message: 'No active timesheet found' });
        }

        const currentTime = new Date();
        const elapsedTime = Math.floor((currentTime - timesheet.startTime) / 1000);

        timesheet.workTime += elapsedTime;
        timesheet.startTime = currentTime;
        timesheet.status = 'ON_BREAK';

        await timesheet.save();
        await logActivity(employeeId, timesheet._id, 'BREAK_IN');

        res.json(timesheet);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Break Out
router.post('/break-out', auth, async (req, res) => {
    try {
        const employeeId = req.employee.id;

        const timesheet = await Timesheet.findOne({
            employeeId,
            status: 'ON_BREAK'
        });

        if (!timesheet) {
            return res.status(400).json({ message: 'Not on break' });
        }

        const currentTime = new Date();
        const breakDuration = Math.floor((currentTime - timesheet.startTime) / 1000);

        timesheet.breakTime += breakDuration;
        timesheet.startTime = currentTime;
        timesheet.status = 'PUNCHED_IN';

        await timesheet.save();
        await logActivity(employeeId, timesheet._id, 'BREAK_OUT');

        res.json(timesheet);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Punch Out
router.post('/punch-out', auth, async (req, res) => {
    try {
        const employeeId = req.employee.id;

        const timesheet = await Timesheet.findOne({
            employeeId,
            status: { $ne: 'PUNCHED_OUT' }
        });

        if (!timesheet) {
            return res.status(400).json({ message: 'No active timesheet found' });
        }

        const currentTime = new Date();
        let additionalTime = Math.floor((currentTime - timesheet.startTime) / 1000);

        switch (timesheet.status) {
            case 'PUNCHED_IN':
                timesheet.workTime += additionalTime;
                break;
            case 'ON_LUNCH':
                timesheet.lunchTime += additionalTime;
                break;
            case 'ON_BREAK':
                timesheet.breakTime += additionalTime;
                break;
        }

        timesheet.endTime = currentTime;
        timesheet.totalWorkTime = timesheet.workTime;
        timesheet.status = 'PUNCHED_OUT';

        await timesheet.save();
        await logActivity(employeeId, timesheet._id, 'PUNCH_OUT');

        res.json(timesheet);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get Current Timesheet
router.get('/current', auth, async (req, res) => {
    try {
        const employeeId = req.employee.id;

        if (!employeeId) {
            return res.status(400).json({ message: 'Employee ID is missing' });
        }

        const timesheet = await Timesheet.findOne({
            employeeId,
            status: { $ne: 'PUNCHED_OUT' }
        });

        res.json(timesheet || { message: 'No active timesheet' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get Timesheet History
router.get('/history', auth, async (req, res) => {
    try {
        const timesheets = await Timesheet.find({
            employeeId: req.employee.id,
            status: 'PUNCHED_OUT'
        }).sort({ date: -1 });

        res.json(timesheets);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get Activity Log
router.get('/activity-log', auth, async (req, res) => {
    try {
        const activities = await ActivityLog.find({
            employeeId: req.employee.id
        }).sort({ timestamp: -1 });

        res.json(activities);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
