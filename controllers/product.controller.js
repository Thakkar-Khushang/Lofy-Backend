const mongoose = require("mongoose");
const Product = require("../models/product.model");
const Customer = require("../models/customer.model");
const Order = require("../models/order.model");

const getAllProducts = async (req, res) => {
    try {
        const products = await Product.find();
        res.status(200).json(products);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        res.status(200).json(product);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

const addProduct = async (req, res) => {
    try {
        const {name, description, price} = req.body;
        const business_id = req.user.userId;
        const product = new Product({
            _id: new mongoose.Types.ObjectId(),
            name,
            description,
            price,
            business_id
            });
        await product.save();
        res.status(201).json({
            message: "Product added successfully",
            product
        });
    } catch (err) {
        res.status(500).json({
            message: "Error adding product",
            err
        });
    }
}

const updateProduct = async (req, res) => {
    try {
        const {name, description, price} = req.body;
        const business_id = req.user.userId;
        const product = await Product.findById(req.params.id);
        if(product.business_id+"" !== business_id) {
            return res.status(401).json({
                message: "You are not authorized to update this product"
            });
        }
        const newProduct = await Product.findByIdAndUpdate(req.params.id, {
            name,
            description,
            price
        }, { new: true });
        res.status(200).json({
            message: "Product updated successfully",
            newProduct
        });
    } catch (err) {
        res.status(500).json({
            message: "Error updating product",
            err
        });
    }
}

const deleteProduct = async (req, res) => {
    try {
        const business_id = req.user.userId;
        const product = await Product.findById(req.params.id);
        if(product.business_id+"" !== business_id) {
            return res.status(401).json({
                message: "You are not authorized to delete this product"
            });
        }
        await Product.findByIdAndDelete(req.params.id);
        res.status(200).json({
            message: "Product deleted successfully"
        });
    } catch (err) {
        res.status(500).json({
            message: "Error deleting product",
            err
        });
    }
}

const productDetails = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        res.status(200).json(product);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

const addReview = async (req, res) => {
    try {
        const customer_id = req.user.userId;
        const customer = await Customer.findById(customer_id);
        if(!customer) {
            return res.status(404).json({
                message: "Customer not found"
            });
        }
        const {review, rating, orderId} = req.body;
        if(!review || !rating) {
            return res.status(400).json({
                message: "Review and rating are required"
            });
        }
        if(!orderId) {
            return res.status(400).json({
                message: "Order id is required"
            });
        }
        const order = await Order.findById(orderId);
        if(!order) {
            return res.status(404).json({
                message: "Order not found"
            });
        }
        for(let i = 0; i < order.products.length; i++) {
            if(order.products[i].product_id+"" === req.params.id) {
                order.products[i].reviewed = true;
                order.products[i].review = review;
                order.products[i].rating = rating;
                break;
            }
        }
        await order.save();
        const product = await Product.findById(req.params.id);
        product.reviews.push({
            customer_id,
            customer_name: customer.name,
            review,
            rating
        });
        if(product.rating==-1){
            product.rating=rating;
        }else{
            product.rating=(product.rating+rating)/2;
        }
        await product.save();
        res.status(200).json({
            message: "Review added successfully",
            product
        });
    } catch (err) {
        res.status(500).json({
            message: "Error adding review",
            err
        });
    }
}

module.exports = {
    getAllProducts,
    getProductById,
    addProduct,
    updateProduct,
    deleteProduct,
    productDetails,
    addReview
}