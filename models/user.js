const mongoose = require('mongoose');
const bcrypt= require('bcryptjs')
const jwt = require('jsonwebtoken')

const userSchema= new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    username:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true,
        select:false
    },
    about:{
        type:String
    },
    posts:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"Post"
        }
    ],
    followers:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"User"
        }
    ],
    following:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"User"
        }
    ]
},{
    timestamps:true
});


//hashpassword
userSchema.pre("save",async function(next){
    if(this.isModified("password")){
        this.password=await bcrypt.hash(this.password, 10)
    }
    next();
})


//match password
userSchema.methods.matchPassword = async function(password){
    return await bcrypt.compare(password, this.password)

}

//generate token
userSchema.methods.generateToken=async function(){
    return jwt.sign({_id:this._id},process.env.TOKEN_SECRET)

}

const userModel=mongoose.model("User",userSchema)

module.exports=userModel;