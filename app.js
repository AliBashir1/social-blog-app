// import 
const express = require('express')
const router = require('./router')

let app = express()

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

app.listen(3000)