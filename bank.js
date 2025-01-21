import express from 'express'
import flash from 'connect-flash'
import session from 'express-session'
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
app.use(session({
    secret: 'secret',
    saveUninitialized: true,
    resave: false,
    cookie: {}
}))

if (app.get('env') === 'production') {
  app.set('trust proxy', 1) // trust first proxy
  sess.cookie.secure = true // serve secure cookies
}


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