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
// set server so socket io can be used
const server = require('http').createServer(app)
const io = require('socket.io')(server)

// setup session for socket.io
io.use(function(socket, next){
    sessionOptions(socket.request, socket.request.res, next)
})

// socket is listening to event "connection"
io.on("connection", (socket)=>{
    // only if user online
    if (socket.request.session.user){
        // fetching user from session
        let user = socket.request.session.user
        socket.emit("welcome", {username: user.username, avatar: user.avatar})
        socket.on("chatMessageFromBrowser", data =>{
            // message is from frontend javascript(sendMessageToServer)
            socket.broadcast.emit("chatMessageFromServer", {message: sanitizeHTML(data.message, {allowedTag: [], allowedAttributes:{}}), username: user.username, avatar: user.avatar})
        } )

    }
   
})
// exporting app
module.exports = server