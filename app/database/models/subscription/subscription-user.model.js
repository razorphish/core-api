const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const SubscriptionItem = require('./subscription-item.model');

const SubscriptionUserSchema = new Schema(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, trim: true },
        planId: { type: Schema.Types.ObjectId, ref: 'SubscriptionPlan', required: true, trim: true },
        items: { type: [SubscriptionItem.schema] },
        frequencyId: {
            type: String,
            required: true,
            enum: ['annually', 'monthly', 'one-time', 'weekly', 'daily'],
            default: 'monthly'
        },
        statusId: {
            type: String,
            required: true,
            enum: ['active', 'cancelled'],
            default: 'active'
        },
        dateStart: { type: Date, required: false },
        dateEnd: { type: Date, required: false },
        dateCreated: { type: Date, required: true, default: Date.now },
        dateModified: { type: Date, required: true, default: Date.now }
    },
    {
        toJSON:
        {
            virtuals: true
        }
    });

///PRE _SAVE
SubscriptionUserSchema.pre('save', function (next) {
    if (this.dateModified) {
        this.dateModified = new Date();
    }
    next();
});

SubscriptionUserSchema.virtual('payments', {
    ref: 'SubscriptionUserPayment', // The model to use
    localField: '_id', // Find people where `localField`
    foreignField: 'subscriptionUserId', // is equal to `foreignField`
    // If `justOne` is true, 'members' will be a single doc as opposed to
    // an array. `justOne` is false by default.
    justOne: false,
    options: {
        sort: {
            dateCreated: -1
        }
    } // Query options, see http://bit.ly/mongoose-query-options
});

module.exports = mongoose.model('SubscriptionUser', SubscriptionUserSchema, 'subscriptionUsers');
