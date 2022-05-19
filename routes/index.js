const express = require('express');
      bcrypt = require('bcryptjs');
      multer = require('multer');
      fs = require('fs');
      path = require('path');
      router = express.Router();
      Banker = require("../models/banker");
      Admin = require("../models/banker");
      Customer = require('../models/customer');

         
//Default Route// 
router.get('/', (req,res) => {
    res.render("mybank");
})

//SignUp Route//
app.route("/signup")
.get((req, res) => {
    res.render("signup");
})
.post((req, res) => {
    const{username, email, pass1, pass2} = req.body;

    let errors = [];

    if(!username || !email || !pass1 || !pass2) {
        errors.push({msg: "some fields are missing"});
    }
    if(pass1 != pass2){
        errors.push({msg: "password does not match"});
    }
    if(pass1.length <6) {
        errors.push({msg: "password must be at least 6 character"});
    }
    if(errors.length > 0) {
        res.render("signup", {errors, username, email, pass1, pass2});
    } else {
        Admin.findOne({username:username}, (er, admin) => {
            if(er){
                req.flash('er_msg', "Internal Server error");
                res.redirect("/signup");
            }
            if(admin){
                req.flash('er_msg', "This user already exist");
                res.redirect("/signup");
            } else {
                bcrypt.hash(pass1, 10, (er, hash) => {
                    const admin = new Admin ({
                        username,
                        email,
                        password: hash
                    })
                    admin.save((er) => {
                        if(er){
                            req.flash('er_msg', "internal server error");
                            res.redirect("/signup");
                        } else {
                            req.flash("success", "successfully signed up");
                            res.redirect("/signin");
                        }
                    })
                })
            }
        })
    }
});

//Signin Route//
app.route("/signin")
.get((req, res) => {
    res.render("signin");
})
.post((req, res) => {
    const{username, password} = req.body;

    Admin.findOne({username: username}, (er, admin) => {
        if(er){
            req.flash("er_msg", "server error");
            res.redirect("/");
        }
        if(admin == undefined) {
            req.flash("er_msg", "username not found");
            res.redirect("/signin");
        } else {
            bcrypt.compare(password, admin.password, (er, isVerify) => {
                if(er) {
                    req.flash('er_msg', "enter password");
                    res.redirect("/signin");
                }
                if(isVerify) {
                    req.session.admin_id = admin._id;
                    req.session.username = admin.username;
                    req.session.email = admin.email;
                    req.flash("success", "welcome to our Bank");
                    res.redirect("/dashboard");
                } else {
                    req.flash("er_msg", "wrong password");
                    res.redirect("/signin")
                }
            });
        }
    });
});

/////////////////////////////////////////////////Banker Route//////////////////////////////////////////

//Home//
router.get("/dashboard", (req, res) => { let a_id = req.session.admin_id; let a_name = req.session.username;  let a_email = req.session.email;
    if(!a_id) {
        req.flash('er_msg', "login to access app");
        res.redirect('/signin');
    } else {
       res.render("dashboard", { a_id, a_name, a_email }); 
    }  
})


//Storage for the passport image//
let storage = multer.diskStorage({
    destination :'public/upload',
    filename :(req, passport, cb) =>{
        cb(null, Date.now() + passport.originalname)
    } 
})
const maxSize = 1 * 1024 * 1024; //= 1mb

//Image Upload//
let upload = multer({
      storage: storage, 
      fileFilter: (req, passport, cb) => {
        if (passport.mimetype == "image/png"|| passport.mimetype == "image/jpg" || passport.mimetype == "image/jpeg") {
            cb(null, true);
        } else {
            cb(null, false);
            return cb(new Error("only .png .jpg and jpeg allowed!"));
        }
      },
      limits: {fileSize: maxSize},
    })

