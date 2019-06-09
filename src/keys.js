const path = require('path');

module.exports = {
    database: {
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'videoJuegos'
    },
    home: {
        appHome: path.join(__dirname)
    },
    _pathUserPhotos: path.join(__dirname, 'public', 'images', 'upload_images')

}