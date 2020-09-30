// import
const express = require('express')

// mini app
const router = express.Router() 

// import controller
const userController = require('./controllers/userController')
const postController = require('./controllers/postController')
const followController = require('./controllers/followController')


// User routers
router.get('/', userController.home)
router.post('/register', userController.register)
router.post('/login', userController.login)
router.post('/logout', userController.logout)
router.post('/doesUsernameExists', userController.doesUsernameExists)
router.post('/doesEmailExists', userController.doesEmailExists)

// Post related routes
// mustbeLoggedIn wil check for if user is logged in or no
router.get('/create-post',userController.mustBeLoggedIn, postController.viewCreateScreen )
router.post('/create-post',userController.mustBeLoggedIn, postController.create )
router.get('/post/:id', postController.viewSingle)
router.get('/post/:id/edit', userController.mustBeLoggedIn, postController.viewEditScreen )
router.post('/post/:id/edit',userController.mustBeLoggedIn, postController.edit )
router.post('/post/:id/delete',userController.mustBeLoggedIn, postController.delete)


// profile related routers
router.get('/profile/:username', userController.ifUserExists, userController.sharedProfileData, userController.profilePostsScreen)
router.get('/profile/:username/followers', userController.ifUserExists, userController.sharedProfileData, userController.profileFollowersScreen)
router.get('/profile/:username/following', userController.ifUserExists, userController.sharedProfileData, userController.profileFollowingScreen)


// search bar

router.post('/search', postController.search)

// follow related routers

router.post('/addFollow/:username', userController.mustBeLoggedIn, followController.addFollow)
router.post('/removeFollow/:username', userController.mustBeLoggedIn, followController.removeFollow)




module.exports = router 