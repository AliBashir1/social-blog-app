import axios from 'axios'

export default class RegistrationFrom{

    constructor(){

        this.form = document.querySelector('#registration-form')
        // get all the fields inside id #registration-form
        this.allFields = document.querySelectorAll("#registration-form .form-control")
        this.insertValidationElements()
        this.username = document.querySelector("#username-register")
        this.username.previousValue = ""
        this.email = document.querySelector("#email-register")
        this.email.previousValue = ""
        
        this.password = document.querySelector("#password-register")
        this.password.previousValue = "" 
        this.username.isUnique = false
        this.email.isUnique = false      
        this.events()

    }

    // events

    events(){
        this.form.addEventListener("submit", (e)=>{
            e.preventDefault()
            this.formSubmitHandler()

        })
        this.username.addEventListener("keyup", ()=>{
            this.isDifferent(this.username, this.usernameHandler)
        })

        this.email.addEventListener("keyup", ()=>{
            this.isDifferent(this.email, this.emailHandler)
        })

        this.password.addEventListener("keyup", ()=>{
            this.isDifferent(this.password, this.passwordHandler)
        })

        this.username.addEventListener("blur", ()=>{
            this.isDifferent(this.username, this.usernameHandler)
        })

        this.email.addEventListener("blur", ()=>{
            this.isDifferent(this.email, this.emailHandler)
        })

        this.password.addEventListener("blur", ()=>{
            this.isDifferent(this.password, this.passwordHandler)
        })
    
    

    } 


    //methods
    // form hanlder()
    formSubmitHandler(){
        // check validation manually before submitting
        this.usernameImmediately()
        this.usernameAfterDelay()
        this.emailAfterDelay()
        this.passwordImmediately()
        this.passwordAfterDelay()

        if (
            this.username.isUnique &&
            !this.username.errors &&
            this.email.isUnique &&
            !this.email.errors &&
            !this.password.errors) 
                {
                    this.form.submit()
                                }
    }



    insertValidationElements(){
        this.allFields.forEach((el)=>{
            el.insertAdjacentHTML('afterend', '<div class="alert alert-danger small liveValidateMessage" ></div>')

        })
    }

    isDifferent(el, handler){
        if(el.previousValue != el.value){
            handler.call(this)
        } 
        el.previousValue = el.value
    
    }
    // username validations 
    usernameHandler(){
        this.username.errors = false
        this.usernameImmediately()
        clearTimeout(this.username.timer)
        this.username.timer = setTimeout(()=> this.usernameAfterDelay(), 750)
    }


    usernameImmediately(){
        // this method will for non alpha-numeric input like &^#@# 
        if (this.username.value != "" && !/^([a-zA-Z0-9]+)$/.test(this.username.value)){
            this.showValidationError(this.username, "Username can only contain numbers or alphabets.")
        }

        if (!this.username.errors){
            this.hideValidationError(this.username)
        }

        if (this.username.value.length > 30){
            this.showValidationError(this.username, "Username cannot exceed 30 characters.")
        }
    }

    usernameAfterDelay(){

        if (this.username.value.length < 3){
            this.showValidationError(this.username, "Username must be atleast 3 characters.")
        }

        // check if username exists already
        if (!this.username.errors){

            axios.post('/doesUsernameExists', {username: this.username.value}).then((response)=>{
                if(response.data == true){
                    // if username exists
                    this.showValidationError(this.username, "Username is already taken.")
                    this.username.isUnique = false

                }else{
                    this.username.isUnique = true
                }
            }).catch(()=>{
                console.log("plesse try again")
            })
        }
       

    }

    // email validations

    emailHandler(){
        this.email.errors = false
        clearTimeout(this.email.time)
        this.email.time = setTimeout(()=> this.emailAfterDelay(), 750)
    }

    emailAfterDelay(){
        if (!/^\S+@\S+$/.test(this.email.value)){
            this.showValidationError(this.email, "You must provide a valid email address.")

        }
        if (!this.email.errors){
            // check if email exits
            axios.post('/doesEmailExists', {email: this.email.value}).then((response)=>{
                console.log(response.data)
                // if email exists -- response.data is either true of false
                if(response.data){

                    this.email.isUnique = false
                    this.showValidationError(this.email, "This email is already in used.")
                }else{
                    // if email doesnt exists
                    this.email.unique = true
                    this.hideValidationError(this.email)

                }
            }).catch(()=>{
                console.log("errors")
            })
        }

    }

    // password validations
    passwordHandler(){
        this.password.errors = false
        this.passwordImmediately()
        clearTimeout(this.password.timer)
        this.password.timer = setTimeout(()=> this.passwordAfterDelay(), 750)

    }
    // check password as user type in
    passwordImmediately(){
        if (this.password.value.length > 50){
            this.showValidationError(this.password , "Password cannot exceed 50 characters.")
        }
        if (!this.password.errors){
            this.hideValidationError(this.password)
        }
    }

    passwordAfterDelay(){
        if(this.password.value.length < 12){
            this.showValidationError(this.password , "Password must be at least 12 characters.")
        }
    }

    showValidationError(el, message){
        // insertValidationElements is next element (added earlier)
        el.nextElementSibling.innerHTML = message
        el.nextElementSibling.classList.add("liveValidateMessage--visible")
        el.errors = true

    }

    hideValidationError(el){
        el.nextElementSibling.classList.remove("liveValidateMessage--visible")

    }


}