const Author = require('../models/author')
const Book = require('../models/book')
const { body, validationResult } = require('express-validator')

// Display list of all Authors 
exports.author_list = async (req, res, next) => {
  const allAuthors = await Author
    .find()
    .sort({ family_name: 1 })
    .exec()

  res.render('author_list', {
    title: 'Author List',
    author_list: allAuthors,
  })
}

// Display detail page for a specific Author
exports.author_detail = async (req, res, next) => {
  // Get details of author an all their books (in parallel) 
  const [author, allBooksByAuthor] = await Promise.all([
    Author.findById(req.params.id)
      .exec(),
    Book.find({ author: req.params.id }, 'title summary')
      .exec()
  ])

  if (author === null) {
    // No results 
    const err = new Error('Author not found')
    err.status = 404
    return next(err)
  }

  res.render('author_detail', {
    title: 'Author Detail',
    author,
    author_books: allBooksByAuthor,
  })
}

// Display Author create form on GET
exports.author_create_get = async (req, res, next) => {
  res.render('author_form', { title: 'Create Author' })
}

// Handle Author create on POST
exports.author_create_post = [
  // Validate and sanitize the data
  body('first_name')
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage('First name must be specified.')
    .isAlphanumeric()
    .withMessage('First name must be alphanumeric characters only.'),
  body('family_name')
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage('Family name must be specified.')
    .isAlphanumeric()
    .withMessage('Family name must be alphanumeric characters only.'),
  body('date_of_birth', 'Invalid date of birth')
    .optional({ values: 'falsy' })
    .isISO8601()
    .toDate(),
  body('date_of_death', 'Invalid date of death')
    .optional({ values: 'falsy' })
    .isISO8601()
    .toDate(),

  // Process request after validation and sanitization
  async (req, res, next) => {
    // Extract the validation errors from the request
    const errors = validationResult(req)

    // Create Author object with escaped and trimmed data 
    const author = new Author({
      first_name: req.body.first_name, 
      family_name: req.body.family_name,
      date_of_birth: req.body.date_of_birth,
      date_of_death: req.body.date_of_death,
    })

    if(!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/errors messages
      res.render('author_form', {
        title: 'Create Author',
        author, 
        errors: errors.array()
      })
      return
    }

    // Data from form is valid
    // Save and redirect to new author record 
    await author.save()
    res.redirect(author.url)
  }
]

// Display Author delete form on GET
exports.author_delete_get = async (req, res, next) => {
  res.send('NOT IMPLEMENTED: Author delete GET')
}

// Handle Author delete on POST
exports.author_delete_post = async (req, res, next) => {
  res.send('NOT IMPLEMENTED: Author delete POST')
}

// Display Author update form on GET
exports.author_update_get = async (req, res, next) => {
  res.send('NOT IMPLEMENTED: Author update GET')
}

// Handle Author update on POST
exports.author_update_post = async (req, res, next) => {
  res.send('NOT IMPLEMENTED: Author update POST')
}