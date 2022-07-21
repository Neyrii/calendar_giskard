const express = require('express')

const reservationModel = require('../models/reservationModel')
const availabilityModel = require('../models/availabilityModel')

const routeur = express.Router()

routeur.get('/add', async (req, res) => {
    let available = await availabilityModel.find().sort({start: 1})
    let availables = JSON.stringify(available)
    if (available.length === 0){
        res.render('add_event.html.twig', {errorMsg : req.query.error})
    }
    else{
        res.render('add_event.html.twig', {availables: availables, errorMsg : req.query.error})
    }
})

const checkInput = (req, res, next) => {
    const {email, title, start, end} = req.body
    // Everything is well filled
    if (email === '' || title === '' || start === null || end === null){
        const errorMsg = encodeURIComponent('Please fill everything')
        res.redirect('/event/add?error=' + errorMsg)
        return
    }
    // Check that the dates are in a good order
    if (start > end){
        const errorMsg = encodeURIComponent('The beginning date can\' be after the finishing one :/')
        res.redirect('/event/add?error=' + errorMsg)
        return
    }
    // Thanks to the JS present in the front end, we are shure that the event is taken during a period where I am free
    next()
}

routeur.post('/add', checkInput, async(req, res) => {
    const {email, title, start, end} = req.body
    console.log({
        'start' : start,
        'end': end
    })
    let goodAvailable = await availabilityModel.findOne({start: {$lte: start}, end: {$gte: end}})
    // just a simple check
    if (goodAvailable == null){
        const errorMsg = encodeURIComponent('Even the developer can\'t say what is wrong...')
        res.redirect('/event/add?error=' + errorMsg)
        return
    }
    await reservationModel({email: email, title: title, start: start, end: end}).save()
    // Now redirection to the deletion of the availability with start and end..
    res.redirect(307, '/availability/delete') 
})

routeur.post('/delete', async(req, res) =>{
    const {email, start} = req.body
    let startRdv = await reservationModel.findOne({start: start})
    // just a simple check
    if (startRdv == null){
        res.redirect('/error')
    }
    else if (startRdv.email != email){
        const msg = encodeURIComponent('The email is incorect')
        res.redirect('/?msg='+ msg)
    }
    else{
        await reservationModel.deleteOne({_id : startRdv._id})
        res.redirect(307, '/availability/add')
    }
})

module.exports = routeur