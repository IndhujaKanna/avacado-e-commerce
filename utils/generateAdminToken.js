const jwt=require("jsonwebtoken")


const generateAdminToken=(owner)=>{
    //console.log(process.env.JWT_KEY)
    return jwt.sign({email:owner.email,id:owner._id},process.env.JWT_KEY)
}
module.exports.generateAdminToken= generateAdminToken; 