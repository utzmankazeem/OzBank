import express from 'express';
const router = express.Router();
import {
    getCustomer,
    postCustomer,
    custDashboard,
    getTransfer,
    postTransfer,
    getTransactions,
    custLogout
} from '../controller/bankController.js'

//Login Route//
router.route("/")
.get(getCustomer)
.post(postCustomer);

//Dashboard Route//
router.get("/dashboard", custDashboard);

//Transfer Route//
router.route("/transfer")
.get(getTransfer)
.post(postTransfer);

//Transaction Route//
router.get("/transaction", getTransactions)

// Logout //
router.get("/logout", custLogout);

export default router;