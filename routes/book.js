const express = require('express');
const auth = require('../middleware/auth')
const router = express.Router();
const bookCtrl = require('../controllers/book');
const multer = require('../middleware/multer-config');

router.post('/', auth, multer, bookCtrl.createBook);
router.put('/:id', auth, multer, bookCtrl.modifyBook);
router.delete('/:id', auth, bookCtrl.deleteBook);
router.get('/bestrating', bookCtrl.bestRating)
router.get('/:id', bookCtrl.getOneBook);
router.post('/:id/rating', auth, bookCtrl.bookRating);
router.get('/', bookCtrl.getAllBooks);

module.exports = router;