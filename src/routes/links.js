const express = require('express');
const router = express.Router();
const pool = require('../database');
const keys = require('../keys');
const helper = require('../lib/helper');
const path = require('path');
const fs = require('fs');
const fsX = require('fs-extra');

router.get('/add', helper.isLoggedin, (req, res) => {
    res.render('../views/partials/add.ejs', {
        route: req.active,
        status: 'add'
    });
});

router.post('/add', helper.isLoggedin, async (req, res) => {

    var file = req.files.photo;
    var photo = file.name;

    const {
        title,
        description,
        plataform
    } = req.body;

    const newGame = {
        title,
        photo,
        user_id: req.user.id,
        description,
        plataform
    };
    console.log(req.body);

    const result = await pool.query('Insert into Juego set ?', [newGame]);


    try {
        if (!fsX.existsSync(path.join(keys._pathUserPhotos, req.user.id.toString(), result.insertId.toString()))) {
            fsX.mkdirSync(path.join(keys._pathUserPhotos, req.user.id.toString(), result.insertId.toString()));
            fsX.mkdirSync(path.join(keys._pathUserPhotos, req.user.id.toString(), result.insertId.toString(), 'min_photo'));
            fsX.mkdirSync(path.join(keys._pathUserPhotos, req.user.id.toString(), result.insertId.toString(), 'review_photos'));
        }
    } catch (e) {
        console.log('Algo salio mal');
    }
    if (req.body.review_title != "" && req.body.info != "") {
        const review = {};
        review.info = req.body.info;
        review.game = result.insertId;
        review.review_title = req.body.review_title;
        review.review_photo = req.files.review_photo.name;

        const review_photo = await pool.query('insert into review set ?', [review]);

        //Solucion parche para setear el mismo valor de la id con un .jpg para reconocer la foto de la review
        const update = review_photo.insertId + '.jpg';
        await pool.query('update review set review_photo = ? where id = ?', [update, review_photo.insertId]);
        //fin parche

        req.files.review_photo.mv(path.join(keys._pathUserPhotos, req.user.id.toString(), result.insertId.toString(), 'review_photos', review_photo.insertId + '.jpg'), (err) => {
            if (err) {
                return res.status(500).send(err);
            };
        });
    }
    req.files.photo.mv(path.join(keys._pathUserPhotos, req.user.id.toString(), result.insertId.toString(), 'min_photo', 'minphoto.jpg'), (err) => {
        if (err) {
            console.log(err);
        }
        req.flash('success', 'Game saved successfully!');
        res.redirect('/links');
    });
});

router.get('/', helper.isLoggedin, async (req, res) => {


    const query = "Select * from Juego where user_id = ?";

    const juegos = await pool.query(query, [req.user.id]);

    juegos.forEach(juego => {
        juego.created_at = helper.timeago(juego.created_at);
    });

    res.render('games.ejs', {
        juegos,
        route: req.active
    });

});

router.get('/id=:id&title=:title', helper.isLoggedin, async (req, res) => {

    const {
        title,
        id
    } = req.params;

    const game = await pool.query('Select * from Juego where id = ? and title = ?', [
        id,
        title
    ]);

    const review = await pool.query('Select * from review where game = ?', [game[0].id]);

    review.forEach(rev => {
        rev.created_at = helper.timeago(rev.created_at);
    });

    console.log(game);
    console.log(review);


    res.render('info.ejs', {
        game,
        review
    });


});

router.get('/del/id=:id&title=:title', helper.isLoggedin, async (req, res) => {
    const {
        title,
        id
    } = req.params;

    const result = await pool.query('Delete from Juego where id = ? and title = ?', [
        id,
        title
    ]);
    console.log(path.join(keys._pathUserPhotos, req.user.id.toString(), id.toString()));
    try {
        fsX.removeSync(keys._pathUserPhotos + req.user.id.toString(), id.toString());
    } catch (e) {
        console.log('Error al eliminar el directorio');
    }
    req.flash('success', 'Game deleted successfully');
    res.redirect('/links');
});

