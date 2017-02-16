// app/routes.js

'use strict'

var crypto = require('crypto');

// load up the question answer model
const question = require('../app/models/question');
const appRoot = require('app-root-path');
const frontEndRoot = appRoot + '/views/FrontEnd/';
const watsonToken = require('./watson-token');
const accountManage = require('./account');
const uploadQuestionByTextFile = require('./file-to-questionDB');
const User = require(appRoot + "/app/models/user");
const testingAPIModule = require(appRoot + '/app/testing/testAPI');
const profileAPI = require(appRoot + '/app/profile');
const validator = require("email-validator");
const serverStatusAPI = require(appRoot + '/app/api/server-status');

module.exports = function(app, passport) {

    // =====================================
    // HOME PAGE (with login links) ========
    // =====================================
    app.get('/', function(req, res) {
        res.render(frontEndRoot + 'index.ejs', {user: req.user}); // load the index.ejs file
    });

    // =====================================
    // LOGIN ===============================
    // =====================================
    // show the login form
    app.get('/login', function(req, res) {
        if (req.isAuthenticated()) {
            res.redirect('/profile');
        } else {
            // render the page and pass in any flash data if it exists
            res.render(frontEndRoot + 'login.ejs', {message: req.flash('loginMessage')});
        }
    });

    // process the login form
    app.post('/login', (req, res, next) => {
        // precondition checking
        // callback with email and password
        if (!req.body.email || req.body.email.length == 0) {
            res.send({status: 302, type: 'error', information: 'Email can\'t be empty'});
            return;
        }
        if (!req.body.password || req.body.password.length == 0) {
            res.send({status: 302, type: 'error', information: 'Password can\'t be empty'});
            return;
        }
        if (!validator.validate(req.body.email)) {
            res.send({status: 302, type: 'error', information: 'Invaild email'});
            return;
        }
        passport.authenticate('local-login', (err, user, info) => {
            if (err) {
                return res.send({status: 302, type: 'error', information: err});
            } else {
                // req / res held in closure
                req.logIn(user, function(err) {
                    if (err) {
                        return res.send({status: 302, type: 'error', information: err});
                    }
                    return res.send({status: 200, type: 'success', information: "Login success"});
                });
            }
        })(req, res, next);
    });

    // =====================================
    // SIGNUP ==============================
    // =====================================
    // show the signup form
    app.get('/signup', function(req, res) {
        // render the page and pass in any flash data if it exists
        res.render(frontEndRoot + 'signup.ejs', {message: req.flash('signupMessage')});
    });

    // process the signup form
    app.post('/signup', (req, res, next) => {
        // precondition checking
        if (checkSignUpParameter(req, res)) {
            //email and password not empty, start local authentication
            passport.authenticate('local-signup', function(err, user, info) {
                if (err) {
                    return res.send({status: 302, type: 'error', information: err});
                } else {
                    // req / res held in closure
                    req.logIn(user, function(err) {
                        if (err) {
                            return res.send({status: 302, type: 'error', information: err});
                        }
                        return res.send({status: 200, type: 'success', information: "Successfully registered"});
                    });
                }
            })(req, res, next)
        }
    });

    // =====================================
    // PROFILE SECTION =========================
    // =====================================
    // we will want this protected so you have to be logged in to visit
    // we will use route middleware to verify this (the isLoggedInRedirect function)
    app.get('/profile', isLoggedInRedirect, function(req, res) {
        let path = "";

        switch (req.user.type) {
            case "local":
                path = "local";
                break;
            case "twitter":
                path = "twitter";
                break;
            case "linkedin":
                path = "linkedin";
                break;
            case "facebook":
                path = "facebook";
                break;
            case "google":
                path = "google";
                break;
            default:
                throw new Error("Request user type is unexcepted");
                break;
        };

        User.findById(req.user._id, function(err, foundUser) {
            res.render(frontEndRoot + 'profile.ejs', {
                user: req.user, // get the user out of session and pass to template
                ask_history: foundUser[path].ask_history,
                privacy: foundUser.privacy
            });
        });
    });

    // =====================================
    // FACEBOOK ROUTES =====================
    // =====================================
    // route for facebook authentication and login
    app.get('/auth/facebook', passport.authenticate('facebook', {scope: 'email'}));

    // handle the callback after facebook has authenticated the user
    app.get('/auth/facebook/callback', passport.authenticate('facebook', {
        successRedirect: '/profile',
        failureRedirect: '/'
    }));

    // =====================================
    // TWITTER ROUTES =====================
    // =====================================
    // route for facebook authentication and login
    app.get('/auth/twitter', passport.authenticate('twitter', {scope: 'email'}));

    // handle the callback after facebook has authenticated the user
    app.get('/auth/twitter/callback', passport.authenticate('twitter', {
        successRedirect: '/profile',
        failureRedirect: '/'
    }));

    // =====================================
    // GOOGLE ROUTES =====================
    // =====================================
    app.get('/auth/google', passport.authenticate('google', {
        scope: ['https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/user.birthday.read https://www.googleapis.com/auth/plus.me', 'profile']
    }));

    // handle the callback after facebook has authenticated the user
    app.get('/auth/google/callback', passport.authenticate('google', {
        successRedirect: '/profile',
        failureRedirect: '/'
    }));

    // =====================================
    // LINKEDIN ROUTES =====================
    // =====================================
    // route for facebook authentication and login
    app.get('/auth/linkedin', passport.authenticate('linkedin', {
        scope: ['r_basicprofile', 'r_emailaddress']
    }));

    app.get('/auth/linkedin/callback', passport.authenticate('linkedin', {
        successRedirect: '/profile',
        failureRedirect: '/'
    }));

    // =====================================
    // INSTAGRAM ROUTES =====================
    // =====================================
    // route for facebook authentication and login
    // app.get('/auth/instagram', passport.authenticate('instagram'));
    //
    // app.get('/auth/instagram/callback', passport.authenticate('instagram', {
    //     successRedirect: '/profile',
    //     failureRedirect: '/'
    // }));

    // =====================================
    // REDDIT ROUTES =====================
    // =====================================
    // route for facebook authentication and login
    // app.get('/auth/reddit', function(req, res, next) {
    //     req.session.state = crypto.randomBytes(32).toString('hex');
    //     passport.authenticate('reddit', {
    //         state: req.session.state,
    //         duration: 'permanent'
    //     })(req, res, next);
    // });
    //
    // app.get('/auth/reddit/callback', function(req, res, next) {
    //     // Check for origin via state token
    //     if (req.query.state == req.session.state) {
    //         passport.authenticate('reddit', {
    //             successRedirect: '/profile',
    //             failureRedirect: '/'
    //         })(req, res, next);
    //     } else {
    //         next(new Error(403));
    //     }
    // });

    // =====================================
    // AMAZON ROUTES =====================
    // =====================================
    // route for facebook authentication and login
    // app.get('/auth/amazon', passport.authenticate('amazon', {
    //     scope: ['profile', 'postal_code']
    // }));
    //
    // app.get('/auth/amazon/callback', passport.authenticate('amazon', {
    //     successRedirect: '/profile',
    //     failureRedirect: '/'
    // }));

    // =====================================
    // WECHAT ROUTES =====================
    // =====================================
    // route for wechat authentication and login
    // app.get('/auth/wechat', passport.authenticate('wechat', {scope: ['profile']}));
    //
    // app.get('/auth/wechat/callback', passport.authenticate('wechat', {
    //     successRedirect: '/profile',
    //     failureRedirect: '/'
    // }));

    // =====================================
    // LOGOUT ==============================
    // =====================================
    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });

    // =====================================
    // Admin console
    // =====================================
    app.get('/admin', isLoggedInRedirect, function(req, res) {
        res.render(frontEndRoot + 'admin.ejs', {
            message: req.flash('Message'),
            user: req.user
        }); // load the index.ejs file
    });

    // =================================================
    // Routes for developer manage question and answer
    // =================================================

    app.get('/QuestionAnswerManagement', isLoggedInRedirect, function(req, res) {
        res.render(frontEndRoot + 'question-Answer-Management.ejs', {
            message: req.flash('Message'),
            user: req.user
        }); // load the index.ejs file
    });

    app.post('/postQuestionAnswer', isLoggedInRedirect, function(req, res) {
        //input check
        var questionContext = req.body.question;
        var answerContext = req.body.answer;
        var tagContext = req.body.tag;
        console.log(req.user._id);
        if (questionContext.length == 0) {
            res.send({user: req.user, status: "302", type: 'warning', message: "Question can not be empty"})
        } else {
            //create DB object
            var QA_pair = new question();

            //assign values
            QA_pair.question_body = questionContext;
            QA_pair.question_answer = answerContext;
            QA_pair.question_tag = tagContext;
            QA_pair.question_submitter = req.user._id;
            QA_pair.question_upload_mothod = "mannual";

            //Save to DB
            QA_pair.save(function(err) {
                if (err) {
                    res.send({
                        user: req.user,
                        status: "302",
                        type: 'error',
                        message: err + "</br>Save data to other place."
                    })
                    throw err;
                }
                // if successful, return the new user
                res.send({user: req.user, status: "200", type: 'success', message: "Successfully added entry"})
            });
        }
    });

    app.get('/viewQuestionAnswer', isLoggedInNotice, function(req, res) {
        //input parameter

        //create DB connection

        //find entry

        //send to client

    });

    ////////////////////////////////////////////////
    // Front end files routes
    ///////////////////////////////////////////////////
    app.get('/css/*', function(req, res) {
        res.sendfile(req.path, {
            'root': root
        }, function(err) {
            if (err) {
                console.log(err);
                res.status(err.status).end();
            } else {
                console.log('Sent:', req.path);
            }
        });
    });

    app.get('/fonts/*', function(req, res) {
        res.sendfile(req.path, {
            'root': root
        }, function(err) {
            if (err) {
                console.log(err);
                res.status(err.status).end();
            } else {
                console.log('Sent:', req.path);
            }
        });
    });

    app.get('/js/*', function(req, res) {
        res.sendfile(req.path, {
            'root': root
        }, function(err) {
            if (err) {
                console.log(err);
                res.status(err.status).end();
            } else {
                console.log('Sent:', req.path);
            }
        });
    });

    app.get('/img/*', function(req, res) {
        res.sendfile(req.path, {
            'root': root
        }, function(err) {
            if (err) {
                pmt(err);
                res.status(err.status).end();
            } else {
                console.log('Sent:', req.path);
            }
        });
    });

    // router for user ask questionn not on index page
    app.get('/external-ask', (req,res)=>{
      const question = req.query.question;
      console.log(req.query.question);
      req.external_question = question;
      res.render(frontEndRoot + 'index.ejs', { external_question: req.external_question, user: req.user});
    })

    ///////////////////////////////////////////////////
    /// API
    ///////////////////////////////////////////////////

    // Get speech to text token route
    app.use('/api/speech-to-text', watsonToken);

    // local user apply to be admin
    app.use('/api/account', isLoggedInNotice, accountManage);

    // admin upload questions from text file
    app.use('/api/admin/upload/', isLoggedInRedirect, uploadQuestionByTextFile);

    // General server functionality testing api
    app.use('/api/testing/', testingAPIModule);

    //  Profile APIs
    app.use('/api/profile', isLoggedInRedirect, profileAPI);

    // Server status APIs
    app.use('/api/server-status', serverStatusAPI);
};

