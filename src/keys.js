const path = require('path');

module.exports = {

    database: {
        host: 'localhost',
        port: '3306',
        user: 'root',
        password: process.env.DB_PASSWORD || 'admin',
        database: 'videoJuegos'
    },
    /*
        database: {
            connectionLimit: 100,
            host: 'us-cdbr-iron-east-02.cleardb.net',
            user: 'b217ac0a01f879',
            password: '37939952',
            database: 'heroku_eac798c3b33b831',
            debug: 'false'
        },*/
    home: {
        appHome: path.join(__dirname)
    },
    _pathUserPhotos: path.join(__dirname, 'public', 'images', 'upload_images')

}