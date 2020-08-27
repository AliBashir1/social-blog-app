// Constructor function 
let User = function(data){
    this.data = data
    this.errors = []
}

User.prototype.validate = function(){
    if (this.data.username == ""){this.errors.push("You must provide username.")}
    if (this.data.email == ""){this.errors.push("You must provide email.")}
    if (this.data.password== ""){this.errors.push("You must provide password.")}
}

// registration 
User.prototype.register = function(){
    // 1. validate data
    this.validate()
    // 2. if no error save data into database
}

module.exports = User