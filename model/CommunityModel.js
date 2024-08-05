const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the Channel sub-schema
const channelSchema = new Schema({
    channelId: { type: Schema.Types.ObjectId},
    channelName: String,
    profilePicture: {
        type: String,
    },
});

// Define the Community schema
const communitySchema = new Schema({
    communityName: {
        type: String,
        required: true
    },
    profilePicture: {
        type: String,
    },
    tag: {
        type: [String]
    },
    channels: [channelSchema]
});

// Create the Community model
const Community = mongoose.model('Community', communitySchema);
Community.init().then(() => {
    console.log('Indexes are created');
}).catch(err => {
    console.error('Error creating indexes', err);
});
module.exports = Community;
