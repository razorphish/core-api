const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SubscriptionJobSchema = new Schema(
    {
        jobId: { type: Schema.Types.ObjectId, ref: 'Job', required: true },
        subscriptionItemId: { type: Schema.Types.ObjectId, ref: 'SubscriptionItem', required: true },
        startJobTimeId: {
            type: String,
            required: true,
            enum: ['now', 'hour', 'day', 'week', 'month'],
            default: 'monthly'
        },
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
SubscriptionJobSchema.pre('save', function (next) {
    if (this.dateModified) {
        this.dateModified = new Date();
    }
    next();
});


module.exports = mongoose.model('SubscriptionJob', SubscriptionJobSchema, 'subscriptionJobs');
