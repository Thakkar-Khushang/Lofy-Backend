const express = require("express");
const router = express.Router();
const businessControllers = require("../controllers/business.controller");
const checkAuthBusiness = require("../middleware/checkAuthBusiness");

router.post("/signup", businessControllers.signup);
router.post("/login", businessControllers.login);
router.get("/profile", checkAuthBusiness, businessControllers.seeOwnPage);
router.patch("/update-profile", checkAuthBusiness, businessControllers.updateProfile);
router.get("/orders", checkAuthBusiness, businessControllers.getOrders);
router.patch("/order/status", checkAuthBusiness, businessControllers.setOrderStatus);

module.exports = router;