const express = require("express");
const router = express.Router();
const orderControllers = require("../controllers/order.controller");

router.get("/", orderControllers.getAllOrders);
router.get("/:id", orderControllers.getOrderById);