const mongoose = require('mongoose');
const beautifyUnique = require('mongoose-beautiful-unique-validation');

const Schema = mongoose.Schema;

const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    chatCount: {
        type: Number,
        unique: false
    },
    bio: {
        type: String,
        required: true
    }
}, { timestamps: true});

const User = mongoose.model('User', userSchema);
module.exports = User;