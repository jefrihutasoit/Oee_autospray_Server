const mongoose = require("mongoose")



const DB = mongoose.Schema({

    Code: {
        // type: String,
    },
    Remarks: {
        // type: String,
    },
    Quantity: {
        // Type: Number
    },
    Parent_schedule: {
        // Type: id
    },
    Date: {

    }
});

module.exports = mongoose.model('RejectPartHistory', DB)