// this is where you will use all of you lib
// import 
const express = require('express')
const router = require('./router')
const markDown = require('marked')
const sanitizeHTML = require("sanitize-html")
// import session 
const session = require('express-session')
// import mongo connect to store data in mongodb -- pass session in it
const MongoStore = require('connect-mongo')(session)

// import flash-messages
const flash = require('connect-flash')

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
        httpOnly: true
    }
})


// enable session for express framework 
app.use(sessionOptions)
// enable flash
app.use(flash())
/**
 * using anonymous function in app.us ensure that this function will execute for every req
 * locals will make "user" object available in ejs templates (view) - app.use make sure to run this function on every request and next() will call next function
 * as at given url. 
  all of the ejs template will have acces to user property - means you dont have to pass following anymore
    {username: req.session.user.username, avatar: req.session.user.avatar} 
 */




// boiler plate code -- this enables access data from html forms
app.use(express.urlencoded({ extended: false }))
app.use(express.json())

// access public folder - contains css
app.use(express.static('public'))

// set views
app.set('views', 'views')

// template engine -- ejs 
app.set('view engine', 'ejs')
app.use(function(req, res, next){ 
    // make mark down available in ejs views --
    res.locals.filterUserHTML = function(content){
        return sanitizeHTML (markDown(content),{allowedTags: ['p', 'br', 'b', 'strong', 'bold', 'li', 'ul', 'em', 'h1', 'h2', 'h3', 'i'], allowedAttributes:{}})
    }
    // make errors and success flash messages available in all templates
    res.locals.errors =  req.flash("errors")
    res.locals.success = req.flash("success")
    // user id available in views if user exists -this will be used as verification of ownership of use to its post
    req.visitorId = (req.session.user) ? req.session.user._id : 0
   
    // session data available in views 
    res.locals.user = req.session.user
    next()
    
})

// router
app.use('/', router)


// exporting app
module.exports = app