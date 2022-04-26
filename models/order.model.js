const mongoose = require("mongoose");

const orderSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    status: { 
        type: String, 
        enum: ["Order sent to vendor", "Order Accepted", "Vendor is working on your order", "Order Finished"], 
        default: "Order sent to vendor" 
    },
    customer_id: { type: mongoose.Schema.Types.ObjectId, ref: "Customer" },
    business_id: { type: mongoose.Schema.Types.ObjectId, ref: "Business" },
    products: [{
        product_id: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        quantity: {type: Number },
        reviewed: {type: Boolean, default: false},
    }],
    address:  {
        type: {
          line1: { type: String },
          line2: { type: String },
          city: { type: String },
          state: { type: String },
          zip: { type: String },
        },
      },
})

module.exports = mongoose.model("Order", orderSchema)