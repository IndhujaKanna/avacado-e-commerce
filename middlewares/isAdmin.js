const jwt = require("jsonwebtoken");
const ownerModel = require("../models/owner_model");
//isAdmin and isLoggedin combined for admin
module.exports = async function isAdmin(req, res, next) {
    if (!req.cookies.token) {
        req.flash("error", "you need to login first")
        return res.redirect("/owners/admin");
    }
    try {
        let decoded = jwt.verify(req.cookies.token, process.env.JWT_KEY)
        let owner = await ownerModel.findOne({ email: decoded.email }).select("-password")

        if (!owner || !owner.isAdmin) {
            req.flash("error", "Access denied. Admins only.");
            return res.redirect("/owners/login");
        }

        req.owner = owner
        next();
    }


    catch (err) {
    req.flash("error", "You must be an admin to view this page.");
    return res.redirect("/owners/login");
}
};
