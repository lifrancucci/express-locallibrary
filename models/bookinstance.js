const { DateTime } = require('luxon')
const mongoose = require('mongoose')

const Schema = mongoose.Schema

const BookInstanceSchema = new Schema(
    {
        book: { type: Schema.Types.ObjectId, ref: 'Book', required: true },
        imprint: { type: String, required: true },
        status: {
            type: String,
            required: true,
            enum: [ 'Available', 'Maintenance', 'Loaned', 'Reserved' ],
            default: 'Maintenance'
        },
        due_back: { type: Date, default: Date.now }
    }
)

// Virtual for bookinstance's URL
BookInstanceSchema.virtual('url').get(function () {
    return `/catalog/bookinstance/${this._id}`
})

// Virtual for bookinstance's formatted Date
BookInstanceSchema.virtual('due_back_formatted').get(function () {
    return DateTime.fromJSDate(this.due_back, { zone: 'utc' }).toLocaleString(DateTime.DATE_MED)
})

// Virtual for bookinstance's formatted Date in YYYY-MM-DD
BookInstanceSchema.virtual('due_back_yyyy_mm_dd').get(function () {
    return DateTime.fromJSDate(this.due_back, { zone: 'utc' }).toISODate()
})
 
// Export the model
module.exports = mongoose.model('BookInstance', BookInstanceSchema)