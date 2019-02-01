/**
 *
 */
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UploadSchema = new Schema({
    description: { type: String, required: true, maxlength: 50 },
    statusId: { type: String, enum: ['private', 'deleted'], required: true },
    categoryId: { type: String, enum: ['document', 'multimedia', 'image'] },
    typeId: { type: String, enum: ['web.Image', 'web.Image.System', 'web.Video', 'web.Video.Vimeo', 'web.Video.YouTube', 'youTube.Video'] },
    isDefault: { type: Boolean, default: false },
    sortOrder: { type: Number, required: true },
    name: { type: String, required: true, maxlength: 255 },
    originalFileName: { type: String, required: true, maxlength: 255 },
    location: { type: String, required: true, maxlength: 255 },
    relativeLocation: { type: String, required: true, maxlength: 255 },
    extension: { type: String, required: true, maxlength: 10 },
    contentLength: { type: Number, required: true },
    contentType: { type: String, required: true, maxlength: 50 },
    locationHttp: { type: String, required: true, maxlength: 255 },
    containerName: { type: String, required: true, maxlength: 50 },
    dateCreated: { type: Date, required: true, default: Date.now },
    dateModified: { type: Date, required: true, default: Date.now },
})


module.exports = mongoose.model('Upload', UploadSchema, 'uploads');
