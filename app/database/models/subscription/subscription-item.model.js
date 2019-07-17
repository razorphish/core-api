const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SubscriptionItemSchema = new Schema(
    {
        //Foreign keys
        applicationId: { type: Schema.Types.ObjectId, ref: 'Application', required: true, trim: true },
        subscriptionPlanId: { type: Schema.Types.ObjectId, ref: 'SubscriptionPlan', required: false },

        //Properties
        amount: { type: Number, required: true },
        description: { type: String, required: true, trim: true },
        name: { type: String, required: true, trim: true },
        saleAmount: { type: Number, required: true },
        typeId: {
            type: String,
            required: true,
            enum: ['subscription', 'add-on', 'exclusive'],
            default: 'subscription'
        },
        limit: { type: Number, required: true },

        //dates
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
SubscriptionItemSchema.pre('save', function (next) {
    if (this.dateModified) {
        this.dateModified = new Date();
    }
    next();
});

SubscriptionItemSchema.virtual('users', {
    ref: 'UserSubscriptionItem', // The model to use
    localField: '_id', // Find people where `localField`
    foreignField: 'subscriptionItemId', // is equal to `foreignField`
    // If `justOne` is true, 'members' will be a single doc as opposed to
    // an array. `justOne` is false by default.
    justOne: false,
    options: {
        sort: {
            name: -1
        },
        limit: 5
    } // Query options, see http://bit.ly/mongoose-query-options
});

module.exports = mongoose.model('SubscriptionItem', SubscriptionItemSchema, 'subscriptionItems');
