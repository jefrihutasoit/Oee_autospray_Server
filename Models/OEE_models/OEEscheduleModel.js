const { mongoose, mongo } = require("mongoose")


const Oee_schedule_schema = mongoose.Schema({
    Machine: {
        id_identification: {
            type: String,
            require: true
        },
        original_name: {
            type: String,
            require: true
        },
        status: {

        }
    },
    Machine_id_identification: {
        // Type: String
    },
    Time_data: {
        batch_start: {
            type: Date,
        },
        batch_end: {
            type: Date,
        },
        shift: {
            type: Number,
        },
    },
    Planning: {
        // Schedule: {
        //     Type: String
        // },
        // Part_number: {
        //     Type: String
        // },
        // Output: {
        //     Type: String
        // },
        // Cycle_time: {
        //     Type: Number
        // },
        // Down_time_in_seconds: {
        //     Type: Number
        // },
        // Operating_time: {
        //     Type: Number
        // }
    },
    Actual: {
        Output: {
            Type: Number
        },
        Output_reject: {
            Type: Number
        },
        Cycle_time: {
            Type: Number
        },
        Down_time_in_seconds: {
            Type: Number
        },
        Operating_time: {
            Type: Number
        }
    },

    Operation_info: {
        status: {
            type: String
        },
        total_run: {
            type: Number
        },
        total_stop: {
            type: Number
        },
        total_alarm: {
            type: Number
        },
        total_standby: {
            type: Number
        },
        total_off: {
            Type: Number
        },
        total_disconnect: {
            Type: Number
        }
    },
    Labour: {
        // Operator: {
        //     ID_i: {
        //         Type: String
        //     },
        //     Name: {
        //         Type: String
        //     }
        // },
        // Leader: {
        //     ID_i: {
        //         Type: String
        //     },
        //     Name: {
        //         Type: String
        //     }
        // }
    },
    OEE_data: {
        Performance: {
            Type: Number
        },
        Availability: {
            Type: Number
        },
        Quality: {
            Type: Number
        },
        OEE: {
            Type: Number
        }
    },
    Active: {
        // Type: Boolean
    },
    Done_by:{
        
    }

});

// exports.mongoose.model('batchhistories', BatchHistorySchema)
// exports.mongoose.model('batchhistories', BatchHistorySchema)
module.exports = mongoose.model("Oee_models", Oee_schedule_schema)