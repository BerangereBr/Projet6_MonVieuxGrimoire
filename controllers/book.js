const Book = require('../models/Book');
const fs = require('fs');

exports.createBook = (req, res, next) => {
    const newBook = JSON.parse(req.body.book);
    delete newBook._id;
    delete newBook._userId;
    const book = new Book({
        ...newBook,
        userId: req.auth.userId,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
    });
    book.save()
        .then(() => {
            console.log('Livre enregistré avec succès !');
            res.status(201).json({ message: 'Livre enregistré !' })
        })
        .catch(error => {
            console.error('Erreur lors de la création du livre:', error)
            res.status(400).json({ error: error.message })
        });
};

exports.modifyBook = (req, res, next) => {
    const changeBook = req.file ? {
        ...JSON.parse(req.body.book),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body };
    delete changeBook._userId;
    Book.findOne({ _id: req.params.id })
        .then((book) => {
            if (book.userId !== req.auth.userId) {
                res.status(401).json({ message: 'Not authorized' });
            } else {
                const filename = book.imageUrl.split('/images/')[1];
                fs.unlink(`images/${filename}`, (err) => {
                    if (err) console.error('error suppression', err)
                })
                Book.updateOne({ _id: req.params.id }, { ...changeBook, _id: req.params.id })
                    .then(() => res.status(200).json({ message: 'Livre modifié !' }))
                    .catch(error => res.status(401).json({ error }))
            }
        })
        .catch((error) => {
            res.status(400).json({ error });
        })
};

exports.deleteBook = (req, res, next) => {
    Book.findOne({ _id: req.params.id })
        .then(book => {
            if (book.userId !== req.auth.userId) {
                res.status(401).json({ message: 'Not authorized !' })
            } else {
                const filename = book.imageUrl.split('/images/')[1];
                fs.unlink(`images/${filename}`, () => {
                    Book.deleteOne({ _id: req.params.id })
                        .then(() => res.status(201).json({ message: 'Livre supprimé !' }))
                        .catch(error => res.status(401).json({ error }))
                })
            }
        })
        .catch(error => res.status(401).json({ error }))
};

exports.getOneBook = (req, res, next) => {
    Book.findOne({ _id: req.params.id })
        .then(book => {
            res.status(200).json(book)
        }
        )
        .catch(error => res.status(404).json({ error }));
};

exports.getAllBooks = (req, res, next) => {
    Book.find()
        .then(books => res.status(200).json(books))
        .catch(error => res.status(400).json({ error }));
};

exports.bookRating = (req, res, next) => {
    const rating = req.body.rating;
    const userId = req.auth.userId
    Book.findOne({ _id: req.params.id })
        .then(book => {
            if (!book) {
                res.status(401).json({ message: 'Livre non trouvé' })
            } else {
                if (book.ratings.find(data => data.userId === userId)) {
                    res.status(400).json({ message: 'Livre déjà noté' })
                } else {
                    book.ratings.push({ userId, grade: rating })
                    const grade = book.ratings.map(data => data.grade)
                    book.averageRating = Math.round(grade.reduce((gradeSum, grade) => gradeSum + grade, 0) / grade.length)
                    return book.save()
                        .then(updatebook => res.status(200).json(updatebook))
                        .catch(error => res.status(400).json({ error }));
                }
            }
        })
        .catch(error => res.status(400).json({ error }));
};

exports.bestRating = (req, res, next) => {
    Book.find()
        .then(books => {
            const averageRatingBooks = books.sort((a, b) => b.averageRating - a.averageRating)
            const bestRating = averageRatingBooks.splice(0, 3)
            res.status(200).json(bestRating)
        })
        .catch(error => res.status(400).json({ error }));
}
