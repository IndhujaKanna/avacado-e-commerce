const mongoose=require('mongoose')
const config=require("config");
const dbgr=require("debug")("production:mongoose");
mongoose.connect(`${config.get("MONGODB_URI")}/avacado`)
.then(function(){
    dbgr("connected");
})
.catch(function(err){
    dbgr(err);
})

module.exports=mongoose.connection; 