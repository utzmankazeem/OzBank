import bcrypt from "bcryptjs";
import fs from "fs";
import Admin from "../models/banker.js";
import Customer from "../models/customer.js";

export const index = async (req, res) => {
    await res.render("mybank");
};
export const getSignup = async (req, res) => {
    await res.render("signup");
};
export const postSignup = async (req, res) => {
  const { username, email, pass1, pass2 } = req.body;

  let errors = [];
  // Validate form fields
  if (!username || !email || !pass1 || !pass2) {
    errors.push({ msg: "Some fields are missing" });
  }
  if (pass1 !== pass2) {
    errors.push({ msg: "Passwords do not match" });
  }
  if (pass1.length < 6) {
    errors.push({ msg: "Password must be at least 6 characters long" });
  }

  // If there are validation errors, re-render the signup form with errors
  if (errors.length > 0) {
    return res.render("signup", { errors, username, email, pass1, pass2 });
  } else {
    try {
      // Check if the username is already taken
      const user = await Admin.findOne({ username });
      if (user) {
        req.flash("er_msg", "This user already exists");
        return res.redirect("/signup");
      }

      // Encrypt the password
      const hash = await bcrypt.hash(pass1, 10);
      // Create and save the new user
      await Admin.create({
        username,
        email,
        password: hash,
      });

      // Success message and redirect
      req.flash("success", "Successfully signed up");
      return res.redirect("/signin");
    } catch (error) {
      console.error(error); // Log the error for debugging
      req.flash("er_msg", "An error occurred. Please try again.");
      return res.redirect("/signup");
    }
  }
};
export const getSignin = async (req, res) => {
    await res.render("signin");
};
export const postSignin = async (req, res) => {
  const { username, password } = req.body;
  // Check if username or password is missing
  if (!username || !password) {
    req.flash("er_msg", "username or password missing");
    return res.redirect("/signin");
  }
  try {
    const foundAdmin = await Admin.findOne({ username });
    if (!foundAdmin) {
      req.flash("er_msg", "user not found");
      return res.redirect("/signin");
    } 
    // Compare hashed password
    const match = await bcrypt.compare(password, foundAdmin.password);
      if (!match) {
        req.flash('er_msg', "incorrect password");
        return res.redirect('/signin');
      } 
      // If passwords match, set session
      req.session.admin_id = foundAdmin._id;
      req.session.username = foundAdmin.username;
      req.session.email = foundAdmin.email;
      req.flash("success", "welcome to our Bank");
      return res.redirect("/dashboard");
  } catch (error) {
    console.log(error);
    req.flash("er_msg", "server error");
    return res.redirect("/signin");
  }
};
//////////////////Banker Route///////////////////////
export const dashboard = async (req, res) => {
  let a_id = req.session.admin_id, a_name = req.session.username, a_email = req.session.email;
    try {
      if (!a_id || !a_name || !a_email) {
        req.flash("er_msg", "Incomplete session data. Please log in again.");
        return res.redirect("/signin");
        // Ensure the function exits after redirection
    }else {
            return res.render("dashboard", { a_id, a_name, a_email });
        }
    } catch (error) {
        console.log(error);
        req.flash("er_msg", "server error");
        return res.redirect("/signin");
    }
};


export const getAddCustomer = async (req, res) => {
  let a_id = req.session.admin_id;
  let a_name = req.session.username;
  let a_email = req.session.email;
  try {
    if (a_id) {
      await res.render("add_customer", { a_id, a_name, a_email });
    } else {
      throw Error
    }
  } catch (error) {
    req.flash("er_msg", "login to access app");
    res.redirect("/signin");
    throw error;
  }
};


