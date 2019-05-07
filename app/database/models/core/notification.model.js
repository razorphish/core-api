const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const NotificationSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: false, trim: true },
    uuid: { type: String, required: false, trim: true },
    token: { type: String, required: false },
    endpoint: { type: String, required: false, trim: true },
    expirationTime: { type: String, required: false },
    keys: {
        auth: {
            type: String
        },
        p256dh: {
            type: String
        }
    },
    schemaType: { type: String, enum: ['serviceWorker', 'capacitor', 'unknown'], default: 'unknown' },
    dateCreated: { type: Date, required: true, default: Date.now },
    dateModified: { type: Date, required: true, default: Date.now }
});

NotificationSchema.pre('save', function (next) {
    if (this.dateModified) {
        this.dateModified = new Date();
    }
    next();
});

module.exports = mongoose.model('Notification', NotificationSchema, 'notifications');