// route middleware to make sure
function isLoggedInRedirect(req, res, next) {

    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/login');
}

function isLoggedInNotice(req, res, next) {

    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.send({status: "error", information: "Login required"});
}

function checkSignUpParameter(req, res) {
    // callback with email and password from our form
    if (!req.body.first_name || req.body.first_name.length == 0 || !req.body.last_name || req.body.last_name.length == 0) {
        res.send({status: 302, type: 'error', information: 'Name can\'t be empty'});
        return false;
    }
    if (!req.body.email || req.body.email.length == 0) {
        res.send({status: 302, type: 'error', information: 'Email can\'t be empty'});
        return false;
    }
    if (!req.body.password || req.body.password.length == 0) {
        res.send({status: 302, type: 'error', information: 'Password can\'t be empty'});
        return false;
    }
    if (!req.body.account_role) {
        res.send({status: 302, type: 'error', information: 'Invaild account role'});
        return false;
    }

    if (req.body.account_role === "Admin" && (!req.body['admin-token'] || req.body['admin-token'] == 0)) {
        res.send({status: 302, type: 'error', information: 'Missing developer token for registering as developer'});
        return false;
    }

    if (req.body.account_role === "Admin" && !validateAdminToken(req.body['admin-token'])) {
        res.send({status: 302, type: 'error', information: 'Invaild admin token'});
        return false;
    }
    return true;
}

const validateAdminToken = function(code) {
    const correctSecret = "bwqlrEfvDofy7nZC8NLDXFlbh92rbL2moCxBSrXv8stqPcZjeGJCpbJ2QF2yh2iTBnWpEorY5ll2KTfl91FBEc5IEqnQboOfV319Js8fan6gRKHXSBwqbNPy3oRcKENfHQbTBPPCZSz2VaG4pLIB2K7VzL4AD93w7iKrDMfYeggwUGKJf0tX6xAAUyQwZQO5Wswn00aYtPYwst19WlKoFl3eEUQRQ05qFrLP5WwbG7ALmZSLztCnysBKGtUWyFa2";
    if (code === correctSecret) {
        return true;
    } else {
        return false;
    }
}
