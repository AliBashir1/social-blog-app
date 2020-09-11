// import 
const express = require('express')
const router = require('./router')
// import session 
const session = require('express-session')
// import mongo connect to store data in mongodb -- pass session in it
const MongoStore = require('connect-mongo')(session)

let app = express()

// setting up sessions 
let sessionOptions = session({
    secret: "whats going on",
    store: new MongoStore({client: require('./db')}),
    resave: false,
    saveUninitialized: false,
    // mongo db uses memory to store session - here it will override the store option
    // you have to make sure that 
    cookie:{
        // age of cookie = 24 hours
        maxAge: 100 * 60 * 60 * 24,
        httpOnly:true
    }


})


// enable session for express framework
app.use(sessionOptions)

// boiler plate code -- this enables access data from html forms
app.use(express.urlencoded({ extended: false }))
app.use(express.json())

// access public folder - contains css
app.use(express.static('public'))

// set views
app.set('views', 'views')

// template engine -- ejs 
app.set('view engine', 'ejs')

// homepage
app.use('/', router)


// exporting app
module.exports = app