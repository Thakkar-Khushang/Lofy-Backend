const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Business = require("../models/business.model");
const Product = require("../models/product.model");
const Order = require("../models/order.model");

const signup = (req, res) => {
    try {
        const { email, password } = req.body;
        bcrypt.hash(password, 10, async function(err, hash) {
            const business = new Business({
                _id: new mongoose.Types.ObjectId(),
                email,
                password: hash
            });
            await business.save();
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
            res.status(201).json({
                message: "Customer created successfully",
                business,
                token
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
        const business = await Business.findById(businessId).select("-password");
        if(!business) {
            return res.status(404).json({
                message: "Business not found"
            });
        }
        const products = await Product.find({ business_id: businessId });
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

const updateProfile = async (req, res) => {
    try {
        const businessId = req.user.userId;
        const business = await Business.findById(businessId).select("-password");
        if(!business) {
            return res.status(404).json({
                message: "Business not found"
            });
        }
        const { name, address, city, phone, description, category, specialization } = req.body;
        if(name) {
            business.name = name;
        }
        if(address) {
            business.address = address;
        }
        if(city) {
            business.city = city;
        }
        if(phone) {
            business.phone = phone;
        }
        if(description) {
            business.description = description;
        }
        if(category) {
            business.category = category;
        }
        if(specialization) {
            business.specialization = specialization;
        }
        await business.save();
        res.status(200).json({
            message: "Business updated successfully",
            business
        });
    } catch (error) {
        res.status(500).json({
            message: "Error updating business",
            error
        });
    }
}

const getOrders = async (req, res) => {
    try {
        const businessId = req.user.userId;
        const business = await Business.findById(businessId).select("-password");
        if(!business) {
            return res.status(404).json({
                message: "Business not found"
            });
        }
        const orders = await Order.find({ business_id: businessId });
        let products = []
        for(let i = 0; i < orders.length; i++) {
            let products = []
            for(let j = 0; j < orders[i].products.length; j++) {
                const product = await Product.findById(orders[i].products[j].product_id);
                products.push(product);
            }
            orders[i]._doc.products = products;
        }
        res.status(200).json({
            message: "Orders retrieved successfully",
            orders
        });
    } catch (error) {
        res.status(500).json({
            message: "Error retrieving orders",
            error
        });
    }
}

const setOrderStatus = async (req, res) => {
    try {
        const businessId = req.user.userId;
        const business = await Business.findById(businessId).select("-password");
        if(!business) {
            return res.status(404).json({
                message: "Business not found"
            });
        }
        const { orderId, status } = req.body;
        const order = await Order.findById(orderId);
        order.status = status;
        await order.save();
        res.status(200).json({
            message: "Order status updated successfully",
            order
        });
    } catch (error) {
        res.status(500).json({
            message: "Error updating order status",
            error
        });
    }
}
        

module.exports = {
    signup,
    login,
    seeOwnPage,
    updateProfile,
    getOrders,
    setOrderStatus
}