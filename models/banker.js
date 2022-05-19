const mongoose = require("mongoose");

const adminSchema = {
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
}

const Admin = new mongoose.model("admin", adminSchema);
module.exports = Admin;