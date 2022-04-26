const mongoose = require("mongoose");

var validateEmail = function (email) {
  var re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  return re.test(email);
};

const businessSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  name: { type: String },
  description: { type: String },
  isVerified: { type: Boolean, default: false },
  visible: { type: Boolean, default: false },
  category: {
    type: String,
    enum: ["Clothing", "Furniture", "Decor", "Cosmetics", "Food"],
  },
  specialization: { type: String },
  phone: { type: String },
  email: {
    type: String,
    required: "Email Address is required",
    trim: true,
    unique: true,
    validate: [validateEmail, "Please fill a valid email address"],
  },
  password: { type: String, required: "Password is required" },
  address: {
    type: {
      line1: { type: String },
      line2: { type: String },
      city: { type: String },
      state: { type: String },
      zip: { type: String },
    },
  },
  views: { type: Number, default: 0 },
  socialMediaLink: { type: String },
});

module.exports = mongoose.model("Business", businessSchema);
