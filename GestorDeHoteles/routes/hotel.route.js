'use strict'

var express = require('express');
var hotelController = require('../controllers/hotel.controller');
var authenticade = require('../middlewares/authenticade');
var api = express.Router();

api.post('/saveHotel/:id', authenticade.ensureAuthAdmin,hotelController.saveHotel);
api.get('/listHotels', authenticade.ensureAuthAdmin, hotelController.listHotels);
api.put('/editHotel/:id', authenticade.ensureAuth, hotelController.editHotel);
api.delete('/deleteHotel/:id', authenticade.ensureAuth, hotelController.deleteHotel);

api.post('/login', hotelController.login);

module.exports = api;