router.post('/add_review', async (req, res) => {
    const data = req.body;
    const review = {};

    review.info = data.info;
    review.game = data.game;
    review.review_title = data.review_title;
    review.review_photo = req.files.review_photo.name;

    const review_photo = await pool.query('insert into review set ?', [review]);
    //Solucion parche para setear el mismo valor de la id con un .jpg para reconocer la foto de la review
    const update = review_photo.insertId + '.jpg';
    await pool.query('update review set review_photo = ? where id = ?', [update, review_photo.insertId]);
    //fin parche


    const review_photo_path = keys._pathUserPhotos + '/' + req.user.id + '/' + data.game + '/review_photos/' + review_photo.insertId + '.jpg';

    req.files.review_photo.mv(review_photo_path, (err) => {
        if (err) {
            console.log('Error al guardar imagen');
        };
    });
    const game = await pool.query('select * from Juego where id = ?', [data.game]);
    const reviews = await pool.query('select * from review where game = ?', [data.game]);

    reviews.forEach(rev => {
        rev.created_at = helper.timeago(rev.created_at);
    });

    const redirect_path = '/links/id=' + data.game + '&title=' + game[0].title;
    req.flash('success', 'Review created successfully!')
    res.redirect(redirect_path);
});

router.get('/del_review/id=:id', async (req, res) => {

    const data = await pool.query('select * from review where id = ?', [req.params.id]);

    const game = await pool.query('select Juego.title from Juego where id = ? and user_id = ?', [data[0].game, req.user.id]);

    console.log(data[0].game + '/' + req.user.id + '/' + req.params.id);

    const removePhotoPath = path.join(keys._pathUserPhotos, req.user.id.toString(), data[0].game.toString(), 'review_photos', data[0].review_photo);

    console.log(removePhotoPath);

    fsX.removeSync(removePhotoPath);

    console.log(game);


    await pool.query('delete from review where id = ?', [req.params.id]);

    const redirect_path = '/links/id=' + data[0].game + '&title=' + game[0].title;

    req.flash('success', 'Review deleted successfully!');

    res.redirect(redirect_path);

});

router.post('/edit_minphoto', async (req, res) => {
    const update_path = path.join(keys._pathUserPhotos, req.user.id.toString(), req.body.game, 'min_photo', 'minphoto.jpg');
    const game = await pool.query('select * from Juego where id = ?', [req.body.game]);
    req.files.minphoto.mv(update_path);
    const redirect_path = '/links/id=' + req.body.game + '&title=' + game[0].title;
    res.redirect(redirect_path);
});

router.post('/edit_review', async (req, res) => {

    const data = req.body;

    const review = {};

    review.info = data.info;
    review.game = data.game;
    review.review_title = data.review_title;

    const review_photo = await pool.query('update review set ? where id = ?', [review, req.body.id_review]);

    const game = await pool.query('select * from Juego where id = ?', [data.game]);
    const reviews = await pool.query('select * from review where game = ?', [data.game]);

    const redirect_path = '/links/id=' + data.game + '&title=' + game[0].title;
    req.flash('success', 'Review edited successfully!')
    res.redirect(redirect_path);

});

router.post('/editPhotoReview', async (req, res) => {
    //Solucion parche para setear el mismo valor de la id con un .jpg para reconocer la foto de la review
    const update = req.body.id_review + '.jpg';
    await pool.query('update review set review_photo = ? where id = ?', [update, req.body.id_review]);
    //fin parche

    const review_photo_path = path.join(keys._pathUserPhotos, req.user.id.toString(), req.body.game.toString(), 'review_photos', update);

    req.files.editphotoreview.mv(review_photo_path, (err) => {
        if (err) {
            console.log('Error al guardar imagen');
        };
    });

    const game = await pool.query('select * from Juego where id = ?', [req.body.game]);
    const redirect_path = '/links/id=' + req.body.game + '&title=' + game[0].title;


    res.redirect(redirect_path);
});

module.exports = router;