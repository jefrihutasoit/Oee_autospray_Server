// const mongoose = require("mongoose")import mongoose from "mongoose"
const mongoose = require("mongoose")


const machine_listsSchema = mongoose.Schema({

    original_name: {
        type: String
    },
    Number: {
        type: String
    },
    id_identification: {
        type: String
    },
    line_location: {
        type: String
    },
    ip_address: {
        type: String
    },
    port_adr: {
        type: String
    },
    status: {
        type: String
    },
    group: {
        type: Number
    }
});

module.exports = mongoose.model('machine_lists', machine_listsSchema)


