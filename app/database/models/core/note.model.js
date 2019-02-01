/**
 * Note Model
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * Type id comes from Note Type model
 */
const NoteSchema = new Schema({
    subject: { type: String, required: true, maxlength: 256 },
    email: { type: String, maxlength: 100 },
    firstName: { type: String, maxlength: 50 },
    lastName: { type: String, maxlength: 50 },
    comment: { type: String, required: true },
    sent: { type: Boolean, required: true },
    statusId: { type: String, required: true, enum: ['private', 'hidden', 'active', 'deleted', 'disabled'] },
    viewStatusId: { type: String, required: true, enum: ['viewed', 'unviewed', 'ignored'] },
    typeId: { type: String, required: true },
    dateCreated: { type: Date, required: true, default: Date.now },
    dateModified: { type: Date, required: true, default: Date.now }
});

module.exports = mongoose.model('Note', NoteSchema, 'notes');