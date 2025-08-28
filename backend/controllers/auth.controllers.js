import genToken from "../config/token.js"
import User from "../models/user.model.js"
import bcrypt from "bcryptjs"


/* 
This middleware takes input (like firstName,lastName,...etc) for signup and store
the data in the database and it creates token and store token in cookies after 
that returns the user !
 */
export const signUp=async (req,res)=>{
    try {
        const {firstName,lastName,userName,email,password}=req.body
       let existEmail=await User.findOne({email})
       if(existEmail){
        return res.status(400).json({message:"Email already exist !"})
       }
       let existUsername=await User.findOne({userName})
       if(existUsername){
        return res.status(400).json({message:"UserName already exist !"})
       }
       if(password.length<8){
        return res.status(400).json({message:"Password must be at least 8 characters !"})
       }
      
       let hassedPassword=await bcrypt.hash(password,10) // Hashing password using bcrypt js
      
       const user=await User.create({
        firstName,
        lastName,
        userName,
        email,
        password:hassedPassword
       })

       let token=await genToken(user._id)
       res.cookie("token",token,{
        httpOnly:true,
        maxAge:7*24*60*60*1000,
        sameSite:"strict",
        secure:process.env.NODE_ENVIRONMENT==="production"
       })
      return res.status(201).json({user,message: "Signup successfully !"})

    } catch (error) {
        return res.status(500).json({message:"Cannot signup"})
   
    }
}


/*
This is login middleware .It takes only two data (username and password) and 
check the data in the databse . If the user exists it simply returns the user 
otherwise gives login error !
*/
export const login=async (req,res)=>{
    try {
        const {email,password}=req.body
        let user=await User.findOne({email})
        if(!user){
         return res.status(400).json({message:"User does not exist !"})
        }

       const isMatch=await bcrypt.compare(password,user.password)
       if(!isMatch){
        return res.status(400).json({message:"Incorrect password !"})
       }
   
        let token=await genToken(user._id)
        res.cookie("token",token,{
         httpOnly:true,
         maxAge:7*24*60*60*1000,
         sameSite:"strict",
         secure:process.env.NODE_ENVIRONMENT==="production"
        })
       return res.status(200).json({user,message:"Login successfully !"})
    } catch (error) {
        return res.status(500).json({message:"Can not login !"})
    }
}

/*
This is logout middleware.It cleares the token from cookies to logout.
*/
export const logOut=async (req,res)=>{
    try {
        res.clearCookie("token")
        return res.status(200).json({message:"Log out successfully !"})
    } catch (error) {
        return res.status(500).json({message:"Can not logout !"})
    }
}