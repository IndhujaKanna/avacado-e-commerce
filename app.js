const express =require("express");
const app=express();
const expressSession=require("express-session")
const PORT = process.env.PORT || 3000;
const flash=require("connect-flash")
require('dotenv').config();

//console.log(process.env.DEBUG);
const jwt=require('jsonwebtoken')
const path=require("path")
const db=require("./config/mongoose_connection");
const ownersRouter=require("./routes/ownersRouter")
const usersRouter=require("./routes/usersRouter")
const productsRouter=require("./routes/productsRouter")
const indexRouter=require("./routes/index")
const cookieParser = require("cookie-parser");

app.use(express.json())
app.use(express.urlencoded({extended:true}));
app.use(cookieParser())
app.use(expressSession({
    secret: process.env.SESSION_SECRET || "fallbackSecret",
    resave:false,
    saveUninitialized:false,
}))
app.use(flash())
app.use(express.static(path.join(__dirname,"public")))
app.set("view engine","ejs")

app.use("/owners",ownersRouter)
app.use("/",indexRouter)
app.use("/users",usersRouter)
app.use("/products",productsRouter)


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
