// import
const mongodb = require('mongodb')
const dotenv = require('dotenv')
dotenv.config()

// CONNECTION STRING from env -- you need to config
mongodb.connect(process.env.CONNECTIONSTRING, {useNewUrlParser: true, useUnifiedTopology: true}, (err, client)=>{
    //  export database
    module.exports = client.db()
    const app = require('./app')
    app.listen(process.env.PORT)

})