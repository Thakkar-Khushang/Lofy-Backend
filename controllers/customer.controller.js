const mongoose = require("mongoose");
const Customer = require("../models/customer.model");
const Business = require("../models/business.model");
const Product = require("../models/product.model");
const Order = require("../models/order.model");
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
const verification = require("../middleware/sendEmail");

const signup = async (req, res) => {
    try {
        const { email, password } = req.body;
        const customer = await Customer.findOne({ email })
        if (customer) {
            return res.status(400).json({
                message: "Customer already exists"
            });
        }
        bcrypt.hash(password, 10, async function(err, hash) {
            const customer = new Customer({
                _id: new mongoose.Types.ObjectId(),
                email,
                password: hash
            });
            await customer.save();
            const token = jwt.sign(
                {
                  userId: customer._id,
                  email: customer.email,
                  name: customer.name,
                  userType: "customer"
                },
                process.env.JWT_SECRET_CUST,
                {
                  expiresIn: "1h",
                }
              );
            verification(customer.email, token, "customer", (err, message)=>{
                if(err) {
                    res.status(500).json({
                        info: "Error sending email",
                        message,
                        error: err
                    });
                } else {
                    res.status(200).json({
                        message: "Verification mail sent, please verify your email then login",
                        customer
                    });
                }
            });
        });
    } catch (error) {
        res.status(500).json({
            message: "Error creating customer",
            error
        });
    }
}

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const customer = await Customer.findOne({ email });
        if (!customer) {
            return res.status(404).json({
                message: "Customer not found"
            });
        }
        bcrypt.compare(password, customer.password, function(err, result) {
            if (result) {
                const token = jwt.sign(
                    {
                      userId: customer._id,
                      email: customer.email,
                      name: customer.name,
                      userType: "customer"
                    },
                    process.env.JWT_SECRET_CUST,
                    {
                      expiresIn: "30d",
                    }
                  );
                res.status(200).json({
                    message: "Customer logged in successfully",
                    customer,
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
            message: "Error logging in customer",
            error
        });
    }
}

const seeBusinesses = async (req, res) => {
    try {
        const userId = req.user.userId;
        const customer = await Customer.findById(userId).select("-password");
        const businesses = await Business.find({ city: customer.city, isVerified: true, visible: true }).select("-password");
        if(businesses.length === 0) {
            return res.status(404).json({
                message: "No businesses found"
            });
        }
        let topBusinesses;
        if(businesses.length > 3) {
            topBusinesses = businesses.sort((a, b) => b.views - a.views).slice(0, 3);
        }else{
            topBusinesses = businesses.sort((a, b) => b.views - a.views);
        }
        const categories = [];
        let businessesUnderCategory = [];
        for(let i = 0; i < businesses.length; i++) {
            const catIndex = categories.indexOf(businesses[i].category)
            if(catIndex === -1) {
                categories.push(businesses[i].category);
                businessesUnderCategory.push([businesses[i]]);
            } else{
                businessesUnderCategory[catIndex].push(businesses[i]);
            }
        }
        let finalCategories = [];
        for(let i=0; i<categories.length; i++) {
            finalCategories.push({
                category: categories[i],
                businesses: businessesUnderCategory[i]
            })
        }
        res.status(200).json({
            message: "Businesses retrieved successfully",
            topBusinesses,
            categories: finalCategories
        });
    } catch (error) {
        res.status(500).json({
            message: "Error retrieving businesses",
            error
        });
    }
}

const seeBusinessPage = async (req, res) => {
    try {
        const businessId = req.params.id;
        const business = await Business.findById(businessId).select("-password");
        if(!business) {
            return res.status(404).json({
                message: "Business not found"
            });
        }
        business.views += 1;
        await business.save();
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

const customerOrders = async(req, res) =>{
    try{
        const userId = req.user.userId;
        const customer = await Customer.findById(userId).select("-password");
        if(!customer) {
            return res.status(404).json({
                message: "Customer not found"
            });
        }
        
        const orders = await Order.find({customer_id: userId+""})
        if(orders.length == 0){
            return res.status(404).json({
                message: "No orders found"
            });
        }
        for(let i = 0; i < orders.length; i++) {
            let products = []
            let business = await Business.findById(orders[i].business_id);
            for(let j = 0; j < orders[i].products.length; j++) {
                const product = await Product.findById(orders[i].products[j].product_id).select("-business_id -__v");
                product._doc.quantity = orders[i].products[j].quantity;
                products.push(product);
            }
            orders[i]._doc.products = products;
            orders[i]._doc.business_name = business.name;
        }

        res.status(200).json({
            message: "Orders retrieved successfully",
            orders,
        });
    } catch (error) {
        res.status(500).json({
            message: "Error fetching orders",
            error
        });
    }
}

const placeOrder = async (req, res) => {
    try{
        const userId = req.user.userId;
        const customer = await Customer.findById(userId).select("-password");
        if(!customer) {
            return res.status(404).json({
                message: "Customer not found"
            });
        }
        const { businessId, products, address } = req.body;
        if(address){
            customer.address = address;
        }
        if(!businessId || products.length==0){
            res.status(400).json({
                message: "Business Id or products in cart data is missing"
            })
        }
        const order = new Order({
            _id: new mongoose.Types.ObjectId(),
            customer_id: userId,
            business_id: businessId,
            products,
            address: customer.address
        })
        await order.save();
        res.status(200).json({
            message: "Order placed successfully",
            order
        })
    } catch(error){
        res.status(500).json({
            message: "Error placing order",
            error
        });
    }
}

const customerProfile = async (req, res) => {
    try {
        const userId = req.user.userId;
        const customer = await Customer.findById(userId).select("-password");
        if(!customer) {
            return res.status(404).json({
                message: "Customer not found"
            });
        }
        res.status(200).json({
            message: "Customer profile retrieved successfully",
            customer
        });
    } catch (error) {
        res.status(500).json({
            message: "Error retrieving customer profile",
            error
        });
    }
}

const editCustomer = async (req, res) => {
    try {
        const userId = req.user.userId;
        const customer = await Customer.findById(userId).select("-password");
        if(!customer) {
            return res.status(404).json({
                message: "Customer not found"
            });
        }
        const { name, address, city, phone } = req.body;
        if(name) {
            customer.name = name;
        }
        if(address) {
            customer.address = address;
        }
        if(city) {
            customer.city = city;
        }
        if(phone) {
            customer.phone = phone;
        }
        await customer.save();
        res.status(200).json({
            message: "Customer updated successfully",
            customer
        });
    } catch (error) {
        res.status(500).json({
            message: "Error updating customer",
            error
        });
    }
}

const verifyCustomer = async (req, res) => {
    try {
        const userToken = req.params.token;
        jwt.decode(userToken, process.env.JWT_SECRET_CUST, async(err, decoded) => {
            if(err) {
                return res.status(400).json({
                    message: "Invalid token"
                });
            }
            else{
                const userId = decoded.userId;
                const customer = await Customer.findById(userId);
                if(!customer) {
                    return res.status(404).json({
                        message: "Customer not found"
                    });
                }
                customer.isVerified = true;
                await customer.save();
                res.status(200).json({
                    message: "Customer verified successfully"
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
        const customer = await Customer.findOne({ email });
        if(!customer) {
            return res.status(404).json({
                message: "Customer not found"
            });
        }
        const token = jwt.sign({ userId: customer._id }, process.env.JWT_SECRET_CUST, { expiresIn: '1h' });
        verification(email, token, "customer", (err, info) => {
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

module.exports = {
    signup,
    login,
    seeBusinesses,
    seeBusinessPage,
    editCustomer,
    customerOrders,
    customerProfile,
    placeOrder,
    verifyCustomer,
    sendVerificationEmail
}