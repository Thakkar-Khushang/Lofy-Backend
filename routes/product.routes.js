const express = require("express");
const router = express.Router();
const productControllers = require("../controllers/product.controller");
const checkAuthCustomer = require("../middleware/checkAuthCustomer");
const checkAuthBusiness = require("../middleware/checkAuthBusiness");


router.get("/", productControllers.getAllProducts);
router.get("/:id", productControllers.getProductById);
router.post("/add", checkAuthBusiness, productControllers.addProduct);
router.put("/update/:id", checkAuthBusiness, productControllers.updateProduct);
router.delete("/delete/:id", checkAuthBusiness, productControllers.deleteProduct);
router.get("/details/:id", productControllers.productDetails);
router.post("/review/:id", checkAuthCustomer, productControllers.addReview);

module.exports = router;