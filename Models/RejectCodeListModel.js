const mongoose = require("mongoose")

const DB = mongoose.Schema({

    Code: {
        type: String,
        require: true
    },
    Description: {
        type: String,
        require: true
    }
});

module.exports = mongoose.model('RejectCodeList', DB)