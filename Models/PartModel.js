// const mongoose = require("mongoose")import mongoose from "mongoose"
const mongoose = require("mongoose")


const partListSchema = mongoose.Schema({

    part_number: {
        type: String,
        require: true
    },
    description1: {
        type: String,
        require: true
    },
    description2: {
        type: String,
        require: true
    },
    output_percycle: {
        type: Number,
        require: true
    },
    default_ct: {
        type: Number,
        require: true
    },
    default_target_output: {
        type: Number,
        require: true
    }
});

module.exports = mongoose.model('part_list', partListSchema)
