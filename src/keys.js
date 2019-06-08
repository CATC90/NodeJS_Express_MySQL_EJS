const path = require('path');

module.exports = {
    database: {
        host: 'localhost',
        port: '3306',
        user: 'root',
        password: 'admin',
        database: 'videoJuegos'
    },
    home: {
        appHome: path.join(__dirname)
    },
    _pathUserPhotos: path.join(__dirname, 'public', 'images', 'upload_images')

}