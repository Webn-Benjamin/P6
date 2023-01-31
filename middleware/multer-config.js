const multer = require('multer');

const MIME_TYPES = { // Extensions d'images
    'image/jpg': 'jpg',
    'image/jpeg': 'jpg',
    'image/png': 'png'
};

const storage = multer.diskStorage({
    destination: (req, file, callback) => { // destination images
        callback(null, 'images');
    },
    filename: (req, file, callback) => { // Nouveau nom de l'image pour éviter les doublons
        const name = file.originalname.split(' ').join('_');
        const extension = MIME_TYPES[file.mimetype];
        callback(null, name + Date.now() + '.' + extension);
    }
});
module.exports = multer({ storage: storage}).single('image'); 

