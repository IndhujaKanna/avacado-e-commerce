const express =require("express");
const router=express.Router();
const upload=require("../config/multer-config")
const productModel=require("../models/product_model")
const isAdmin=require("../middlewares/isAdmin")

router.post("/create",isAdmin,upload.single("image"),async function(req,res){
    try{

        let {image,name,price,discount,bgcolor,panelcolor,textcolor}=req.body
        let product=await productModel.create({
            image:req.file.buffer,
            name,price,discount,bgcolor,panelcolor,textcolor
    
        })
        req.flash("success","Product created successfully")
        res.redirect("/owners/adminpanel")
    }
    catch(err){
        res.send(err.message)
    }
});

module.exports=router;