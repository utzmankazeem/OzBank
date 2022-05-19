const mongoose = require("mongoose");

const transactionSchema = {
    type: {
        type: String,
        required: true
    },

    sender_name: {
        type: String,
        required: true
    },

    recipient_name: {
        type: String,
        required: true
    },

    prev_bal: {
        type: Number,
        required: true
    },

    new_bal: {
        type: Number,
        required: true
    },

    transaction_amt: {
        type: Number,
        required: true
    },

    date: {
        type: Date,
        default: Date.now
    }
}

const Transaction = mongoose.model("transaction", transactionSchema);
module.exports = Transaction;