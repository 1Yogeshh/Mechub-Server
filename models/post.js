const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    file: { type: String, default:'' },
    image: { type: String , default:''},
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
},{
    timestamps:true
});

module.exports = mongoose.model('Post', PostSchema);