const express = require("express");
const router = express.Router();
const productControllers = require("../controllers/product.controller");
const checkAuthCustomer = require("../middleware/checkAuthCustomer");
const checkAuthBusiness = require("../middleware/checkAuthBusiness");


router.get("/", productControllers.getAllProducts);
router.get("/:id", productControllers.getProductById);
router.post("/", checkAuthBusiness, productControllers.addProduct);
router.put("/:id", checkAuthBusiness, productControllers.updateProduct);
router.delete("/:id", checkAuthBusiness, productControllers.deleteProduct);
router.get("/:id/details", productControllers.productDetails);
router.post("/:id/review", checkAuthCustomer, productControllers.addReview);