const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
    title: { type: String },
    description: { type: String },
    file: { type: String },
    image: { type: String },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
},{
    timestamps:true
});

module.exports = mongoose.model('Post', PostSchema);