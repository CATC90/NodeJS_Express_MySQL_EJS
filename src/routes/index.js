const express = require('express');
const router = express.Router();
const passport = require('passport');
const helpers = require('../lib/helper');
const path = require('path');
const keys = require('../keys');
const pool = require('../database');


router.get('/', helpers.isLoggedout, (req, res) => {
    res.redirect('/index');
});

router.get('/index', helpers.isLoggedout, (req, res) => {
    console.log('Mensaje flash : ' + req.flash('success'));
    res.render('../views/index.ejs', {
        route: req.active
    });
});

router.post('/index/signup', helpers.isLoggedout, passport.authenticate('local.signup', {
    successRedirect: '/links',
    failureRedirect: '/index',
    failureFlash: true
}));

router.post('/index/login', helpers.isLoggedout, passport.authenticate('local.login', {
    successRedirect: '/links',
    failureRedirect: '/index',
    failureFlash: true
}));

router.get('/index/logout', helpers.isLoggedin, (req, res) => {
    req.logOut();
    res.redirect('/');
});

router.get('/user_profile', helpers.isLoggedin, async (req, res) => {
    res.render('profile.ejs', {
        route: req.active
    });
});

router.post('/user_profile_edit', helpers.isLoggedin, async (req, res) => {
    const data = req.body;
    console.log(data);
    const update_user = {};

    try {

        if (data.old_password != '') {
            if (await helpers.comparePassword(data.old_password, req.user.password)) {
                update_user.password = await helpers.encrypt(data.new_password);
            } else {
                req.flash('message', 'Error with the old password !')
                res.redirect('/user_profile');
            }
        }

        update_user.fullname = data.fullname;
        update_user.email = data.email;
        update_user.biography = data.biography;

        const _avatar_path = path.join(keys._pathUserPhotos, req.user.id.toString(), 'avatar', 'avatar.jpg');
        console.log(_avatar_path);
        req.files.photo.mv(_avatar_path, (err) => {
            if (err) {
                console.log('Error en grabar imagen en :' + _avatar_path);
            };
        });
        update_user.avatar = 'avatar.jpg';

        await pool.query('update user set ? where id = ?', [update_user, req.user.id]);
        req.flash('success', 'Profile updated successfully!');
        res.redirect('/user_profile');

    } catch (e) {
        console.log(e);
        if (data.old_password != '') {
            if (await helpers.comparePassword(data.old_password, req.user.password)) {
                update_user.password = await helpers.encrypt(data.new_password);
            } else {
                req.flash('message', 'Error with the old password !')
                res.redirect('/user_profile');
            }
        }

        update_user.fullname = data.fullname;
        update_user.email = data.email;
        update_user.biography = data.biography;

        await pool.query('update user set ? where id = ?', [update_user, req.user.id]);
        req.flash('success', 'Profile updated successfully!');
        res.redirect('/user_profile');
    }
});



module.exports = router;