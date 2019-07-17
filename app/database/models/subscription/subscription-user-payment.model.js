const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SubscriptionUserPaymentSchema = new Schema(
    {
        subscriptionUserId: { type: Schema.Types.ObjectId, ref: 'SubscriptionUser', required: true, trim: true },
        paymentStatusId: {
            type: String,
            required: true,
            enum: ['paid', 'pending', 'cancelled', 'deleted'],
            default: 'pending'
        },
        amount: { type: Number, required: true },
        responsePayload: { type: String, required: false, trim: true },
        datePaid: { type: Date, required: false },
        dateNextPayment: { type: Date, required: true },
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
SubscriptionUserPaymentSchema.pre('save', function (next) {
    if (this.dateModified) {
        this.dateModified = new Date();
    }
    next();
});

module.exports = mongoose.model('SubscriptionUserPayment', SubscriptionUserPaymentSchema, 'subscriptionUserPayments');
