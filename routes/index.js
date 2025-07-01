const express = require("express");
const isLoggedin = require("../middlewares/isLoggedin");
const productModel = require("../models/product_model");
const userModel = require("../models/user_model");
const orderModel = require("../models/order_model");
const router = express.Router();
const gateway = require("../config/braintree");

router.get("/payment/token", async (req, res) => {
  gateway.clientToken.generate({}, function (err, response) {
    if (err) return res.status(500).send(err);
    res.send({ token: response.clientToken });
  });
});


router.post("/payment/checkout", isLoggedin, async (req, res) => {
  const { paymentMethodNonce, amount } = req.body;

  gateway.transaction.sale(
    {
      amount,
      paymentMethodNonce,
      options: { submitForSettlement: true },
    },
    async (err, result) => {
      if (err || !result.success) {
        console.error(err || result.message);
        req.flash("error", "Transaction failed.");
        return res.redirect("/cart");
      }

      const user = await userModel
        .findOne({ email: req.user.email })
        .populate("cart.product");

      await orderModel.create({
        user: user._id,
        items: user.cart,
        totalAmount: amount,
      });

      user.cart = [];
      await user.save();

      req.flash("success", "Payment successful! Order placed.");
      res.redirect("/orders");
    }
  );
});



router.get("/", function (req, res) {
    let error = req.flash("error"); // gets the flash message array
    let success = req.flash("success"); // gets the flash message array
    res.render("index", { error: error.length > 0 ? error[0] : "", loggedin: false, success: success[0] }); // sends the actual message
});

router.get("/myaccount", isLoggedin, async (req, res) => {
    try {
        const user = await userModel.findOne({ email: req.user.email });
        res.render("myaccount", {
            user,
            success: req.flash("success")[0],
            error: req.flash("error")[0]
        });
    } catch (err) {
        console.error(err.message);
        req.flash("error", "Failed to load account details.");
        res.redirect("/");
    }
});

router.post('/remove-from-cart/:id', isLoggedin, async (req, res) => {
    let user = await userModel.findOne({ email: req.user.email });
    console.log(user.cart)
    user.cart = user.cart.filter(item => item.product.toString() !== req.params.id);
    console.log(user.cart)
    await user.save();
    res.redirect("/cart");



});

router.get("/shop/discounted", isLoggedin, async function (req, res) {
    try {
        const products = await productModel.find({ discount: { $gt: 0 } }); // Products with discount > 0
        let success = req.flash("success");
        let error = req.flash("error");
        res.render("shop", { products, success: success[0], error: error[0] });
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Internal Server Error");
    }
});


router.get("/addtocart/:productid", isLoggedin, async function (req, res) {
    try {
        let user = await userModel.findOne({ email: req.user.email });

        let existingItem = user.cart.find(item => item.product && item.product.toString() === req.params.productid);


        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            user.cart.push({ product: req.params.productid, quantity: 1 });
        }

        await user.save();
        req.flash("success", "Added to cart");
        res.redirect("/shop");
    } catch (err) {
        console.error(err);
        req.flash("error", "Something went wrong.");
        res.redirect("/shop");
    }
});


router.get("/cart", isLoggedin, async function (req, res) {
    try {
        let user = await userModel.findOne({ email: req.user.email }).populate("cart.product");// <-- Fetch products from DB
        // let success = req.flash("success");
        // let error = req.flash("error");
        let detailedCart = user.cart.filter(item => item.product).map(item => {
            const price = Number(item.product.price);
            const discountPercent = Number(item.product.discount);
            const discountValue = (price * discountPercent) / 100;
            const bill = (price - discountValue) * item.quantity;

            return {
                ...item.product._doc,
                quantity: item.quantity,
                discountValue: (discountValue * item.quantity).toFixed(2),
                bill: bill.toFixed(2)
            };
        });



        let totalMRP = 0;
        let totalDiscount = 0;

        let success = req.flash("success");
        let error = req.flash("error");

        user.cart.forEach(item => {
            const price = Number(item.product.price);
            const discount = Number(item.product.discount);

            totalMRP += price * item.quantity;
            totalDiscount += ((price * discount) / 100) * item.quantity;
        });

        const platformFee = 20;
        const finalAmount = totalMRP - totalDiscount + platformFee;


        res.render("cart", {
            user: { ...user._doc, cart: detailedCart },
            totalMRP: Math.round(totalMRP),
            totalDiscount: Math.round(totalDiscount),
            finalAmount,
            platformFee,
            success: success[0],
            error: error[0]
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send("Internal Server Error");
    }
});

router.get("/shop", isLoggedin, async function (req, res) {
    try {
        const products = await productModel.find(); // <-- Fetch products from DB
        let success = req.flash("success");
        let error = req.flash("error");
        res.render("shop", { products, success: success[0], error: error[0] });

    } catch (err) {
        console.error(err.message);
        res.status(500).send("Internal Server Error");
    }
});


router.get("/checkout", isLoggedin, async (req, res) => {
  try {
    const user = await userModel
      .findOne({ email: req.user.email })
      .populate("cart.product");

    if (!user.cart.length) {
      req.flash("error", "Your cart is empty");
      return res.redirect("/cart");
    }

    const platformFee = 20;
    let totalMRP = 0;
    let totalDiscount = 0;

    user.cart.forEach(item => {
      const price = Number(item.product.price);
      const discount = Number(item.product.discount);
      totalMRP += price * item.quantity;
      totalDiscount += ((price * discount) / 100) * item.quantity;
    });

    const finalAmount = Math.round(totalMRP - totalDiscount + platformFee);
    res.render("checkout", { finalAmount });
  } catch (err) {
    console.error(err.message);
    req.flash("error", "Unable to load checkout page.");
    res.redirect("/cart");
  }
});




router.get("/orders", isLoggedin, async (req, res) => {
    try {
        const user = await userModel.findOne({ email: req.user.email });

        const orders = await orderModel.find({ user: user._id })
            .populate("items.product") // populate product inside items
            .sort({ createdAt: -1 });

        res.render("vieworders", { orders });

    } catch (err) {
        console.error(err.message);
        res.status(500).send("Internal Server Error");
    }
});



router.post("/cart/increase/:id", isLoggedin, async (req, res) => {
    const user = await userModel.findOne({ email: req.user.email });
    const item = user.cart.find(i => i.product.toString() === req.params.id);
    if (item) item.quantity += 1;
    await user.save();
    res.redirect("/cart");
});


// Decrease quantity
router.post("/cart/decrease/:id", isLoggedin, async (req, res) => {
    const user = await userModel.findOne({ email: req.user.email });
    const index = user.cart.findIndex(i => i.product.toString() === req.params.id);

    if (index !== -1) {
        if (user.cart[index].quantity > 1) {
            user.cart[index].quantity -= 1;
        } else {
            user.cart.splice(index, 1); // Remove item if quantity = 1
        }
        await user.save();
    }
    res.redirect("/cart");
});




module.exports = router;
