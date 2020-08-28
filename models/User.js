// import 
const validators = require('validator')
// importing users collection from mongodb
const userCollection = require('../db').collection('users')

// Constructor function 
let User = function(data){
    this.data = data
    this.errors = []
}
// registration cleaning
User.prototype.cleanUp = function () {

    console.log(this.data)
    if (typeof(this.data.username ) != "string" ){this.data.username=""}
    if (typeof(this.data.email ) != "string"){this.data.email=""}
    if (typeof(this.data.password ) != "string"){this.data.password=""}


    this.data = {
        username: this.data.username.trim().toLowerCase(),
        email: this.data.email.trim().toLowerCase(),
        password: this.data.password
    }
    console.log(this.data)
}

// registration validator
User.prototype.validate = function(){

    console.log(this.data.username.length)
   
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
        // save into database
        userCollection.insertOne(this.data)
    }
    

}   
// login
User.prototype.login = function(callback){
    // check for values 
    this.cleanUp()

    userCollection.findOne({username: this.data.username}, (err, attemptedUser)=>{
        // attemptedUser will have the user if it exits in database
        if (attemptedUser && attemptedUser.password == this.data.password){
            callback("Congrats!")

        } else {
            callback("Invalid username / password")
        }
    })


}
module.exports = User