'use strict'

var User = require('../models/user.model');
var Hotel = require('../models/hotel.model');

var bcrypt = require('bcrypt-nodejs');
var jwt = require('../services/jwt');
var fs = require('fs');
var pdf = require('pdfkit');

function saveUser(req, res){
    var params = req.body;
    var user = new User(); 

    if(params.firstName && params.userName && params.email && params.password){
        User.findOne({$or:[{userName: params.userName}, {email: params.email}, {phone: params.phone}]}, (err, finded) =>{
            if(err){
                res.status(500).send({message:'Error general'});
            }else if(finded){
                res.send({message:'Nombre de usuario, correo o telefono ya existentes.'});
            }else{
                user.firstName = params.firstName;
                user.lastName = params.lastName;
                user.userName = params.userName;
                user.email = params.email;
                user.phone = params.phone;
                user.role = 'ADMIN';

                bcrypt.hash(params.password, null, null, (err, passwordHash)=>{
                    if(err){
                        res.status(500).send({message:'Error al enctriptar la contrasenia'});
                    }else if(passwordHash){
                        user.password = passwordHash;
                        user.save(user, (err, userSaved)=>{
                            if(err){
                                res.status(500).send({message:'Error general'});
                            }else if(userSaved){
                                res.send({message: 'Usuario guardado', user:userSaved});
                            }else{
                                res.status(403).send({message:'No se pudo guardar al usuario'});
                            }
                        })
                    }else{
                        res.status(418).send({message:'Error no esperado'});
                    }
                })
            }
        })
    }else{
        res.send({message:'Envie los datos requeridos'});
    }
}

function listUsers(req, res){
    User.find({}, (err, users)=>{
        if(err){
            res.status(418).send({message: 'Error general en la busqueda'});
        }else if (users){
            res.send({users});
        }else{
            res.status(418).send({message: 'Sin datos que mostrar'});
        }
    });
}

function editUser(req, res){
    var userId = req.params.id;
    var update = req.body;

    if(userId != req.user.sub){
        res.status(403).send({message:'Error de permisos para esta ruta'});
    }else{
        User.findByIdAndUpdate(userId, update, {new:true}, (err, updated)=>{
            if(err){
                res.status(500).send({message:'Error general'});
            }else if(updated){
                res.send({message:'Se a actualizado al usuario', user:updated});
            }else{
                res.status(404).send({message:'No se a podido actualizar al usuario'});
            }
        })
    }
}

function deleteUser(req, res){
    var userId = req.params.id;

    if(userId != req.user.sub){
        res.status(403).send({message:'Error de permisos para esta ruta'});
    }else if (userId == req.user.sub){
        User.findByIdAndRemove(userId, (err, removed)=>{
            if(err){
                res.status(500).send({message:'Error general'});
            }else if(removed){
                res.send({message:'Se a eliminado el usuario', user: removed});
            }else{
                res.status(404).send({message:'No se a podido eliminar el usuario'});
            }
        })
    }
}

function login(req, res){
    var params = req.body;

    if(params.userName || params.email){
        if(params.password){
            User.findOne({$or:[{userName: params.userName}, {email:params.email}]}, (err, finded)=>{
                if(err){
                    res.status(500).send({message:'Error general'});
                }else if(finded){
                    bcrypt.compare(params.password, finded.password, (err, passwordOk)=>{
                        if(err){
                            res.status(500).send({message:'Error al comparar'});
                        }else if(passwordOk){
                            if(params.getToken = true){
                                res.send({token: jwt.createTokenUser(finded)});
                            }else{
                                res.send({message:'Bienvenido', user:finded});
                            }
                        }
                    })
                }else{
                    res.send({message:'Datos de usuario incorrectos'});
                }
            })
        }else{
            res.send({message:'Ingrese su contrasenia'});
        }
    }else{
        res.send({message:'Ingrese su usuario o correo'});
    }
}

function searchDates(req, res){
    var userId = req.params.id;
    var params = req.body;

    if(userId != req.user.sub){
        res.status(403).send({message:'Error de permisos de ruta'});
    }else{
        if(params.sDate && params.eDate){

            var start = new Date(params.sDate.toString());
            var end = new Date(params.eDate.toString());

            Hotel.find({$and:[{sDate: {$gte: start}}, {eDate:{$lt: end}}]}, (err, finded)=>{
                if(err){
                    res.status(500).send({message:'Error general'});
                }else if(finded){
                    res.send({hoteles:finded});
                }else{
                    res.status(404).send({message:'No se encontraron hoteles disponibles'});
                }
            })
        }else{
            res.send({message:'Ingrese un rango de fechas'});
        }
    }
}

