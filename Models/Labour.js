const mongoose = require("mongoose")


const LabourSchema = mongoose.Schema({

    ID: {
        type: String,
        require: true
    },
    Name: {
        type: String,
        require: true
    },
    Role: {
        type: String,
        require: true
    }
});

module.exports = mongoose.model('Labour_list', LabourSchema)