'use strict'

var Hotel = require('../models/hotel.model');
var jwt = require('../services/jwt');
var bcrypt = require('bcrypt-nodejs');


function saveHotel(req, res){
    var hotel = new Hotel();
    var params = req.body;
    var userId = req.params.id;

    if(userId != req.user.sub){
        res.status(403).send({message:'Error de permisos de ruta'});
    }else{
        if(params.name && params.address && params.phone && params.price  && params.userName && params.password){
            Hotel.findOne({$or:[{name: params.name},{address: params.address}, {phone: params.phone}, {userName: params.userName}]}, (err, finded)=>{
                if(err){
                    res.status(500).send({message:'Error general', err});
                }else if(finded){
                    res.send({message:'Nombre, direccion, telefono o usuario ya en uso'});
                }else{
                    hotel.name = params.name;
                    hotel.address = params.address;
                    hotel.phone = params.phone;
                    hotel.price = params.price;
                    hotel.qualification = params.qualification;
                    hotel.sDate = params.sDate;
                    hotel.eDate = params.eDate;
                    hotel.userName = params.userName

                    bcrypt.hash(params.password, null, null,(err, passwordHash)=>{
                        if(err){
                            res.status(500).send({message:'Error al encriptar contrasenia'});
                        }else if(passwordHash){
                            hotel.password = passwordHash;
                            hotel.save(hotel, (err, hotelSaved)=>{
                                if(err){
                                    res.status(500).send({message:'Error general', err});
                                }else if(hotelSaved){
                                    res.send({message:'Se a guardado el hotel con exito', hotel:hotelSaved});
                                }else{
                                    res.status(404).send({message:'No se pudo guardar el usuario'});
                                }
                            })
                        }
                    })
                }
            })
        }else{
            res.send({message:'Ingrese todos los campos solicitados'})
        }
    }
}

function listHotels(req, res){
    Hotel.find({}, (err, hotels)=>{
        if(err){
            res.status(418).send({message: 'Error general en la busqueda'});
        }else if (hotels){
            res.send({hotels});
        }else{
            res.status(418).send({message: 'Sin datos que mostrar'});
        }
    });
}

function editHotel (req, res){
    var hotelId = req.params.id;
    var update = req.body;

    if(hotelId != req.user.sub){
        res.status(403).send({message:'Error de permisos para esta ruta'});
    }else{
        Hotel.findByIdAndUpdate(hotelId, update, {new:true}, (err, updated)=>{
            if(err){
                res.status(500).send({message:'Error general'});
            }else if(updated){
                res.send({message:'Hotel actualizado correctamente', updated});
            }else{
                res.status(404).send({message:'No se a podido actualizar al hotel'});
            }
        })
    }
}

function deleteHotel(req, res){
    var hotelId = req.params.id;
    
    if(hotelId != req.user.sub){
        res.status(403).send({message:'Error de permisos de ruta'});
    }else{
        Hotel.findByIdAndRemove(hotelId, (err, removed)=>{
            if(err){
                res.status(500).send({message:'Error general'});
            }else if(removed){
                res.send({message:'Hotel eliminado', removed});
            }else{
                res.status(404).send({message:'No se pudo eliminar ese hotel'});
            }
        })
    }
}

function login(req, res){
    var params = req.body;

    if(params.userName){
        if(params.password){
            Hotel.findOne({$or:[{userName: params.userName}]}, (err, finded)=>{
                if(err){
                    res.status(500).send({message:'Error general'});
                }else if(finded){
                    bcrypt.compare(params.password, finded.password, (err, passwordOk)=>{
                        if(err){
                            res.status(500).send({message:'Error al comparar'});
                        }else if(passwordOk){
                            if(params.getToken = true){
                                res.send({token: jwt.createTokenHotel(finded)});
                            }else{
                                res.send({message:'Bienvenido', hotel:finded});
                            }
                        }
                    })
                }else{
                    res.send({message:'Datos de hotel incorrectos'});
                }
            })
        }else{
            res.send({message:'Ingrese su contrasenia'});
        }
    }else{
        res.send({message:'Ingrese su usuario'});
    }
}


module.exports = {
    saveHotel,
    listHotels,
    editHotel,
    deleteHotel,
    login
}