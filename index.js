const express = require('express')
// Initialisation of the environment variables
require('dotenv').config()
const bodyParser = require('body-parser')
// Initialisation of the db
require('./dbInit')()

const availabilityModel = require('./models/availabilityModel')
const reservationModel = require('./models/reservationModel')

const availability = require('./routes/availability')
const event = require('./routes/event')

const server = express()
server.use(bodyParser.urlencoded({
    extended:true
}))

server.use('/availability', availability)
server.use('/event', event)
server.use(express.static('static'))


const port = process.env.PORT || 3000

server.get('/', async (req, res) => {
    // We need to find every availability and every Reservation 
    const everyavailability = await availabilityModel.find()
    const stravail = JSON.stringify(everyavailability)
    const everyReservation = await reservationModel.find()
    const strreser = JSON.stringify(everyReservation)
    res.render('calendar.html.twig', {availability : stravail, reservations : strreser, msg : req.query.msg})
})

server.get('*', (req, res) => {
    res.status(404)
    res.end('ERROR 404 PAGE NOT FOUND')
})
server.listen(port, () => console.log('listening on localhost port ' + port))
