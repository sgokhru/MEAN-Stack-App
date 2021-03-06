var User = require('../models/user');
var jwt = require('jsonwebtoken');
var config = require('../config/database');

module.exports = function(router) {
    router.post('/register', function(req, res, next) {
        if (!req.body.email) {
            res.json({success: false, message: 'You must provide an e-mail'});
        } else if (!req.body.username) {
            res.json({success: false, message: 'You must provide a username'});
        } else if (!req.body.password) {
            res.json({success: false, message: 'You must provide a password'});
        } else {
            var user = new User({
                email: req.body.email.toLowerCase(),
                username: req.body.username.toLowerCase(),
                password: req.body.password
            });
            user.save(function(err) {
                if (err) {
                    // Check if error is an error indicating duplicate account
                    if (err.code === 11000) {
                        res.json({ success: false, message: 'Username or e-mail already exists' }); // Return error
                    } else {
                        // Check if error is a validation rror
                        if (err.errors) {
                            // Check if validation error is in the email field
                            if (err.errors.email) {
                                res.json({ success: false, message: err.errors.email.message }); // Return error
                            } else {
                                // Check if validation error is in the username field
                                if (err.errors.username) {
                                    res.json({ success: false, message: err.errors.username.message }); // Return error
                                } else {
                                    // Check if validation error is in the password field
                                    if (err.errors.password) {
                                        res.json({ success: false, message: err.errors.password.message }); // Return error
                                    } else {
                                        res.json({ success: false, message: err }); // Return any other error not already covered
                                    }
                                }
                            }
                        } else {
                            res.json({ success: false, message: 'Could not save user. Error: ', err }); // Return error if not related to validation
                        }
                    }
                } else {
                    res.json({ success: true, message: 'Acount registered!' }); // Return success
                }
            });
        }
    });

    router.get('/checkEmail/:email', function(req, res, next) {
        if(!req.params.email) {
            res.json({success: false, message: 'E-mail is not provided'});
        } else {
            User.findOne({email: req.params.email}, function(err, user) {
                if (err) {
                    res.json({success: false, message: err});
                } else if(user) {
                    res.json({success: false, message: 'Email address is already taken'});
                } else {
                    res.json({success: true, message: 'Email is available'});
                }
            });
        }
    });

    router.get('/checkUsername/:username', function(req, res, next) {
        if(!req.params.username) {
            res.json({success: false, message: 'Username is not provided'});
        } else {
            User.findOne({username: req.params.username}, function(err, user) {
                if (err) {
                    res.json({success: false, message: err});
                } else if(user) {
                    res.json({success: false, message: 'Username is already taken'});
                } else {
                    res.json({success: true, message: 'Username is available'});
                }
            });
        }
    });

    router.post('/login', function(req, res, next) {
        if (!req.body.username) {
            res.json({success: false, message: 'No username was provided'});
        } else if (!req.body.password) {
            res.json({ success: false, message: 'No password was provided' });
        } else {
            User.findOne({username: req.body.username.toLowerCase()}, function(err, user) {
                if(err) {
                    res.json({ success: false, message: err });
                } else if(!user) {
                    res.json({ success: false, message: 'Username not found' });
                } else {
                    const validPassword = user.comparePassword(req.body.password);
                    if (!validPassword) {
                        res.json({ success: false, message: 'Password invalid' });
                    } else {
                        var token = jwt.sign({userId: user._id}, config.secret, {expiresIn: '24h'});
                        res.json({ success: true, message: 'Success!', token: token, user: {username: user.username} });
                    }
                }
            })
        }
    });

    router.use(function(req, res, next) {
        const token = req.headers['authorization'];
        if(!token) {
            res.json({ success: false, message: 'No token provided' })
        } else {
            jwt.verify(token, config.secret, function(err, decoded) {
                if (err) {
                    res.json({ success: false, message: 'Token invalid: ' + err })
                } else {
                    req.userId = decoded.userId;
                    next();
                }
            })
        }
    });

    router.get('/profile', function(req, res, next) {
        User.findOne({ _id: req.userId }).select('username email').exec(function(err, user) {
            if(err) {
                res.json({ success: false, message: err });
            } else if(!user) {
                res.json({ success: false, message: 'User not found' });
            } else {
                res.json({ success: true, user: user });
            }
        })
    });

    return router;
};