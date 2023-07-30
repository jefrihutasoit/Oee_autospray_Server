// const mongoose = require("mongoose")import mongoose from "mongoose"
//komitment
//Run => mesin sedang beroprasi
//Standby => mesin ready on
//Alarm => mesin tidak ready-on dan alarm termasuk emg
//Stop => mesin tidak ready on, bisa off
//Disconnect => system tidak terhubung

const { mongoose, mongo } = require("mongoose")


const BatchHistorySchema = mongoose.Schema({
    id_identification: {
        type: String,
        require: true
    },
    original_name: {
        type: String,
        require: true
    },
    batch_start: {
        type: Date,
    },
    batch_end: {
        type: Date,
    },
    shift: {
        type: String,
    },
    data: {
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
    }
});

// exports.mongoose.model('batchhistories', BatchHistorySchema)
// exports.mongoose.model('batchhistories', BatchHistorySchema)
module.exports = mongoose.model("BatchHistory", BatchHistorySchema)
