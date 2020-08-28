// import
const express = require('express')
// mini app
const router = express.Router() 
// import userController
const userController = require('./controllers/userController')

router.get('/', userController.home)
router.post('/register', userController.register)
router.post('/login', userController.login)
module.exports = router