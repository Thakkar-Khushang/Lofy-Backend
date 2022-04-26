const mongoose = require("mongoose");
require('mongoose-double')(mongoose);

var SchemaTypes = mongoose.Schema.Types;
const productSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: {type: String },
    description: {type: String},
    business_id: { type: mongoose.Schema.Types.ObjectId, ref: "Business" },
    price: {type: SchemaTypes.Double},
    rating: {type: Number, default: -1},
    reviews: [{
        customer_id: { type: mongoose.Schema.Types.ObjectId, ref: "Customer" },
        customer_name: { type: String },
        review: {type: String },
        rating: {type: Number }
    }],
})

module.exports = mongoose.model("Product", productSchema)