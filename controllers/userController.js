// import 
const User = require('../models/User')

exports.login = function(){

}

exports.logout = function(){
    
}

exports.register = (req, res)=>{
    let user = new User(req.body)
    user.register()
    // if there is any error in errors list
    if (user.errors.length){
        res.send(user.errors)

    } else {
        res.send("no errors ")
    }
}
// homepage
exports.home = (req, res)=>{
    res.render('home-guest')
}