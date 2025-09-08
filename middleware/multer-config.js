const multer = require('multer');
const sharp = require('sharp')
const path = require('path')
const storage = multer.memoryStorage();
const upload = multer({ storage }).single('image');

const convertToWebp = async (req, res, next) => {
    const name = req.file.originalname.split(' ').join('_');
    const timestamps = Date.now();
    const filename = `${name}_${timestamps}.webp`;
    const outputPath = path.join(__dirname, '../images', filename);
    await sharp(req.file.buffer)
        .webp({ quality: 20 })
        .toFile(outputPath)
    req.file.filename = filename;
    req.file.path = outputPath;
    next()
}
const imageMiddleware = [upload, convertToWebp];

module.exports = imageMiddleware;