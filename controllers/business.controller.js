const Business = require("../models/business.model");
const Product = require("../models/product.model");
const Order = require("../models/order.model");

const signup = async (req, res) => {
    try {
        const { email, password } = req.body;
        bcrypt.hash(password, 100, function(err, hash) {
            const business = new Business({
                email,
                password: hash
            });
            await business.save();
            res.status(201).json({
                message: "Customer created successfully",
                business
            });
        });
    } catch (error) {
        res.status(500).json({
            message: "Error creating business",
            error
        });
    }
}

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const business = await Business.findOne({ email });
        if (!business) {
            return res.status(401).json({
                message: "Business not found"
            });
        }
        bcrypt.compare(password, business.password, function(err, result) {
            if (result) {
                const token = jwt.sign(
                    {
                      userId: business._id,
                      email: business.email,
                      name: business.name,
                      userType: "business"
                    },
                    process.env.JWT_SECRET_BUS,
                    {
                      expiresIn: "30d",
                    }
                  );
                res.status(200).json({
                    message: "Business logged in successfully",
                    business,
                    token
                });
            } else {
                res.status(401).json({
                    message: "Invalid credentials"
                });
            }
        });
    } catch (error) {
        res.status(500).json({
            message: "Error logging in business",
            error
        });
    }
}

const seeOwnPage = async (req, res) => {
    try {
        const businessId = req.user.userId;
        const business = await Business.findById(businessId);
        if(!business) {
            return res.status(404).json({
                message: "Business not found"
            });
        }
        const products = await Product.find({ businessId: businessId });
        res.status(200).json({
            message: "Business retrieved successfully",
            business,
            products
        });
    } catch (error) {
        res.status(500).json({
            message: "Error retrieving business",
            error
        });
    }
}

module.exports = {
    signup,
    login,
    seeOwnPage
}