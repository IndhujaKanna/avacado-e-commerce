const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const { generateToken } = require("../utils/generateToken");
const { generateAdminToken } = require("../utils/generateAdminToken");
const user_model = require("../models/user_model");
const owner_model = require("../models/owner_model");


module.exports.registerAdmin = async function (req, res) {
    try {
        let { email, password, fullname } = req.body
        let owner = await owner_model.findOne({ email: email })
        if (owner) {
            req.flash("error", "You are already an Admin,pls login")
            return res.redirect("/owners/admin")
        }

        bcrypt.genSalt(10, function (err, salt) {
            bcrypt.hash(password, salt, async function (err, hash) {
                if (err) {
                    req.flash("error", "Something went wrong during login")
                    console.log(err);
                    return res.redirect("/owners/admin")
                }
                else {
                    let owner = await owner_model.create({
                        email,
                        password: hash,
                        fullname,
                    })

                    let token = generateAdminToken(owner)
                    res.cookie("token", token)
                    req.flash("success", "Admin Account created successfully")
                    return res.redirect("/owners/admin")

                    //res.send(user)

                }
            })
        })

    }

    catch (err) {
        console.log(err.message)
    }

};



module.exports.loginAdmin = async function (req, res) {
    try {
        let { email, password } = req.body
        let owner = await owner_model.findOne({ email: email })
        //if (!user) return res.status(401).send("Email or Password incorrect")
        if (!owner) {
            req.flash("error", "Email or Password incorrect");
            return res.redirect("/owners/admin");
        }
        bcrypt.compare(password, owner.password, function (err, result) {
            if (result) {
                let token = generateAdminToken(owner)
                res.cookie("token", token)
                return res.redirect("/owners/adminpanel")
            }
            else {
                req.flash("error", "Email or Password incorrect");
                return res.redirect("/owners/admin");
            }

        })

    }

    catch (err) {
        console.error(err.message);
        req.flash("error", "Internal Server Error");
        return res.redirect("/owners/admin");
    }


};


module.exports.logout = async function (req, res) {
    res.cookie("token", "")
    res.redirect("/")
};
module.exports.logout_admin = async function (req, res) {
    res.cookie("token", "")
    res.redirect("/owners/admin")
};


module.exports.registerUser = async function (req, res) {
    try {
        let { email, password, fullname } = req.body
        let user = await user_model.findOne({ email: email })
        if (user) {
            req.flash("error", "You already have an account,pls login")
            return res.redirect("/")
        }

        bcrypt.genSalt(10, function (err, salt) {
            bcrypt.hash(password, salt, async function (err, hash) {
                if (err) {
                    req.flash("error", "Something went wrong during login")
                    return res.redirect("/")
                }
                else {
                    let user = await user_model.create({
                        email,
                        password: hash,
                        fullname,
                    })

                    let token = generateToken(user)
                    res.cookie("token", token)
                    req.flash("success", "Account created successfully")
                    return res.redirect("/")

                    //res.send(user)

                }
            })
        })

    }

    catch (err) {
        console.log(err)
        req.flash("error", "Internal Server Error");
        return res.redirect("/")
    }

};



module.exports.loginUser = async function (req, res) {
    try {
        let { email, password } = req.body
        let user = await user_model.findOne({ email: email })
        //if (!user) return res.status(401).send("Email or Password incorrect")
        if (!user) {
            req.flash("error", "Email or Password incorrect");
            return res.redirect("/");
        }
        bcrypt.compare(password, user.password, function (err, result) {
            if (result) {
                let token = generateToken(user)
                res.cookie("token", token)
                return res.redirect("/shop")
            }
            else {
                req.flash("error", "Email or Password incorrect");
                return res.redirect("/");
            }

        })

    }

    catch (err) {
        console.error(err.message);
        req.flash("error", "Internal Server Error");
        return res.redirect("/");
    }


};
