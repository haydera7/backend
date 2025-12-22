import express from "express";
import User from "../models/User.js";
import axios from "axios";

const router = express.Router();

router.get("/", async(req,res)=>{
    try{
     const users= await User.find();
     res.json(users);
    } catch (err){
       res.status(500).json({ message: err.message });
    }
});

router.delete("/:id", async(req,res)=>{
 try{
     await User.findByIdAndDelete(req.params.id);
     res.json({message : "user deleted" });
} catch(err){
   res.status(500).json({ message: err.message });
 }
});

export default router;