const mongoose = require('mongoose')
const Schema = mongoose.Schema

const availabilitySchema = new Schema ({
    start: {
        type: Date,
        required: true
    },
    end: {
        type: Date,
        required: true
    }
})

module.exports = mongoose.model('Availability', availabilitySchema)