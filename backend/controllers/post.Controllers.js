import Post from "../models/Post.model.js"
import uploadOnCloudinary from "../config/cloudinary.js"
import { io } from "../index.js";
import Notification from "../models/notification.model.js";

/*
This middleware helps user to create post. If user wants to upload a image with the post it store image on cloudinary. It stores the post data into the Post database with the user's id.
*/
export const createPost=async (req,res)=>{
    try {
        let {description}=req.body
        let newPost;
    if(req.file){
        let image=await uploadOnCloudinary(req.file.path)
         newPost=await Post.create({
            author:req.userId,
            description,
            image
        })
    }else{
        newPost=await Post.create({
            author:req.userId,
            description
        })
    }
return res.status(201).json({newPost,message:"Post created..!"})

    } catch (error) {
        return res.status(201).json(`Can not create post yet ${error}`)
    }
}

/*
This middleware find all the post in database and send to the frontend to show on the website 
with the author's details.
*/
export const getPost=async (req,res)=>{
    try {
        const post=await Post.find()
        .populate("author","firstName lastName profileImage headline userName")
        .populate("comment.user","firstName lastName profileImage headline")
        .sort({createdAt:-1})
        return res.status(200).json(post)
    } catch (error) {
        return res.status(500).json({message:"getPost error"})
    }
}


/*
This middleware creates like and store all likes in the databse with the user id who liked 
the post and also which post
*/
export const like =async (req,res)=>{
    try {
        let postId=req.params.id
        let userId=req.userId
        let post=await Post.findById(postId)
        if(!post){
            return res.status(400).json({message:"post not found"})
        }
        if(post.like.includes(userId)){
          post.like=post.like.filter((id)=>id!=userId)
        }else{
            post.like.push(userId)
            if(post.author!=userId){
                let notification=await Notification.create({
                    receiver:post.author,
                    type:"like",
                    relatedUser:userId,
                    relatedPost:postId
                })
            }
           
        }
        await post.save()
      io.emit("likeUpdated",{postId,likes:post.like})
       

     return  res.status(200).json(post)

    } catch (error) {
      return res.status(500).json({message:`like error ${error}`})  
    }
}

/*
This middleware allows user to comment on the post and store that comment into post database
*/
export const comment=async (req,res)=>{
    try {
        let postId=req.params.id
        let userId=req.userId
        let {content}=req.body

        let post=await Post.findByIdAndUpdate(postId,{
            $push:{comment:{content,user:userId}}
        },{new:true})
        .populate("comment.user","firstName lastName profileImage headline")
        if(post.author!=userId){
        let notification=await Notification.create({
            receiver:post.author,
            type:"comment",
            relatedUser:userId,
            relatedPost:postId
        })
    }
        io.emit("commentAdded",{postId,comm:post.comment})
        return res.status(200).json(post)

    } catch (error) {
        return res.status(500).json({message:`comment error ${error}`})  
    }
}