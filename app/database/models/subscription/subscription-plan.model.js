const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SubscriptionPlanSchema = new Schema(
    {
        applicationId: { type: Schema.Types.ObjectId, ref: 'Application', required: true, trim: true },
        name: { type: String, required: true, trim: true },
        description: { type: String, required: true, trim: true },
        statusId: {
            type: String,
            required: true,
            enum: ['active', 'disabled', 'pending', 'archived', 'deleted'],
            default: 'active'
        },
        dateExpire: { type: Date, required: false },
        dateCreated: { type: Date, required: true, default: Date.now },
        dateModified: { type: Date, required: true, default: Date.now }
    },
    {
        toJSON:
        {
            virtuals: true
        }
    }
);

///PRE _SAVE
SubscriptionPlanSchema.pre('save', function (next) {
    if (this.dateModified) {
        this.dateModified = new Date();
    }
    next();
});

SubscriptionPlanSchema.virtual('items', {
    ref: 'SubscriptionItem', // The model to use
    localField: '_id', // Find people where `localField`
    foreignField: 'subscriptionPlanId', // is equal to `foreignField`
    // If `justOne` is true, 'members' will be a single doc as opposed to
    // an array. `justOne` is false by default.
    justOne: false,
    options: {
        sort: {
            sortOrder: 1
        }
    } // Query options, see http://bit.ly/mongoose-query-options
});

module.exports = mongoose.model('SubscriptionPlan', SubscriptionPlanSchema, 'subscriptionPlans');
