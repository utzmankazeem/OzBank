const      express = require("express");
           flash = require("connect-flash");
           mongoose = require("mongoose");
           session = require("express-session");
           app = express();
           port = 1010;

        //DB CONFIG
        const db = require("./config/key").mongoURI;
        mongoose.connect(db, {useNewUrlParser: true, useUnifiedTopology: true});

app.set("view engine", "ejs");
app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(express.static("public"));
//app.use(express.static("upload"));


        //EXPRESS-SESSION MIDDLEWARE
        app.use(session({
            secret: 'secret',
            saveUninitialized: true,
            resave: true
        }));

        //CONNECT FLASH
        app.use(flash());

        //GLOBAL VARS
        app.use((req, res, next) => {
            res.locals.success = req.flash('success');
            res.locals.er_msg = req.flash('er_msg');
            next();
        });

        //Routes Setup
        app.use('/', require('./routes/index'));
        app.use('/', require('./routes/banking'));
    
    app.listen(process.env.PORT || port, () => console.log('bank server started'));