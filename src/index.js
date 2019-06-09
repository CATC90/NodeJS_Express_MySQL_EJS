const express = require('express');
const morgan = require('morgan');
const path = require('path');
const fileUpload = require('express-fileupload');
const session = require('express-session');
const flash = require('connect-flash');
const mysqlStore = require('express-mysql-session');
const passport = require('passport');
const {
    database
} = require('./keys');



//initializations
const app = express();
require('./lib/passport');

//Settings
app.set('port', process.env.PORT || 5001);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

//Middleware
app.use(session({
    secret: 'videogamesapp',
    resave: false,
    saveUninitialized: false,
    store: new mysqlStore(database)
}))
app.use(morgan('dev'));
app.use(express.urlencoded({
    extended: false
}));
app.use(express.json());
app.use(fileUpload());
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

//Global Variables
app.use((req, res, next) => {
    app.locals.success = req.flash('success');
    app.locals.message = req.flash('message');
    app.locals.user = req.user;

    next();
});
app.use((req, res, next) => {
    req.active = req.path.split('/')[1] // [0] will be empty since routes start with '/'
    next();
});

//Routes
app.use(require('./routes'));
app.use(require('./routes/authentication'));
app.use('/links', require('./routes/links'));

//Public
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public', 'images', 'upload_images')));


//Starting the Server
app.listen(app.get('port'), () => {
    console.log('Server on Port ', app.get('port'));
});