const express = require('express')

const availabilityModel = require('../models/availabilityModel')

const routeur = express.Router()



routeur.get('/add', (req, res) =>{
    res.render('add_availability.html.twig', {errorMsg : req.query.error})
})

// Middleware to check if the input is good
const checkInput =  (req, res, next) => {
    let {password, start, end} = req.body
    // First we check the password :D
    if (password != 'Giskard'){
        const errorMsg = encodeURIComponent('The Password is not the good one, Think harder it\'s the name of a great company')
        res.redirect('/availability/add?error=' + errorMsg)
        return
    }
    // If everything is not filled
    if (req.body.start == '' || req.body.end == ''){
        const errorMsg = encodeURIComponent('Please fill everything');
        res.redirect('/availability/add?error=' + errorMsg)
        return
    }
    // Then we need to check that start and end are in the right order
    else if (start > end){
        const errorMsg = encodeURIComponent('The end date can\' be before the start date');
        res.redirect('/availability/add?error=' + errorMsg)
        return
    }
    next()
}

routeur.post('/add', checkInput, async (req, res) =>{ 
    const availabilities = await availabilityModel.find();
    // Lastly we will concatenate every availability
    let {start, end} = req.body
    start = new Date(start)
    end = new Date(end)
    for (const av of availabilities) {
        const av_start = new Date(av.start)
        const av_end = new Date (av.end)
        // For each element we look if there is time in common with the new one. If it's the case we just modify the original one
        if (av_start > start && av_end < end){
            start = av_start
            end = av_end
        }
        else if (av_start > start && av_start < end){
            end = av_end
        }
        else if (av_end > start && av_end < end) {
            start = av_start
        }
        else if (av_start <= start && av_end >= end){ 
            // This case is if the new availability is entirely contained into the original one
        }
        else{
            continue;
        }
        await availabilityModel.deleteOne({_id : av._id})
    }
    // If we are here, we need to add a new availability.
    await availabilityModel({start: start, end: end}).save()
    res.redirect('/')
})

routeur.get('/delete', (req, res) => {
    res.render('delete_availability.html.twig')
})

routeur.post('/delete', checkInput, async (req, res) => {
    const availabilities = await availabilityModel.find();
    let {start, end} = req.body
    // Now we will remove every part of an availability present between start and end
    // Same method than for the adding of the availability
    // If the user delete and it wasn't already available it does nothing
    start = new Date(start)
    end = new Date(end)
    for (const av of availabilities) {
        const av_start = new Date(av.start)
        const av_end = new Date (av.end)
        // For each element we look if there is time in common with the new one. If it's the case we just modify the original one
        if (av_start >= start && av_end <= end){ // if we delete entirely an availability
            await availabilityModel.deleteOne({_id : av._id})
        }
        else if (av_start > start && av_start < end){
            await availabilityModel.updateOne({_id : av._id}, {start: end})
        }
        else if (av_end > start && av_end < end) {
            await availabilityModel.updateOne({_id : av._id}, {end: start})
        }
        else if (av_start < start && av_end > end){ // if we split an availability into 2 parts
            await availabilityModel.updateOne({_id: av._id}, {end: start})
            const newAvailability = new availabilityModel({start: end, end: av_end})
            await newAvailability.save()
        }
    }
    res.redirect('/')
})

module.exports = routeur