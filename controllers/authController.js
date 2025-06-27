const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const { generateToken } = require("../utils/generateToken");
const user_model = require("../models/user_model");


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
        console.log(err.message)
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


module.exports.logout = async function (req, res){
    res.cookie("token","")
    res.redirect("/")
};