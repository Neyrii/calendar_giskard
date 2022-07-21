const mongoose = require('mongoose')
const Schema = mongoose.Schema

const reservationSchema = new Schema ({
    title: {
        type: String,
        required: true
    },
    email : {
        type: String,
        required: true 
    },
    start: {
        type: Date,
        required: true
    },
    end: {
        type: Date,
        required: true
    }
})

module.exports = mongoose.model('Reservation', reservationSchema)