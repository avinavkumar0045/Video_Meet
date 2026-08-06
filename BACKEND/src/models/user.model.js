import mongoose ,{ Schema } from "mongoose";

const userSchema = new Schema(
    {
        name  : {type : String , required : true},
        username : {type : String , requiered : true , unique : true},
        password : {type : String , requiered : true},
        token : {type: String} , // local storage mein only token, baaki we will fetch from database
    }
)

const User = mongoose.model("User" , userSchema);

export {User};

