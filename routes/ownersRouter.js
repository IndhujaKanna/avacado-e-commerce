const express =require("express");
const router=express.Router();
const {logout_admin}=require("../controllers/authController")
const ownerModel=require("../models/owner_model");
const isAdmin = require("../middlewares/isAdmin");
const isLoggedin=require("../middlewares/isLoggedin")
const {loginAdmin}=require("../controllers/authController")
const {registerAdmin}=require("../controllers/authController")


router.get("/admin",function(req,res){
    const success = req.flash('success','Logged in successfully');
    const error = req.flash('error');
    res.render("owner-login", { success,error,loggedin: false});
});

router.post("/admin",loginAdmin)
router.post("/admin-register",registerAdmin)
router.get("/admin-logout",logout_admin);


router.get("/adminpanel",isAdmin, function(req, res) {
    const success = req.flash('success');
    const error = req.flash('error');
    res.render("createproducts", { success, error });
});


//console.log(process.env.NODE_ENV);


module.exports=router;
