const express = require("express");
const user_model = require("../models/user_model");
const router = express.Router();
const {registerUser}=require("../controllers/authController")
const {loginUser}=require("../controllers/authController")

router.get("/", function (req, res) {
    res.send("hey")
});

router.post("/register",registerUser)
router.post("/login",loginUser)
module.exports = router;