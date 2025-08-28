import mongoose from "mongoose";

// For the database connection
const connectDb=async ()=>{
    try {
      await mongoose.connect(process.env.MONGODB_URL)
    } catch (error) {
        console.log("db error");
        
    }
}
export default connectDb