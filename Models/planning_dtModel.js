const mongoose = require("mongoose")


const dtPlanningSchema = mongoose.Schema({

    dt_description: {
        type: String,
        require: true
    },
    dt_duration: {
        type: Number,
        require: true
    }
});

module.exports = mongoose.model('dt_planning_list', dtPlanningSchema)