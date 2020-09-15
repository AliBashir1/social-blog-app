// import
const express = require('express')

// mini app
const router = express.Router() 

// import userController
const userController = require('./controllers/userController')

// import postController
const postController = require('./controllers/postController')

// User routers
router.get('/', userController.home)
router.post('/register', userController.register)
router.post('/login', userController.login)
router.post('/logout', userController.logout)

// Post related routes
// mustbeLoggedIn wil check for if user is logged in or no
router.get('/create-post',userController.mustBeLoggedIn, postController.viewCreateScreen )
module.exports = router