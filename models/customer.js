const mongoose = require("mongoose");

const customerSchema = {
        fname: {
            type: String,
            required: true
        },

        lname: {
            type: String,
            required: true
        },

        mobile: {
            type: Number,
            required: true
        },

        email: {
            type: String,
            required: true
        },

        sex: {
            type: String,
            required: true
        },

        bvn: {
            type: Number,
            required: true
        },
        
        passport: {
            data: Buffer,
            contentType: String
        },

        accType: {
            type: String,
            required: true
        },

        accNum: {
            type: Number,
            required: true
        },

        obal: {
            type: Number,
            required: true
        },

        cbal: {
            type: Number,
            required: true
        },

        password: {
            type: String,
            required: true
        },

        username: {
            type: String,
            required: true
        }
}

const Customer = mongoose.model("customer", customerSchema);
module.exports = Customer; 