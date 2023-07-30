const mongoose = require('mongoose')


const trial_db = mongoose.Schema({
    Type: String
})


module.exports = mongoose.model('trial_db', trial_db)