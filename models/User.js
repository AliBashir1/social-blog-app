// import 
const validators = require('validator')
const bcrypt = require('bcryptjs')
// importing users collection from mongodb
const userCollection = require('../db').db().collection('users')

// gvatar md5 
const md5 = require('md5')

// import gvatar 


// Constructor function 
let User = function(data, getAvatar){
    this.data = data
    this.errors = []
    if (getAvatar == undefined){getAvatar = false}
    if (getAvatar == true){this.getAvatar()}
}

// registration cleaning
User.prototype.cleanUp = function () {

    if (typeof(this.data.username ) != "string" ){this.data.username=""}
    if (typeof(this.data.email ) != "string"){this.data.email=""}
    if (typeof(this.data.password ) != "string"){this.data.password=""}


    this.data = {
        username: this.data.username.trim().toLowerCase(),
        email: this.data.email.trim().toLowerCase(),
        password: this.data.password
    }

}

// registration validator 
// this validate function is async -- because of mongodob findOne method 
User.prototype.validate =  function () {
    return new Promise(async (resolve, reject) => {

   
        // username
        if (this.data.username == ""){this.errors.push("You must provide username.")}
        if (this.data.username.length > 0 && this.data.username.length < 3){this.errors.push("Username must be 3 characters long.")}
        if (this.data.username != "" && !validators.isAlphanumeric(this.data.username)) {this.errors.push("Username can only be alphabets and letters.")}
        if (this.data.username.length > 30 ){this.errors.push("Username cannot exceed 30 characters.")}
        
        // email
        if (!validators.isEmail(this.data.email)) {this.errors.push("Email is not valid.")}
        
        // password
        if (this.data.password == ""){this.errors.push("You must provide password.")}
        if (this.data.password.length > 0 && this.data.password.length < 12){this.errors.push("Password must be 12 characters long.")}
        if (this.data.username.length > 100 ){this.errors.push("Username cannot exceed 100 characters.")}
        
        // check if username is unique
        if (this.data.username.length > 2 && this.data.username.length < 31 && validators.isAlphanumeric(this.data.username)){
            /* mongodb userCollection returns a promise either reject as null or resolve with username value.
             since this method will take time to find username we have to make sure that method execute first before heading to next line which depends on it.
    
    
             */
            
            let usernameExists =  await userCollection.findOne({username: this.data.username})
            if (usernameExists) {this.errors.push("That username is already taken.")}
        }
        
        // check if email is unique
        if ( validators.isEmail(this.data.email)){
     
            let emailExists =  await userCollection.findOne({email: this.data.email})
            if (emailExists) {this.errors.push("That email is already exists.")}

        }
        resolve()
    }) // end of promise 
}

// registration 
User.prototype.register =  function(){
    return new Promise(async (resolve, reject)=>{
        // 1. validate data
        this.cleanUp()
        // since validate is asncy you need to make sure this execute firsts 
        await this.validate()
        // 2. if no error save data into database
        if (!this.errors.length){
    
            // hash user password
            let salt = bcrypt.genSaltSync(10)
            this.data.password = bcrypt.hashSync(this.data.password, salt)
            // save into database
            await userCollection.insertOne(this.data)
              // populate avatar (this will set avatar value in memory instead of saving into database)
            this.getAvatar()
            resolve()
        } else {
            reject(this.errors)
        }
    
    }) // end of promise
}
/**
 * 
 * 
 *
 */
// login
User.prototype.login = function(){
    // returns a promise 
    return new Promise((resolve, reject)=>{
        // check for values 
        this.cleanUp()
        /**
         * Majority of the mongoDB returns a promise. you can use then and catch here 
        * .then() if promise is resolve  -- define a function for what to do if promise resolved
        * .catch() if promise is reject  -- define a function if promise reject
         */
        userCollection.findOne({username: this.data.username}).then((attemptedUser)=>{ 

            // bcrypt.compareSync will compare password and
            // attemptedUser is the user which itll find in database
            if (attemptedUser && bcrypt.compareSync(this.data.password, attemptedUser.password)){
                // since logging in session dont have access to user email -
                this.data = attemptedUser
                // populate avatar 
    
                this.getAvatar()
                resolve("Congrats!")

            } else {
                reject("Invalid username / password")
            }
            // handle database error 
        }).catch((err)=>{
            reject("Please try again") 

        })

    })

}


User.prototype.getAvatar = function (){
    this.avatar = `https://gravatar.com/avatar/${md5(this.data.email)}?s=128`
}


User.findByUsername = function(username){
    return new Promise((resolve, reject)=>{
        if (typeof(username) != "string"){
            reject() 
            return
        }
        // find matching user document using given username and clean up userDoc 
        // its better to cleanup user doc you dont want extra information going out of User model
        userCollection.findOne({username: username}).then((userDoc)=>{
        // clean up 
        if (userDoc){
            userDoc = new User(userDoc, true)
            userDoc = {
                _id: userDoc.data._id,
                username: userDoc.data.username,
                avatar: userDoc.avatar
            }
            resolve(userDoc)
        }else{
            reject()
        }

        }).catch((e)=>{
            // error is technical error from mongodb - it has nothing to do with user not found --
            console.log(e)
            reject() 
        })

    })

}

module.exports = User