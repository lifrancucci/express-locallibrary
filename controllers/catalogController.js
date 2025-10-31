const Book = require('../models/book')
const Author = require('../models/author')
const Genre = require('../models/genre')
const BookInstance = require('../models/bookinstance')

exports.index = async (req, res, next) => {
    // Get details of books, book instances, authors, and genre counts (in parallel)
    const [
        numBooks,
        numBookInstances,
        numAvailableBookInstances,
        numAuthors,
        numGenres
    ] = await Promise.all([
        Book.countDocuments({}).exec(),
        BookInstance.countDocuments({}).exec(),
        BookInstance.countDocuments({ status: 'Available' }).exec(),
        Author.countDocuments({}).exec(),
        Genre.countDocuments({}).exec(),
    ])

    res.render('index', {
        title: 'Local Library Home',
        book_count: numBooks,
        bookinstance_count: numBookInstances,
        bookinstance_available_count: numAvailableBookInstances,
        author_count: numAuthors,
        genre_count: numGenres
    })
}