function searchRating(req, res){
    var userId = req.params.id;

    if(userId != req.user.sub){
        res.status(403).send({message:'Error de permisos para esta ruta'});
    }else{
        Hotel.find({},(err, finded)=>{
            if(err){
                res.status(500).send({message:'Error general'});
            }else if(finded){
                res.send({hoteles:finded});
            }else{
                res.status(404).send({message:'No se encontraron hoteles'});
            }
        }).sort({qualification:-1})
    }
}

function searchName(req, res){
    var userId = req.params.id;

    if(userId != req.user.sub){
        res.status(403).send({message:'Error de permisos para esta ruta'});
    }else{
        Hotel.find({},(err, finded)=>{
            if(err){
                res.status(500).send({message:'Error general'});
            }else if(finded){
                res.send({hoteles:finded});
            }else{
                res.status(404).send({message:'No se encontraron hoteles'});
            }
        }).sort({name:1})
    }
}

function searchPrice(req, res){
    var userId = req.params.id;
    var params = req.body;


    if(userId != req.user.sub){
        res.status(403).send({message:'Error de permisos para esta ruta'});
    }else{
        //Menor a mayor
        if(params.search == 1){
            Hotel.find({},(err, finded)=>{
                if(err){
                    res.status(500).send({message:'Error general'});
                }else if(finded){
                   res.send({hoteles:finded});
                }else{
                   res.status(404).send({message:'No se encontraron hoteles'});
                }
            }).sort({price:1})
        }else if(params.search == 0){
            //Mayor a menor
            Hotel.find({},(err, finded)=>{
                if(err){
                    res.status(500).send({message:'Error general'});
                }else if(finded){
                   res.send({hoteles:finded});
                }else{
                   res.status(404).send({message:'No se encontraron hoteles'});
                }
            }).sort({price:-1})            
        }else{
            res.status(403).send({message:'Ingrese los parametros solicitados'});
        }
    }
}

function createPdf(req, res){
    var userId = req.params.uid;
    var hotelId = req.params.hid;
    var doc = new pdf();
    var date = new Date();

    Hotel.findById(hotelId, (err, finded)=>{
        if(err){
            res.status(500).send({message:'Error general', err});
        }else if(finded){
            User.findById(userId, (err, findedUser)=>{
                if(err){
                    res.status(500).send({message:'Error general', err});
                }else if(finded){
                    doc.pipe(fs.createWriteStream('./pdfFiles/HotelReservado' + date.getDate() + date.getTime() + '.pdf')); 
                    doc.fontSize(20);
                    doc.font('Times-Roman');
                    doc.text('Informacion del hotel:', {align: 'center'});
                    doc.moveDown();
                    doc.text('Nombre del hotel: ' + finded.name);
                    doc.moveDown();
                    doc.text('Direccion del hotel: ' + finded.address);
                    doc.moveDown();
                    doc.text('Telefono del hotel: ' + finded.phone);
                    doc.moveDown();
                    doc.text('Precio del hotel: ' + finded.price);
                    doc.moveDown();
                    doc.text('Calificacion del hotel: ' + finded.qualification);
                    doc.moveDown();
                    doc.text('Informacion del que reserva:', {align: 'center'});
                    doc.moveDown();
                    doc.text('Nombre del usuario: ' + findedUser.firstName + " " + findedUser.lastName);
                    doc.moveDown();
                    doc.text('Email del usuario: ' + findedUser.email);
                    doc.moveDown();
                    doc.text('Telefono dele usuario: ' + findedUser.phone);

                    doc.rect(doc.x, 50, 500, doc.y).stroke();
        
                    doc.end();
                    res.send({message:'Exitoso'});
                }else{
                    res.status(404).send({message:'Error no esperado'});
                }
            })
        }else{
            res.status(404).send({message:'No se encontro el hotel'});
        }
    })
}

module.exports = {
    saveUser,
    listUsers,
    editUser,
    deleteUser,
    login,
    searchDates,
    searchRating,
    searchName,
    searchPrice,
    createPdf
}