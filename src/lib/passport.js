const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const fs = require('fs');
const pool = require('../database');
const helpers = require('../lib/helper');
const keys = require('../keys');


passport.use('local.login', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
}, async (req, email, password, done) => {
    const result = await pool.query('select * from user where email = ?', [email]);
    if (result[0] != null) {
        if (await helpers.comparePassword(password, result[0].password)) {
            return done(null, result[0], req.flash('success', 'Welcome back ' + result[0].fullname));
        } else {
            console.log('password dosent match');
            return done(null, false, req.flash('message', 'Password dosent match'));
        }
    } else {
        return done(null, false, req.flash('message', 'Unknown email'));
    }
}));



passport.use('local.signup', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
}, async (req, username, password, done) => {

    const user = {};
    const data = req.body;
    if (helpers.rutVerify(data.rut)) {
        user.rut = data.rut;
    } else {
        console.log('incorrect rut')
        return done(null, null, req.flash('message', 'Incorrect Rut'));
    }
    const emailVerify = await pool.query('select email from user;');
    emailVerify.forEach(emailRecived => {
        console.log(emailRecived);
        if (data.email == emailRecived.email) {
            return done(null, null, req.flash('message', 'Email is already in use !'));
        }
    });
    user.email = data.email;
    user.fullname = data.name + " " + data.lastname;
    user.user_type = data.user_type;
    user.avatar = data.avatar;
    if (data.password == data.confirm) {
        user.password = await helpers.encrypt(data.password);
    } else {
        console.log('password dosent match')
        return done(null, false, req.flash('message', 'Error in confirm password'));
    }
    console.log(user);
    const result = await pool.query('insert into user set ?', [user]);
    user.id = result.insertId;

    if (!fs.existsSync(keys._pathUserPhotos + user.id)) {
        fs.mkdirSync(keys._pathUserPhotos + user.id);
        fs.mkdirSync(keys._pathUserPhotos + user.id + '/avatar');
    }
    done(null, user);
}));



passport.serializeUser((usr, done) => {
    done(null, usr.id);
});

passport.deserializeUser(async (id, done) => {
    const rows = await pool.query('select * from user where id = ?', [id]);
    done(null, rows[0]);
});