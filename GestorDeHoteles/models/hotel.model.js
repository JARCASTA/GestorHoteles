'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var hotelSchema = Schema({
    name: String,
    address: String,
    phone: String,
    price: Number,
    qualification: Number,
    sDate: Date,
    eDate: Date,
    userName: String,
    password: String
})

module.exports = mongoose.model('hotel', hotelSchema);