const express =require("express");
const app=express();
const session=require("express-session")
app.use(session({
  secret: process.env.SESSION_SECRET || "defaultSecretKey",
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // true only if using HTTPS
}));
