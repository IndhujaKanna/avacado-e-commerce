const mongoose = require('mongoose')

const userSchema = mongoose.Schema({
    fullname: {
        type: String,
    },
    email: String,
    password: String,
    isAdmin: {
        type: Boolean,
        default: false
    },
    cart: [
        {
            product: { type: mongoose.Schema.Types.ObjectId, ref: "product" },
            quantity: { type: Number, default: 1 }
        }
    ],
    orders: {
        type: Array,
        default: []
    },
    contact: Number,
    picture: String
}, { timestamps: true });

module.exports = mongoose.model("user", userSchema)