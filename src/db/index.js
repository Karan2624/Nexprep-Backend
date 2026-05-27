import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
     try{
        const connectInstance = await mongoose.connect(
        `${process.env.MONGODB_URI}/${DB_NAME}`
    )
    console.log(`Mongodb connected !! DB Host : ${connectInstance.connection.host}`);
     } catch(err){
        console.log("Mongodb connection error ",err);
     }
    };
    export default connectDB;