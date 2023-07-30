// import mongoose, { mongo } from 'mongoose'
const mongoose = require('mongoose')

const sChemaHistoryoperation = mongoose.Schema({

    id_identification: {
        type: String
    },
    status: {
        type: String
    },
    start_time: {
        type: Date
    },
    end_time: {
        type: Date
    },
    duration: {
        type: String
    },
    duration_on_second: {
        type: Number
    },
    batch_cloter: {
        type: String,
    },
    shift: {
        type: Number,
    },
    work_condition: {
        type: String,
    },
    updated_at: {
        type: String
    }
})

module.exports = mongoose.model("machine_histories", sChemaHistoryoperation)
