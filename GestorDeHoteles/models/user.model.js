'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = Schema({
    firstName: String,
    lastName: String,
    userName: String,
    email: String,
    password: String,
    phone: String,
    role: String
})

module.exports = mongoose.model('user', userSchema);