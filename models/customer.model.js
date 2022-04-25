const mongoose = require("mongoose");

var validateEmail = function(email) {
    var re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    return re.test(email)
};

const customerSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: {type: String },
    phone: {type: String },
    email: {
        type: String, 
        required: "Email Address is required",
        trim: true,
        unique: true,
        validate: [validateEmail, "Please fill a valid email address"]
    },
    isVerified: {type: Boolean, default: false},
    password: {type: String, required: "Password is required"},
    address: {type: String },
    city: {type: String },
})

module.exports = mongoose.model("Customer", customerSchema)