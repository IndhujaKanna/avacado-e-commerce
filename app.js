const express =require("express");
const app=express();
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
app.use(express.static(path.join(__dirname,"public")))
app.set("view engine","ejs")

app.use("/owners",ownersRouter)
app.use("/",indexRouter)
app.use("/users",usersRouter)
app.use("/products",productsRouter)


app.listen(3000)