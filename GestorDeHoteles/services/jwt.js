'use strict'

var jwt = require('jwt-simple');
var moment = require('moment');
var key = 'clave_12345';

exports.createTokenUser = (user) =>{
    var payload = {
        sub: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        userName: user.userName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        iat: moment().unix(),
        exp: moment().add(2, "hours").unix() 
    }
    return jwt.encode(payload, key)
}

exports.createTokenHotel = (hotel) =>{
    var payload = {
        sub: hotel._id,
        name: hotel.name,
        address: hotel.address,
        phone: hotel.phone,
        price: hotel.price,
        qualification: hotel.qualification,
        date: hotel.date,
        userName: hotel.userName,
        iat: moment().unix(),
        exp: moment().add(2, "hours").unix()
    }
    return jwt.encode(payload, key);
}    
