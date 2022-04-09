const express = require("express");
const router = express.Router();
const businessControllers = require("../controllers/business.controller");
const checkAuthBusiness = require("../middleware/checkAuthBusiness");

router.post("/signup", businessControllers.signup);
router.post("/login", businessControllers.login);
router.get("/profile", checkAuthBusiness, businessControllers.seeOwnPage);