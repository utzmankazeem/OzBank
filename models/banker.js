import mongoose from "mongoose"
const adminSchema =  ({
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    date_created: {
        type: Date,
        default: Date.now
    }
})
// , {timestamps:true});

const Admin = mongoose.model("Admin", adminSchema);
export default Admin;
