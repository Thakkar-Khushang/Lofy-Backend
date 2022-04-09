const Customer = require("../models/customer.model");
const Business = require("../models/business.model");
const Product = require("../models/product.model");
const Order = require("../models/order.model");
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
const { response } = require("express");

const signup = async (req, res) => {
    try {
        const { email, password } = req.body;
        bcrypt.hash(password, 100, function(err, hash) {
            const customer = new Customer({
                email,
                password: hash
            });
            await customer.save();
            res.status(201).json({
                message: "Customer created successfully",
                customer
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
            return res.status(401).json({
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
                      userType: "business"
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
        const customer = await Customer.findById(userId);
        const businesses = await Business.find({ city: customer.city });
        if(businesses.length === 0) {
            return res.status(404).json({
                message: "No businesses found"
            });
        }
        const topBusinesses = businesses.sort((a, b) => b.views - a.views).slice(0, 3);
        const categories = [];
        for(let i = 0; i < businesses.length; i++) {
            if(!categories.includes(businesses[i].category)) {
                categories.push({category: businesses[i].category, businesses: []});
            }
            categories[categories.indexOf(businesses[i].category)].businesses.push(businesses[i])

        }
        res.status(200).json({
            message: "Businesses retrieved successfully",
            topBusinesses,
            categories
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
        const businessId = req.params.businessId;
        const business = await Business.findById(businessId);
        if(!business) {
            return res.status(404).json({
                message: "Business not found"
            });
        }
        business.views += 1;
        await business.save();
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

const customerOrders = async(req, res) =>{
    try{
        const userId = req.user.userId;
        const customer = await Customer.findById(userId);
        if(!customer) {
            return res.status(404).json({
                message: "Customer not found"
            });
        }
        const orders = await Order.find({customer_id: userId})
        if(orders.length == 0){
            return res.status(404).json({
                message: "No orders found"
            });
        }
        res.status(200).json({
            message: "Orders received successfully",
            orders
        })
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
        const customer = await Customer.findById(userId);
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
            customer_id: userId,
            business_id: businessId,
            products,
            address: customer.address
        })
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

const editCustomer = async (req, res) => {
    try {
        const userId = req.user.userId;
        const customer = await Customer.findById(userId);
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

module.exports = {
    signup,
    login,
    seeBusinesses,
    seeBusinessPage,
    editCustomer,
    customerOrders,
    placeOrder
}