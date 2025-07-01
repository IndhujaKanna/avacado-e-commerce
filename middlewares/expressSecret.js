const express =require("express");
const app=express();
const session=require("express-session")
const MongoStore = require("connect-mongo");
app.use(session({
  secret: process.env.SESSION_SECRET || "fallbackSecret",
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }, // true only if using HTTPS
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI,
    ttl: 14 * 24 * 60 * 60 // 14 days
  })

}));
