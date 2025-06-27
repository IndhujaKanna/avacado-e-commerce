const mongoose = require("mongoose");
const userModel = require("./user_model");
const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
  items: [{
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "product",
    },
    quantity: {type:Number},
}],
  totalAmount: Number,
  date: { type: Date, default: Date.now }
},{ timestamps: true });

module.exports = mongoose.model("order", orderSchema);
