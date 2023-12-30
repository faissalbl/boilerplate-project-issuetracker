const mongoose = require('mongoose');

const issueSchema = new mongoose.Schema({
    project: {
        type: String,
        required: true,
        index: true,
    }, 
    issue_title: {
        type: String,
        required: true,
    },
    issue_text: {
        type: String,
        required: true,
    },
    created_by: {
        type: String,
        required: true,
    },
    assigned_to: { 
        type: String,
        default: ''
    },
    created_on: {
        type: Date,
        default: new Date().toISOString(),
    },
    updated_on: {
        type: Date,
        default: new Date().toISOString(),
    },
    open: {
        type: Boolean,
        default: true,
    },
    status_text: {
        type: String,
        default: ''
    }
});

const Issue = mongoose.model('Issue', issueSchema);

module.exports = Issue;
