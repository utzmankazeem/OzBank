const express = require('express');
        bcrypt = require('bcryptjs');
        multer = require('multer');
        router = express.Router();
        Customer = require('../models/customer');
        Transaction = require('../models/transaction');

//Login Route//
app.route("/customer")
.get((req,res) =>{
 res.render("customer_login");
})
.post((req,res) =>{
 const {email, password}= req.body;
    Customer.findOne({email: email}, (er, customer) =>{
        if(er){
            req.flash("er_msg", "login to access app");
            res.redirect("/customer");
        }
        if(customer == undefined) {
            req.flash("er_msg", "email not found");
            res.redirect("/customer")
        } else {
            bcrypt.compare(password, customer.password, (er, isVerify) =>{
                if(er){
                    req.flash("er_msg", "There's an error")
                    res.redirect("/customer")
                } 
                if(isVerify) {
                    req.session.cbal = customer.cbal;
                    req.session.acnum = customer.accNum;
                    res.redirect("/customer-dashboard")
                } else {
                    req.flash("er_msg", "wrong password")
                    res.redirect("/customer")
                }
            })
        }
    })
});

//Dashboard Route//
app.get("/customer-dashboard", (req, res) =>{ let cB = req.session.cbal; let aN = req.session.acnum;
    if(!aN){
        req.flash("er_msg", "login to access app")
        res.redirect("/customer")
    } else {
        Customer.findOne({accNum: aN}, (er, acc) =>{
            if(acc){
            res.render("customer_dashboard", {cB, aN, customer: acc })
            } else {
                req.flash("er_msg", "account not found")
                res.redirect("/customer")
            }
        })
    }
});

//Transfer Route//
app.route("/transfer")
.get((req,res) =>{ let cB = req.session.cbal; let aN = req.session.acnum;
    if(!aN){
        req.flash("er_msg", "logiin to access app");
        res.redirect("/customer")
    } else {
        Customer.findOne({accNum: aN}, (er, acc) =>{
            if(acc){
                res.render("transfer", {cB, aN, customer: acc}); 
            }
        })  
    }
})
.post((req,res) =>{ let cB = req.session.cbal; let aN = req.session.acnum;
    if(!aN){
        req.flash("er_msg", "login to access app");
        res.redirect("/customer")
    } else {
        const{name, senders_accnum, receivers_accnum, type, amount} = req.body; 
        //Initiate empty Error Array
        let errors = [];
        
        // if(!receivers_accnum || !name || !amount) {
        //     errors.push({msg: "some fields are missing"});
        // }
        if(receivers_accnum ==""){
            errors.push({msg: "enter recipient acc number"})
        }//If amount is Empty/Not numeric
        if(!Number(amount)){
            errors.push({msg: "enter amount in figures"});
        }//If Receipient acc = sender acc
        if(senders_accnum == receivers_accnum) {
            errors.push({msg: "cannot transfer to same account"});
        }
        if(errors.length > 0){
        //Finding the loged customer enables us to retain the customer's info on the error page else it will throw an error
            Customer.findOne({accNum:aN}, (er, acc)=>{
                if(acc){
                res.render("transfer", {errors, cB, aN, customer: acc, receivers_accnum, name, amount });
                } else {
                    req.flash("er_msg", "no account found");
                    res.redirect("/transfer")
                }
            })
            } else {
            const recipient_accnum = receivers_accnum;
            const transfer_amount = amount;
            //Select From Recipient acount 
            Customer.findOne({accNum: recipient_accnum}, (er, receiver) =>{
                if(er){
                    req.flash("er_msg", "no account found")
                    res.redirect("/transfer")
                } else {
                    recipientName = receiver.fname +" "+ receiver.lname;
                    recipientCurrentBal = receiver.cbal;
                }
            //Perform Mathematical Transaction
                if(cB < transfer_amount) {
                    req.flash("er_msg", " your account balance is too low")
                    res.redirect("/transfer")
                } else {
                    const senderNewBal = (cB - transfer_amount);
                    const recipientNewBal = parseFloat(transfer_amount) + parseFloat(recipientCurrentBal);
            //Update Senders Account
                    Customer.findOneAndUpdate({accNum: senders_accnum},
                                            {$set:{cbal: senderNewBal}},
                                            (er) =>{
                                                if(er){
                                                    req.flash("er_msg", "failed to update senders acc")
                                                    res.redirect("/transfer");
                                                }
                                            });
            //Update Recipient Account
                    Customer.findOneAndUpdate({accNum: recipient_accnum},
                                            {$set: {cbal: recipientNewBal}},
                                            (er) =>{
                                                if(er){
                                                    req.flash("er_msg", "failed to update reciver acc")
                                                    res.redirect("/transfer");
                                                }
                                            });
            //Insert For Reciver
                    const recipient = new Transaction ({
                        type: "credit",
                        sender_name: name,
                        recipient_name: recipientName,
                        prev_bal: recipientCurrentBal,
                        new_bal: recipientNewBal,
                        transaction_amt: transfer_amount
                    })
                    recipient.save((er)=>{
                        if(er){
                            req.flash("er_msg", "error updating recipient")
                            res.render("/transfer")
                        }
                    })
            //Insert for Sender
                    const sender = new Transaction ({
                        type: "debit",
                        sender_name: name,
                        recipient_name: recipientName,
                        prev_bal: cB,
                        new_bal: senderNewBal,
                        transaction_amt: transfer_amount
                    }) 
                    sender.save((er, done) =>{
                        if(er){
                            req.flash("er_msg", "error updating sender");
                            res.render("/transfer");
                        } else {
                            req.flash("success", "transfer successful");
                            res.redirect("/transfer");
                        }
                    })
                }
            })      
        }
    }
});

//Transaction Route//
app.get("/transaction", (req, res) =>{ let cB = req.session.cbal; let aN = req.session.acnum;
    if(!aN){
        req.flash("er_msg", "login to access app");
        res.redirect("/customer")
    } else {
        Customer.findOne({accNum: aN}, (er,cus) =>{
            if(!cus){
                req.flash("er_msg", "no account found")
                res.redirect("/customer-dashboard");
            } else {
                 customerName = cus.fname +" "+ cus.lname
                 recieverName = cus.fname +" "+ cus.lname
            }
            //console.log(customerName)
            // , is == $and in querry for different fields
            //Transaction.find({sender_name: customerName, recipient_name: recieverName}, (er, acc)
            //Equivalent to finding all//
            //Transaction.find({sender_name:{$exists:true}, recipient_name:{$exists:true}}, (er, acc)
            Transaction.find({$or: [{sender_name: customerName}, {recipient_name: recieverName}]}, (er, acc)=>{
               //console.log(acc)
                if(er){
                    req.flash("er_msg", "No transactions");
                    res.redirect("/customer-dashboard");
                }
                if(acc == ""){
                    req.flash("er_msg", "you have No transaction");
                    res.redirect("/customer-dashboard"); 
                } else {
                    res.render("transaction", {customers: acc})
                }
            })
        })
    }
})

app.get("/customer-logout", (req,res) =>{ let cB = req.session.cbal; let aN = req.session.acnum;
    if(aN){
    req.session.destroy();
      res.redirect("/customer");  
    }
    
});

module.exports = router;