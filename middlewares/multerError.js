import multer from 'multer'; 

function errorHandler(err, req, res, next) { 
    if (err instanceof multer.MulterError) { 
        // Handle Multer-specific errors 
        req.flash("er_msg", "image bigger than 1mb");
        return res.redirect("/addcustomer");
    } else if (err) { 
        // Handle other errors 
        res.status(500).json({ error: 'An unknown error occurred.' }); 
    } else { 
        next(); 
    } 
}

export default errorHandler