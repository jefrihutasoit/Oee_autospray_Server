const mongoose = require("mongoose")


const dtListSchema = mongoose.Schema({

    dt_code: {
        type: String,
        require: true
    },
    dt_description: {
        type: String,
        require: true
    }
});

module.exports = mongoose.model('dt_list', dtListSchema)
