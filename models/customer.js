import mongoose from "mongoose"
const customerSchema = ({
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
            required:[true, 'your mobile number']
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
            required: [true, 'must be 10 numbers']
        },
        
        passport: {
            data: Buffer,
            contentType: String
        },

        accType: {
            type: String,
            required: true,
            enum:["Savings", "Current", "Fixed"]
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
})

const Customer = mongoose.model("Customer", customerSchema);
export default Customer

