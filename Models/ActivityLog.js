const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
    employeeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
        required: true
    },
    timesheetId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Timesheet'
    },
    activity: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
}, {
    timestamps: true
});

module.exports = mongoose.model('ActivityLog', activityLogSchema);
