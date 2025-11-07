const BookInstance = require('../models/bookinstance')
const Book = require('../models/book')
const { body, validationResult } = require('express-validator')

// Display list of all BookInstances.
exports.bookinstance_list = async (req, res, next) => {
  const allBookInstances = await BookInstance
    .find()
    .populate('book')
    .sort({ book: 1 })
    .exec()

  res.render('bookinstance_list', {
    title: 'Book Instance List',
    bookinstance_list: allBookInstances,
  })
}

// Display detail page for a specific BookInstance.
exports.bookinstance_detail = async (req, res, next) => {
  const bookInstance = await BookInstance.findById(req.params.id)
    .populate('book')
    .exec() 
    
  if (bookInstance === null) {
    // No results 
    const err = new Error('Book copy not found')
    err.status = 404 
    return next(err)
  }

  res.render('bookinstance_detail', {
    title: 'Book',
    bookinstance: bookInstance,
  })
}

// Display BookInstance create form on GET.
exports.bookinstance_create_get = async (req, res, next) => {
  // Get all books
  const allBooks = await Book.find({}, 'title').sort({ title: 1 }).exec()

  res.render('bookinstance_form', {
    title: 'Create Book Instance',
    book_list: allBooks,
  })
}

// Handle BookInstance create on POST.
exports.bookinstance_create_post = [
  // Validate and sanitize fields
  body('book', 'Book must be specified')
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body('status')
    .escape(),
  body('due_back', 'Invalid date')
    .optional({ values: 'falsy' })
    .isISO8601()
    .toDate(),

  // Process request after validation and sanitization
  async (req, res, next) => {
    // Extract the validation errors from a request
    const errors = validationResult(req) 

    // Create a BookInstance object with escaped and trimmed data 
    const bookInstance = new BookInstance({
      book: req.body.book,
      imprint: req.body.imprint,
      status: req.body.status,
      due_back: req.body.due_back,
    })

    if(!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/error messages
      const allBooks = await Book.find({}, 'title').sort({ title: 1 }).exec()

      res.render('bookinstance_form', {
        title: 'Create Book Instance',
        book_list: allBooks,
        selected_book: bookInstance.book._id,
        errors: errors.array(),
        bookinstance: bookInstance,
      })
      return
    }

    // Data from form is valid
    await bookInstance.save()
    res.redirect(bookInstance.url)
  }
]

// Display BookInstance delete form on GET.
exports.bookinstance_delete_get = async (req, res, next) => {
  // Get all bookinstances and books (parallel)
  const bookInstance = await BookInstance.findById(req.params.id).populate('book').exec()

  if (bookInstance === null) {
    // No results
    res.redirect('/catalog/bookinstances')
    return
  }

  res.render('bookinstance_delete', {
    title: 'Delete Copy of',
    bookinstance: bookInstance,
  })
}

// Handle BookInstance delete on POST.
exports.bookinstance_delete_post = async (req, res, next) => {
  // Delete object and redirect to the list of book instances
  await BookInstance.findByIdAndDelete(req.body.bookinstanceid)
  res.redirect('/catalog/bookinstances')
}

// Display BookInstance update form on GET.
exports.bookinstance_update_get = async (req, res, next) => {
  // Get book instance and corresponding book (in parallel)
  const [ bookInstance, allBooks ] = await Promise.all([
    BookInstance.findById(req.params.id).populate('book').exec(),
    Book.find()
  ])

  if (bookInstance === null) {
    // No results
    const err = new Error('Copy not found.')
    err.status = 404
    return next(err)
  }

  res.render('bookinstance_form', {
    title: 'Update Book Instance',
    book_list: allBooks,
    selected_book: bookInstance.book._id,
    bookinstance: bookInstance
  })
}

// Handle bookinstance update on POST.
exports.bookinstance_update_post = [
  // Validate and sanitize fields
  body('book', 'Book must be specified.')
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body('imprint', 'Imprint must be specified.')
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body('status')
    .escape(),
  body('due_back', 'Invalid date')
    .optional({ values: 'falsy' })
    .isISO8601()
    .toDate(),

  // Process request after validation and sanitization
  async (req, res, next) => {
    // Extract the validation errors from a request
    const errors = validationResult(req)

    // Create BookInstance object with escaped/trimmed data and old ID
    const bookInstance = new BookInstance({
      book: req.body.book,
      imprint: req.body.imprint,
      status: req.body.status,
      due_back: req.body.due_back,
      _id: req.params.id // This is required, or a new ID will be assigned
    })

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values / error messages
      // Get book instance and corresponding book (in parallel)
      const [ bookInstance, allBooks ] = await Promise.all([
        BookInstance.findById(req.params.id).populate('book').exec(),
        Book.find()
      ])

      res.render('bookinstance_form', {
        title: 'Update Book Instance',
        book_list: allBooks,
        selected_book: bookInstance.book._id,
        bookinstance: bookInstance,
        errors: errors.array()
      })
      return
    }

    // Data form is valid. Update the record
    const updatedBookInstance = await BookInstance.findByIdAndUpdate(req.params.id, bookInstance, {})

    // Redirect to book instance detail page 
    res.redirect(updatedBookInstance.url)
  }
]