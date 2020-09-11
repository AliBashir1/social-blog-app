// import 
const User = require('../models/User')


exports.login = function(req, res){

     /**
     * Promise is in User
     * .then() if promise is resolve  -- what to do if promise resolve
     * .catch() if promise is reject  -- what to do if promise rejected
     * 
     * 
     */
    // create User instance which will holds the value from lgin
    let user = new User(req.body)
    user.login().then( (result) => {
        // after setting up session in app.js session object will be available hre
        // add user property in session as an object -- you can use session anywhere in
        req.session.user = {
            favColor:"Royal Blue", 
            username: user.data.username
            }
        res.send(result)
    }).catch( (e)=>res.send(e))


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

    if (req.session.user){
        res.send("You are logged in ..")
    } else {
        res.render('home-guest')
    }
}