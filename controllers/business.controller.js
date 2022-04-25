const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Business = require("../models/business.model");
const Product = require("../models/product.model");
const Order = require("../models/order.model");
const verification = require("../middleware/sendEmail.js");

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
                  expiresIn: "1h",
                }
              )
            verification(business.email, token, "business", (err, message)=>{
                if(err) {
                    res.status(500).json({
                        message: "Error sending email",
                        error: err
                    });
                } else {
                    res.status(200).json({
                        message: "Verification mail sent, please verify your email then login",
                        business
                    });
                }
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
            return res.status(404).json({
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
        const { name, address, city, phone, description, category, specialization, socialMediaLink } = req.body;
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
        if(socialMediaLink) {
            business.socialMediaLink = socialMediaLink;
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

const verifyBusiness = async (req, res) => {
    try {
        const userToken = req.params.token;
        jwt.decode(userToken, process.env.JWT_SECRET_BUS, async(err, decoded) => {
            if(err) {
                return res.status(400).json({
                    message: "Invalid token"
                });
            }
            else{
                const userId = decoded.userId;
                const business = await Business.findById(userId);
                if(!business) {
                    return res.status(404).json({
                        message: "Customer not found"
                    });
                }
                business.isVerified = true;
                await business.save();
                res.status(200).json({
                    message: "Business verified successfully"
                });
            }
        });
    } catch (error) {
        res.status(500).json({
            message: "Error verifying customer",
            error
        });
    }
}

const sendVerificationEmail = async (req, res) => {
    try {
        const email = req.body.email;
        const business = await Business.findOne({ email });
        if(!business) {
            return res.status(404).json({
                message: "Business not found"
            });
        }
        const token = jwt.sign({ userId: business._id }, process.env.JWT_SECRET_BUS, { expiresIn: '1h' });
        verification(email, token, "business", (err, info) => {
            if(err) {
                return res.status(500).json({
                    message: "Error sending verification email"
                });
            }
            else{
                res.status(200).json({
                    message: "Verification email sent successfully"
                });
            }
        });
    } catch (error) {
        res.status(500).json({
            message: "Error sending verification email",
            error
        });
    }
}

const setVisibility = async (req, res) => {
    try {
        const businessId = req.user.userId;
        const business = await Business.findById(businessId).select("-password");
        if(!business) {
            return res.status(404).json({
                message: "Business not found"
            });
        }
        const visible = business.visible;
        business.visible = !visible;
        await business.save();
        res.status(200).json({
            message: "Business visibility updated successfully",
            business
        });
    } catch (error) {
        res.status(500).json({
            message: "Error updating business visibility",
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
    setOrderStatus,
    sendVerificationEmail,
    verifyBusiness,
    setVisibility
}