const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ExecutionSchema = new Schema({
  started: { type: Date, required: false },
  completed: { type: Date, required: false },
  kickoff: { type: Date, required: true },
});

const JobSchema = new Schema(
  {
    //Foreign keys -> reference id
    parentJobId: {
      type: Schema.Types.ObjectId,
      ref: 'Job',
      required: false
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    //Properties
    activityStatusId: {
      type: String,
      required: true,
      enum: ['ready', 'running', 'paused', 'fail', 'terminated', 'executed', 'restarted', 'completed'],
      default: 'active',
    },
    execution: { type: ExecutionSchema },
    meta: { type: Schema.Types.Mixed, required: false },
    name: { type: String, required: true, trim: true },
    normalizedName: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    statusId: {
      type: String,
      required: true,
      enum: [
        'active',
        'inactive',
        'disabled',
        'pending',
        'archived',
        'suspended',
        'deleted',
      ],
      default: 'active',
    },

    // Dates
    dateModified: { type: Date, required: true, default: Date.now },
    dateCreated: { type: Date, required: true, default: Date.now },
  },
  {
    toJSON: {
      virtuals: true,
    },
  }
);

JobSchema.pre('save', function (next) {
  if (this.dateModified) {
    this.dateModified = new Date();
  }
  next();
});

module.exports = mongoose.model('Job', JobSchema, 'jobs');