export const postAddCustomer = async (req, res) => {
  try {//////////////////////////Setting Session/////////////////////////////////
    let a_id = req.session.admin_id, a_name = req.session.username, a_email = req.session.email;

    if (!a_id) {
      req.flash("er_msg", "Login to access app");
      return res.redirect("/signin");
    }
    // We randomly generate accNum
    let pre = 889, rand = Math.random().toString().slice(2, 9);
    let anum = pre + rand;

    const { fname, lname, mobile, email, sex, bvn, accType, obal, password } =
      req.body;

    let passport = null;
    if (req.file) {
      passport = {
        data: fs.readFileSync("public/upload/" + req.file.filename),
      };
    }
    const maxSize = 1 * 1024 * 1024;//1mb
    // Initialize error array
    let errors = [];
    if (passport > maxSize) {
      errors.push({ msg: "Please fill must be under 1mb" });
    }
    if (
      !fname ||
      !lname ||
      !mobile ||
      !email ||
      !sex ||
      !bvn ||
      !passport ||
      !accType ||
      !obal ||
      !password
    ) {
      errors.push({ msg: "Please fill in all fields" });
    }
    if (errors.length > 0) {
      return res.render("add_customer", {
        errors,
        a_id,
        a_name,
        a_email,
        fname,
        lname,
        mobile,
        email,
        sex,
        bvn,
        passport,
        accType,
        obal,
        password,
      });
    }
    try {
      const hash = await bcrypt.hash(password, 10);
      await Customer.create({
        fname,
        lname,
        mobile,
        email,
        sex,
        bvn,
        passport,
        accType,
        accNum: anum,
        obal,
        cbal: obal,
        password: hash,
        username: a_name,
      });
      req.flash("success", "Customer added successfully");
      return res.redirect("/viewcustomer");
    } catch (error) {
      console.error(error);
      req.flash("er_msg", "Problem adding customer");
      return res.redirect("/addcustomer");
    }
  } catch (error) {
    console.error("Error in postAddCustomer: ", error);
    req.flash("er_msg", "Something went wrong. Please try again.");
    return res.redirect("/addcustomer");
  }
};

export const viewCustomer = async (req, res) => {
    let a_id = req.session.admin_id, a_name = req.session.username, a_email = req.session.email;
    try {
        if (!a_id || !a_name || !a_email) {
            req.flash("er_msg", "login to access app");
            res.redirect("/signin");
        }
        const customer = await Customer.find({ username: a_name });
        if (customer) {
            res.render("view_customer", { a_id, a_name, a_email, customers: customer });
        }
    } catch (error) {
        req.flash("er_msg", "No customer listed addnew customer")
        res.redirect("/addcustomer");
        throw error;
    }
};

export const customerDetails = async (req, res) => {
    let a_id = req.session.admin_id, a_name = req.session.username, a_email = req.session.email;
    const _id = req.params.id;
    try {
        if (!a_id || !a_name || !a_email) {
            req.flash("er_msg", "login to access app");
            res.redirect("/signin");
        }
        const customer = await Customer.findById(_id);
        if (customer) {
            res.render("details", { a_id, a_name, a_email, details: customer });
        }
    } catch (error) {
      req.flash("er_msg", "problem getting customer details");
      res.redirect("/viewcustomer")
      throw error;
    }
};

export const getEdit = async (req, res) => {
    let a_id = req.session.admin_id, a_name = req.session.username, a_email = req.session.email;
    const _id = req.params.id;
    try {
        if (!a_id || !a_name || !a_email) {
            req.flash("er_msg", "login to access app");
            res.redirect("/signin");
        }
        const customer = await Customer.findById(_id);
        if (customer) {
            res.render("edit", { a_id, a_name, a_email, details: customer });
        }
    } catch (error) {
      req.flash("er_msg", "problem viewing customer details");
      res.redirect("/viewcustomer")
        throw error;
    }
};

export const postEdit = async (req, res) => {
    let a_id = req.session.admin_id, a_name = req.session.username, a_email = req.session.email;
    const editId = req.params.id;
    try {
        if (!a_id || !a_name || !a_email) {
            req.flash("er_msg", "login to access app");
            res.redirect("/signin");
        }
        const customer = await Customer.findOneAndUpdate(
            { _id: editId },
            { $set: req.body }
        );
        if (customer) {
            req.flash("success", "customer update successfull");
            return res.redirect("/viewcustomer");
        } else {
          req.flash('er_msg', 'update error');
          return res.redirect('/viewcustomer');
        }
    } catch (error) {
        console.log('Error updating customer:',error);
        req.flash("er_msg", "Cannot update customer");
        return res.redirect("/viewcustomer");
    }
};

export const deleteCustomer = async (req, res) => {
    let a_id = req.session.admin_id, a_name = req.session.username, a_email = req.session.email;
    const id = req.params.id;
    try {
        if (!a_id || !a_name || !a_email) {
            req.flash("er_msg", "login to access app");
            res.redirect("/signin");
        }
        const customer = await Customer.deleteOne({ _id: id });
          // const delt = Customer.filter((customer) => {
          //   res.render("viewCustomer", { a_id, a_name, a_email, customers: customer })
          // })
        if (customer > 1) {
            req.flash("er_msg", "no customer found");
            res.redirect("/viewcustomer");
        }else{
            req.flash("success", "customer deleted");
            res.redirect("/viewcustomer");
        }
    } catch (error) {

        req.flash("er_msg", "error deleting");
        res.redirect("/viewcustomer");
        throw error;
    }
};

export const logout = (req, res) => {
    let a_id = req.session.admin_id;
    if (a_id) {
        req.session.destroy();
        res.redirect("/");
    }
};

