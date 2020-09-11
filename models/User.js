// import 
const validators = require('validator')
const bcrypt = require('bcryptjs')
// importing users collection from mongodb
const userCollection = require('../db').db().collection('users')

// Constructor function 
let User = function(data){
    this.data = data
    this.errors = []
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
User.prototype.validate = function(){

   
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

}

// registration 
User.prototype.register = function(){
    // 1. validate data
    this.cleanUp()
    this.validate()
    // 2. if no error save data into database
    if (!this.errors.length){

        // hash user password
        let salt = bcrypt.genSaltSync(10)
        this.data.password = bcrypt.hashSync(this.data.password, salt)
        // save into database
        userCollection.insertOne(this.data)
    }

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
                resolve("Congrats!")

            } else {
                reject("Invalid username / password")
            }
            // handle databse error 
        }).catch((err)=>{
            console.log(this.data.username)
            console.log(this.data.password)
            reject("Please try again") 

        })

    })

}

module.exports = User