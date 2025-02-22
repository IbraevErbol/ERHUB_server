import mongoose from "mongoose";

const Schema = mongoose.Schema;

const userSchema = new Schema({
    username: {
        type: String,
        require: true,
    },
    email: {
        type: String,
        unique: true,
        require: true,
    },
    password: {
        type: String,
        require: true,
    },
    profileImageUrl: {
        type: String,
    },
    phoneNumber: {
        type: String, 
        default: '',
    },
    gender: {
        type: String,
        enum: ['Male', 'Female'],
        default: 'Male',
    },
    age: {              
        type: Number,
        min: 0,  
        default: null,
    }
})
const Users = mongoose.model('Users', userSchema);
export default Users;