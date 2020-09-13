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
        //  session does automatic saving for you .. you can override it so you can redirect user to logged in homepage once session done saving
        // remember you need session to be saved in database so user ker find proper homepage 
        req.session.save(()=> res.redirect('/'))
    }).catch( (e)=> {
        req.flash('errors', e)
        // manually saving session to store error messages in it
        // this is a way of creating session 
        req.session.save(() => res.redirect('/' ))
    })


}

exports.logout = function(req,  res){
    // this will destroy the session -- delete session from mongodb
    // reason you need callback function here because you need to wait for session to be deleted from mongodb so it can redirect to appropiate homepage
    req.session.destroy(()=> res.redirect('/'))

    
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
        // pass the object into home-dashboard -- username will be available in mentioned template
        res.render('home-dashboard', {username: req.session.user.username})
    } else {
        // red.flash will remove the flash message 
        res.render('home-guest', {errors: req.flash('errors')})
    }
}