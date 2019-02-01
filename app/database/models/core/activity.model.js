const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ActivitySchema = new Schema({
    typeId: { type: String, required: true, enum: ['create', 'delete', 'update'] },
    statusId: { type: String, required: true, enum: ['private', 'hidden', 'deleted', 'active', 'archived'] },
    summary: { type: String, required: true },
    dateCreated: { type: Date, required: true, default: Date.now },
    dateModified: { type: Date, required: true, default: Date.now }
});

module.exports = mongoose.model('Activity', ActivitySchema, 'activities');