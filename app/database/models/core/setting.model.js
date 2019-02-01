const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SettingSchema = new Schema({
    allowAnonymousDonors : {type: Boolean, required: true},
    allowRecurringPayments : {type: Boolean, required: true},
    allowCommenting : {type: Boolean, required: true},
    usePaymentModal : {type: Boolean, required: true},
    facebookPostAddVideo : {type: Boolean, required: true},
    facebookPostAddImage : {type: Boolean, required: true},
    facebookPostUpdate : {type: Boolean, required: true},
    facebookPostUserSupport : {type: Boolean, required: true},
    facebookPostUserDonate : {type: Boolean, required: true},
    facebookPostUserFundraiser : {type: Boolean, required: true},
    facebookPostUserComment : {type: Boolean, required: true},
    emailReceiveUserDonation : {type: Boolean, required: true},
    emailReceiveUserSupport : {type: Boolean, required: true},
    emailReceiveUserFundraiser : {type: Boolean, required: true},
    emailReceiveUserTeamMember : {type: Boolean, required: true},
    emailSendSupporter25Raised : {type: Boolean, required: true},
    emailSendSupporter50Raised : {type: Boolean, required: true},
    emailSendSupporter75Raised : {type: Boolean, required: true},
    emailSendSupporterFriendSupport : {type: Boolean, required: true},
    donationHideAmount : {type: Boolean, required: true},
    donationHideDonorName : {type: Boolean, required: true},
});

module.exports = mongoose.model('Setting', SettingSchema, 'settings');