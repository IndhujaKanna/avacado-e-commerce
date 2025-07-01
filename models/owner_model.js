const mongoose=require('mongoose')


const ownerSchema=mongoose.Schema({
    fullname:{
        type:String,
        minLength:3,
        trim:true
    },
    isAdmin: {
        type: Boolean,
        default: true
    },
    email:String,
    password:String,
    products:{
        type:Array,
        default:[]
    },
    gstin:String,
    picture:String
})

module.exports=mongoose.model("owner",ownerSchema)