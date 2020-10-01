const apiRouter = require("express").Router()
const userController = require('./controllers/userController')
const postController = require('./controllers/postController')

const cors = require("cors")

apiRouter.use(cors())

apiRouter.post('/login', userController.apiLogin )
apiRouter.post('/create-post',userController.apiMustBeLoggedIn, postController.apiCreatePost )
apiRouter.delete('/post/:postid', userController.apiMustBeLoggedIn, postController.apiDelete)
// create methods like does user exists etc before sending back posts  by author
apiRouter.get('/postsbyauthor/:username', userController.apiGetPostByUsername)

module.exports = apiRouter