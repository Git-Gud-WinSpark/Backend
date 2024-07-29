const mongoose = require('mongoose');
const {Schema} = require('mongoose');

const SubtaskSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    status: { type: Boolean, default: false },
    timeSpent: { type: Date}
});

const LiveTaskSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    status: { type: Boolean, default: false },
    completionTime: {type : Date},
    subtask: [SubtaskSchema]
});

const ProgressSchema = new mongoose.Schema({
    userID: { type: String},
    communityID: { type: String },
    channelID: { type: String },
    liveTask: [LiveTaskSchema],
    timestamp: { type: Date}
});

const ProgressModel = mongoose.model('Progress', ProgressSchema);

module.exports = ProgressModel;
