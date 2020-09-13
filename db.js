// import
const mongodb = require('mongodb')
const dotenv = require('dotenv')
dotenv.config()

// CONNECTION STRING from env -- you need to config
mongodb.connect(process.env.CONNECTIONSTRING, {useNewUrlParser: true, useUnifiedTopology: true}).then((client)=>{
    module.exports = client
    const app = require('./app')
    app.listen(process.env.PORT)

}).catch((err)=>{
    console.error(err)
})
    //  export client which handles all the databses
    