import express from 'express'
import flash from 'connect-flash'
import cookieSession from 'cookie-session'
import connectDB from './config/key.js'
import home from './routes/index.js'
import bank from './routes/banking.js'
const app = express()
const PORT = 9090

// DBconn
connectDB();
app.set('view engine', 'ejs');
app.use(express.urlencoded({extended: true}))
app.use(express.json())
app.use(express.static('public'));

// Session Midlware
app.use(cookieSession({
    secret: 'secret',
    saveUninitialized: true,
    resave: true,
    // Cookie Options
    maxAge: 24 * 60 * 60 * 1000, // 24 hours,
    cookie: {
        secure: true
    }
}))

// Flash Msgs
app.use(flash());

// Global Vars
app.use((req, res, next) => {
    res.locals.success = req.flash('success');
    res.locals.errMsg = req.flash('er_msg');
    next();
})

// Routes
app.use('/', home)
app.use('/customer', bank)

app.listen(process.env.PORT || PORT, ()=> console.log(`serving on http://localhost:${PORT}`))