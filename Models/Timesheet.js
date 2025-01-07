const mongoose = require('mongoose');

const timesheetSchema = new mongoose.Schema({
    employeeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
        required: true
    },
    date: { type: Date, default: Date.now },
    startTime: { type: Date },
    endTime: { type: Date },
    workTime: { type: Number, default: 0 }, // in seconds
    lunchTime: { type: Number, default: 0 }, // in seconds
    breakTime: { type: Number, default: 0 }, // in seconds
    totalWorkTime: { type: Number, default: 0 }, // in seconds
    status: {
        type: String,
        enum: ['PUNCHED_IN', 'ON_LUNCH', 'ON_BREAK', 'PUNCHED_OUT'],
        default: 'PUNCHED_OUT'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Timesheet', timesheetSchema);
