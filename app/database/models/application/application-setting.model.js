const mongoose = require('mongoose');
const NotificationOption = require('../notificationOption/notificationOption.model');
const NotificationEmailOption = require('../notificationOption/notificationEmailOption.model');

const { Schema } = mongoose;

const ApplicationSettingSchema = new Schema(
  {
    applicationId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Application'
    },
    notifications: { type: [NotificationOption.schema], required: false },
    emailNotifications: {
      type: [NotificationEmailOption.schema],
      required: false
    }
  },
  {
    toJSON: { virtuals: true }
  }
);

ApplicationSettingSchema.pre('save', (next) => {
  next();
});

module.exports = mongoose.model(
  'ApplicationSetting',
  ApplicationSettingSchema,
  'applicationSettings'
);
