'use strict'

var express = require('express');
var userController = require('../controllers/user.controller');
var authenticade = require('../middlewares/authenticade');
var api = express.Router();

api.post('/saveUser', userController.saveUser);
api.get('/listUsers', authenticade.ensureAuthAdmin, userController.listUsers);
api.put('/editUser/:id', authenticade.ensureAuth, userController.editUser);
api.delete('/deleteUser/:id', authenticade.ensureAuth, userController.deleteUser);

api.post('/searchDates/:id', authenticade.ensureAuth, userController.searchDates);
api.post('/searchRating/:id', authenticade.ensureAuth, userController.searchRating);
api.post('/searchNames/:id', authenticade.ensureAuth, userController.searchName);
api.post('/searchPrice/:id', authenticade.ensureAuth, userController.searchPrice);

api.post('/login', userController.login);

api.get('/pdf/:uid/:hid', authenticade.ensureAuth, userController.createPdf);
module.exports = api;