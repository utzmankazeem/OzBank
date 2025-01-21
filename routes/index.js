import express from 'express';
import multer from "multer";
import path from 'path';
import errorHandler from "../middlewares/multerError.js"
const router = express.Router();
 
///// Storage for Passport Image /////
let storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/upload");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); //append the original file extension
  },
});
const maxSize = 1 * 1024 * 1024;//1mb
const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "image/png" || file.mimetype === "image/jpg" || file.mimetype === "image/jpeg") {
      cb(null, true);
    } else {
      cb(null, false);
      return cb(new Error("Only .png, .jpg, and .jpeg formats are allowed!"));
    }
  },
  limits: { fileSize: maxSize },
});

import { 
    index,
    getSignup,
    postSignup,
    getSignin,
    postSignin,
    dashboard,
    getAddCustomer,
    postAddCustomer,
    viewCustomer,
    customerDetails,
    getEdit,
    postEdit,
    deleteCustomer,
    logout
} from '../controller/indexController.js'
         
//Default Route// 
router.get('/', index)

router.route('/signup')
.get(getSignup)
.post(postSignup);
router.route("/signin")
.get(getSignin)
.post(postSignin);
//////////////////Banker Route///////////////////
//Home//
router.get("/dashboard", dashboard)

// Add Customer //
router.route("/addcustomer")
.get(getAddCustomer)
.post(upload.single("passport"), errorHandler, postAddCustomer)

router.route("/viewcustomer")
.get(viewCustomer)

//Customer Details //
router.route("/details/:id")
.get(customerDetails)

//Edit //
router.route("/edit/:id")
.get(getEdit)
.post(postEdit)

//Delete Route//
router.get("/delete/:id", deleteCustomer)
router.get("/logout", logout)

export default router;