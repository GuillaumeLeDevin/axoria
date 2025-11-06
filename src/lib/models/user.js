import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  userName: { 
    type: String, 
    required: true, 
    unique: true 
  },
  normalizedUsername: {
    type: String, 
    required: true,
    unique: true 
  }, 
  email: {
    type: String, 
    required: true, 
    unique: true
  },
  password: {
    type: String, 
    required: true 
  },
    // isAdmin: {
    //     type: Boolean,
    //     default: false
    // },
    // role: {
    //     type: String,
    //     enum: ['user', 'admin'],
    //     default: 'user'
    // }
})

export const User = mongoose.models?.User || mongoose.model('User', userSchema)