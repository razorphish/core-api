const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const DeviceSchema = new Schema({
    uuid: { type: String, required: false, trim: true },
    diskFree: { type: Number, required: false, trim: true },
    osVersion: { type: String, required: false, trim: true },
    memUsed: { type: Number, required: false},
    batteryLevel: { type: Number, required: false},
    model: { type: String, required: false, trim: true },
    platform: { type: String, required: false, trim: true },
    manufacturer: { type: String, required: false, trim: true },
    isVirtual: { type: Boolean, required: false},
    appVersion: { type: String, required: false, trim: true },
  });

  DeviceSchema.pre('save', function (next) {
    if (this.dateModified) {
        this.dateModified = new Date();
    }
    next();
});

module.exports = mongoose.model('Device', DeviceSchema, 'devices');
