const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const FirebaseSchema = new Schema({
    apiKey: { type: String, required: false, trim: true },
    authDomain: { type: String, required: false, trim: true },
    databaseURL: { type: String, required: false, trim: true },
    projectId: { type: String, required: false, trim: true },
    storageBucket: { type: String, required: false, trim: true },
    messagingSenderId: { type: String, required: false, trim: true }
});

FirebaseSchema.pre('save', function (next) {
    next();
});

module.exports = mongoose.model('Firebase', FirebaseSchema, 'firebases');