// Add Customer //
app.route("/addcustomer")
.get((req, res) => { let a_id = req.session.admin_id; let a_name = req.session.username;  let a_email = req.session.email;
    if(!a_id) {
       req.flash('er_msg', "login to access app");
       res.redirect("/signin");
    } else {
        res.render("add_customer", { a_id, a_name, a_email });
    }
})
.post(upload.single('passport'), (req, res, er) => { let a_id = req.session.admin_id; let a_name = req.session.username;  let a_email = req.session.email;   
    if(!a_id) {
        req.flash('er_msg', "login to access app");
        res.redirect("/signin");
    } else {

        //We Randomlly generate {accNum}
        let pre = 889;
        let rand = Math.random().toString().slice(2,9);
        let anum = (pre + rand);

        
        const { fname, lname, mobile, email, sex, bvn, accType, obal, password} = req.body;
        const passport = {data: fs.readFileSync('public/upload/' + req.file.filename)}; 

        //WE INITIALIZE AN ERROR ARRAY
        let errors = []; 
        //Multer Error Handler//
        // if(er instanceof multer.MulterError ) {
        //     errors.push({msg: "error"});
        // }
        // if(passport.size > maxSize){
        //     errors.push({msg: "file is too large"});
        // }
        // if(passport.mimetype != fileFilter){
        //     errors.push({msg: ".png .jpg and jpeg allowed! "});
        // }
        if(!fname || !lname || !mobile || !email || !sex || !bvn || !passport || !accType || !obal || !password){
            errors.push({msg: "please some fields are missing"});
    }
        
    if(errors.length > 0){
        res.render('add_customer', {errors, a_id, a_name, a_email, fname, lname, mobile, email, sex, bvn, passport, accType, obal, password })
    } else {
            bcrypt.hash(password, 10, (er, hash) => {
                const customer = new Customer ({
                fname,
                lname,
                mobile,
                email,
                sex,
                bvn,
                passport,
                accType,
                accNum:anum,
                obal,
                cbal: obal,
                password: hash,
                username:a_name
            })
                customer.save((er) => {
                    if(er) {
                        req.flash('er_msg', "problem adding customer");
                        console.log(er);
                        res.redirect("/addcustomer");
                    } else {
                        req.flash("success", "customer added sucessfully");
                        res.redirect("/viewcustomer");
                    }
                })
            })
        }
    }
})

app.route("/viewcustomer")
.get((req, res) => { let a_id = req.session.admin_id; let a_name = req.session.username;  let a_email = req.session.email;  
    if(!a_id){
        req.flash("er_msg", "login to access app")
        res.redirect("/signin")
    } else {
        Customer.find({username: a_name}, (er, found) => {
            if(er) {
                res.redirect("/addcustomer");
            } else {
                res.render("view_customer", { a_id, a_name, a_email, customers: found })
            }
        })
    }
})

//Customer Details //
app.route("/details/:id")
.get((req, res) => { let a_id = req.session.admin_id; let a_name = req.session.username;  let a_email = req.session.email;
    const details = req.params.id;
    if(!a_id){
        req.flash("er_msg", "login to access app")
        res.redirect("/signin")
    } else {
        Customer.findById(details, (er, det) => {
            if(!er){
                res.render("details", { a_id, a_name, a_email, details: det });
            }       
        })
    }
})

//Edit //
app.route("/edit/:id")
    .get((req, res) => { let a_id = req.session.admin_id; let a_name = req.session.username; let a_email = req.session.email;  
        const edit = req.params.id;
        if(!a_id) {
            req.flash("er_msg", "login to access app")
            res.redirect("/signin")
        } else {
            Customer.findById(edit, (er, edt) => {
                if(!er) {
                    res.render("edit", { a_id, a_name, a_email, details: edt });
                }
            })
        }
    })
    .post((req, res) => { let a_id = req.session.admin_id; let a_name = req.session.username; let a_email = req.session.email; 
        const editId = req.params.id;
        if (!a_id) {
            req.flash("er_msg", "login to access app")
            res.redirect("/signin")
        } else {
            Customer.findOneAndUpdate({_id: editId},
                    {$set: req.body},
                (er, det) => { 
                    if(!er) {
                        req.flash("success", "customer update successfull")
                        res.redirect("/viewcustomer");
                    } else {
                        req.flash("er_msg", "Cannot update customer")
                        res.redirect("/viewcustomer");
                }
            })
        }
    })

//Delete Route//
app.get("/delete/:id", (req, res) =>{ let a_id = req.session.admin_id; let a_name = req.session.username;  let a_email = req.session.email;
    const delet = req.params.id;
        if (!a_id) {
            req.flash("er_msg", "login to access app")
            res.redirect("/signin")
        } else {
            Customer.deleteOne({_id: delet}, (er, det) => {
                if(er) {
                    req.flash("er_msg", "error deleting")
                    res.redirect("/viewcustomer")
                }
                if(det > 1){
                    req.flash("er_msg", "no customer found")
                    res.redirect("/viewcustomer")
                } else {
                    req.flash("success", "customer deleted")
                    res.redirect("/viewcustomer");
                }
            })
        }
})

router.get("/logout", (req, res) => { let a_id = req.session.admin_id; let a_name = req.session.username;  let a_email = req.session.email;
    if(a_id){
       req.session.destroy();
        res.redirect("/")
    }
})

module.exports = router;