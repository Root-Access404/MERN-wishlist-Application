const mongoose = require('mongoose');

const wishlistSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    link: String,
    remark: String
}, { timestamps: true });

module.exports = mongoose.model('Wishlist', wishlistSchema);