// import 
const User = require('../models/User')
const Post = require('../models/Post')


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
            avatar: user.avatar, 
            username: user.data.username,
            _id: user.data._id
            }
        //  session does automatic saving for you .. you can override it so you can redirect user to logged in homepage once session done saving
        // remember you need session to be saved in database so user ker find proper homepage 
        req.session.save(()=> res.redirect('/'))
    }).catch( (e)=> {
        req.flash('errors', e)
        // manually saving session to store error messages in it
        // this is a way of creating session manually
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
    user.register().then(()=>{
        req.session.user = {
            username: user.data.username, 
            avatar: user.avatar,
            _id: user.data._id
        }
        req.session.save(()=>{
            res.redirect('/')
        })
    }).catch((regErrors)=>{
        regErrors.forEach((error)=>{
            req.flash('regErrors', error)  
            })
            req.session.save(()=>{
                res.redirect('/')
        })
    })
    // if there is any error in errors list
    
}
// homepage
exports.home = (req, res)=>{

    if (req.session.user){
        // pass the object into home-dashboard -- username will be available in mentioned template
        res.render('home-dashboard')
    } else {
        // red.flash will remove the flash message 
        res.render('home-guest', { regErrors: req.flash('regErrors')
                                })
    }
}

exports.mustBeLoggedIn = (req, res, next)=>{
    if (req.session.user){
        next()
    } else {
        req.flash('errors', "you must be logged in to perform this action.")
        req.session.save(()=>{
            res.redirect('/')
        })
    }

}

exports.ifUserExists = function(req, res, next){
    // user document found in set that to profile user
    User.findByUsername(req.params.username).then((userDocument)=>{
        req.profileUser = userDocument
        next()
    }).catch(()=>{
        // if user not found 
        res.render('404')

    })
}
exports.profilePostsScreen = function(req, res){
    // since this method and ifuserExists are bound to same url.. the req will carry information from ifUserExists
     // which can be used here
     // find post of user whose profile is being viewed
    Post.findByAuthorId(req.profileUser._id).then((posts)=>{

        res.render('profile', {    
            profileUsername: req.profileUser.username, 
            profileAvatar: req.profileUser.avatar,
            posts: posts
            }
        )

    }).catch(()=>{
        res.render('404')
    })

   

}