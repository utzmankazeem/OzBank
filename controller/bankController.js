import bcrypt from "bcryptjs";
import Customer from "../models/customer.js";
import Transaction from "../models/transaction.js";
export const getCustomer = async (req, res) => {
    await res.render("customer_login");
};
export const postCustomer = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        req.flash("er_msg", "email or password error");
        return res.redirect("/customer");
    }
    try {
        const foundCustomer = await Customer.findOne({ email });
        if (!foundCustomer) {
            req.flash("er_msg", "no customer found");
            return res.redirect("/customer");
        }
        const match = await bcrypt.compare(password, foundCustomer.password);
        if (!match) {
            req.flash("er_msg", "undefined password");
            return res.redirect("/customer");
        }// If passwords match, set session
        req.session.cbal = foundCustomer.cbal;
        req.session.acnum = foundCustomer.accNum;
        req.flash("success", "welcome Back");
        return res.redirect("/customer/dashboard");
    } catch (error) {
        console.log(error)
        req.flash("er_msg", "login to access app");
        return res.redirect("/customer");
    }
};
export const custDashboard = async (req, res) => {
    let cB = req.session.cbal, aN = req.session.acnum;
    try {
        if (!aN || !cB) {
            req.flash("er_msg", "login to access app");
            return res.redirect("/customer");
        }
        const acc = await Customer.findOne({ accNum: aN });
        if (acc) {
            return res.render("customer_dashboard", { cB, aN, customer: acc });
            }
    } catch (error) {
        console.log(error)
        req.flash("er_msg", "account not found");
        return res.redirect("/customer");
    }
};

export const getTransfer = async (req, res) => {
    let cB = req.session.cbal, aN = req.session.acnum;
    try {
        if (!aN || !cB) {
            req.flash("er_msg", "login to access app");
            return res.redirect("/customer");
        }
        const acc = await Customer.findOne({ accNum: aN });
        if (acc) {
            return res.render("transfer", { cB, aN, customer: acc });
        }
    } catch (error) {
        console.log(error)
        req.flash("er_msg", "Transfer error");
        return res.redirect("/customer");
        
    }
};
export const postTransfer = async (req, res) => {
    let cB = req.session.cbal, aN = req.session.acnum;
    if (!aN || !cB) {
        req.flash("er_msg", "login to access app");
        return res.redirect("/customer");
    } else {
        const { name, senders_accnum, receivers_accnum, type, amount } = req.body;
        //Initiate empty Error Array
        let errors = [];
        if (receivers_accnum == "") {
            errors.push({ msg: "enter recipient acc number" });
        } //If amount is Empty/Not numeric
        if (!Number(amount)) {
            errors.push({ msg: "enter amount in figures" });
        } //If Receipient acc = sender acc
        if (senders_accnum == receivers_accnum) {
            errors.push({ msg: "can't tranfer to same acc" });
        }
        if (errors.length > 0) {
            //Finding the loged customer enables us to retain the customer's info on the error page else it will throw an error
            const acn = await Customer.findOne({ accNum: aN });
            if (!acn) {
                req.flash("er_msg", "transaction error");
                return res.redirect("/customer/transfer");
            } else {
                return res.render("transfer", {
            errors,cB,aN,customer: acn,receivers_accnum,name,
            amount });
            }
        }
        try {
            const recipient_accnum = receivers_accnum;
            const transfer_amount = amount;
            //Select From Recipient acount
            const rAcc = await Customer.findOne({ accNum: recipient_accnum });
            if (!rAcc) {
                req.flash("er_msg", "no account found");
                return res.redirect("/customer/transfer");
            }
            let recipientName = rAcc.fname + " " + rAcc.lname;
            let recipientCurrentBal = rAcc.cbal;
            
            //Perform Mathematical Transaction
            if (cB < transfer_amount) {
                req.flash("er_msg", " your account balance is too low");
                return res.redirect("/customer/transfer");
            } else {
                const senderNewBal = cB - transfer_amount;
                const recipientNewBal =
                    parseFloat(transfer_amount) + parseFloat(recipientCurrentBal);
                //Update Senders Account
                const sAcc = await Customer.findOneAndUpdate(
                    { accNum: senders_accnum },
                    { $set: { cbal: senderNewBal } }
                );
                if (!sAcc) {
                    req.flash("er_msg", "failed to update senders acc");
                    return res.redirect("/customer/transfer");
                }
                //Update Recipient Account
                const cAcc = await Customer.findOneAndUpdate(
                    { accNum: recipient_accnum },
                    { $set: { cbal: recipientNewBal } }
                );
                if (!cAcc) {
                    req.flash("er_msg", "failed to update reciver acc");
                    return res.redirect("/customer/transfer");
                }
                //Insert For Reciver
                const recipient = await Transaction.create({
                    type: "credit",
                    sender_name: name,
                    recipient_name: recipientName,
                    prev_bal: recipientCurrentBal,
                    new_bal: recipientNewBal,
                    transaction_amt: transfer_amount,
                });
                //Insert for Sender
                const sender = await Transaction.create({
                    type: "debit",
                    sender_name: name,
                    recipient_name: recipientName,
                    prev_bal: cB,
                    new_bal: senderNewBal,
                    transaction_amt: transfer_amount,
                });
                req.flash("success", "transfer successful");
                return res.redirect("/customer/transfer");
            }
        } catch (error) {
            console.log(error)
            req.flash("er_msg", "error updating transfer");
            return res.redirect("/customer/transfer");
        }
    }
}

export const getTransactions = async (req, res) => {
    let cB = req.session.cbal, aN = req.session.acnum;
    try {
        if (!aN || !cB) {
            req.flash("er_msg", "login to access app");
            return res.redirect("/customer");
        }
        const cus = await Customer.findOne({ accNum: aN });
        if (!cus) {
            req.flash("er_msg", "no account found");
            return res.redirect("/customer/dashboard");
        }
        try {
            let customerName = cus.fname + " " + cus.lname;
            let recieverName = cus.fname + " " + cus.lname;
            const acc = await Transaction.find({
                $or: [{ sender_name: customerName }, { recipient_name: recieverName }],
            })
            return res.render("transaction", { customers: acc });
        } catch (error) {
            console.log(error)
            req.flash("er_msg", "you have No transaction");
            return res.redirect("/customer/dashboard");
        }
    } catch (error) {
        console.log(error)
        req.flash("er_msg", "No transactions");
        return res.redirect("/customer/dashboard");

    }
};
export const custLogout = (req, res) => {
     // Clear session data
     req.session = null; 
     // Explicitly delete the cookie
     res.clearCookie('session'); 

     res.redirect("/customer");
};
