// import 
const express = require('express')
let app = express()

app.use(express.static('public'))

// set views
app.set('views', 'views')

// template engine -- ejs 
app.set('view engine', 'ejs')

// homepage
app.get('/', (req, res)=>{
    res.render('home-guest')
})

app.listen(3000)