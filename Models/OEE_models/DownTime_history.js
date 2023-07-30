const mongoose = require("mongoose")



const dtListSchemaHistory = mongoose.Schema({

    dt_code: {
        type: String,
    },
    dt_description: {
        type: String,
    },
    duration: {
        // Type: Number
    },
    Parent_schedule: {
        // Type: id
    },
    Status: {

    },
    time_issue: {
        // Type: Date
    },
    Name: {

    }
});

module.exports = mongoose.model('dt_listHistory', dtListSchemaHistory)
