const express = require("express");
const router = express.Router();
const customerControllers = require("../controllers/customer.controller");
const checkAuthCustomer = require("../middleware/checkAuthCustomer");

router.post("/signup", customerControllers.signup);
router.post("/login", customerControllers.login);
router.get("/profile", checkAuthCustomer, customerControllers.customerProfile);
router.patch("/update-profile", checkAuthCustomer, customerControllers.editCustomer);
router.get("/see-businesses", checkAuthCustomer, customerControllers.seeBusinesses);
router.get("/see-business/:id", checkAuthCustomer, customerControllers.seeBusinessPage);
router.get("/get-orders", checkAuthCustomer, customerControllers.customerOrders);
router.post("/place-order", checkAuthCustomer, customerControllers.placeOrder);
router.post("/send-email", customerControllers.sendVerificationEmail);
router.get("/verify", customerControllers.verifyCustomer);

module.exports = router;