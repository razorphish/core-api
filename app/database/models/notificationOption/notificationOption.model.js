// Notification option
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//https://notifications.spec.whatwg.org/#api
const NotificationOptionAction = new Schema({
    action: { type: String, required: false, trime: true },
    title: { type: String, required: false, trim: true },
    icon: { type: String, required: false, trim: true }
})

const NotificationOptionSchema = new Schema({
    name: { type: String, required: true },
    title: { type: String, required: true },
    dir: { type: String, enum: ['auto', 'ltr', 'rtl'] },
    lang: { type: String, required: false, trim: true },
    body: { type: String, required: false, trim: true },
    tag: { type: String, required: false, trim: true },
    image: { type: String, required: false, trim: true },
    icon: { type: String, required: false, trim: true },
    badge: { type: String, required: false, trim: true },
    vibrate: { type: [Number], required: false, trim: true },
    timeStamp: { type: Date, required: false, trim: true },
    renotify: { type: Boolean, default: false },
    silent: { type: Boolean, default: false },
    requireInteraction: { type: Boolean, default: false },
    data: { type: Schema.Types.Mixed, required: false },
    actions: {
        type: [NotificationOptionAction]
    },
    dateCreated: { type: Date, required: true, default: Date.now }
});



NotificationOptionSchema.pre('save', function (next) {
    const notificationOption = this;

    if (!notificationOption.isModified('vibrate')) {
        const array = notificationOption.vibrate.split(',');
        notificationOption.vibrate = array;
    }
    next();
});

module.exports = mongoose.model('NotificationOption', NotificationOptionSchema, 'notificationOptions');