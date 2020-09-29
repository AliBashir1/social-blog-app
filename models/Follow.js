const { ObjectID } = require('mongodb').ObjectID

const userCollections = require('../db').db().collection('users')
const followCollections = require('../db').db().collection('follows')
const User = require('./User')

let Follow = function(followedUsername, authorId){
    // authorId is the one who is following 
    this.followedUsername = followedUsername
    this.authorId = authorId
    this.errors = []

}

Follow.prototype.cleanUp = function(){
    if (typeof(this.followedUsername) != "string"){ this.followedUsername = ""}

}


Follow.prototype.validate = async function(action){

    try {
        let followAccount = await userCollections.findOne({username: this.followedUsername})
        if(followAccount){

            this.followedId = followAccount._id

        }else{
            this.errors.push("Username doesnt exists")
        }
    } catch(databaseError){
        console.log(databaseError)
      
    }
    
    // checks if user already following each other 
    let doesFollowAlreadyExist = await followCollections.findOne({followedId: this.followedId, authorId: new ObjectID(this.authorId)})
    if (action == "create"){
        if(doesFollowAlreadyExist){
            this.errors.push("You are already following this user.")

        }
        
    }

    if (action == "delete"){
        if(!doesFollowAlreadyExist){
            this.errors.push("You cannot stop following someone you do not already follow.")

        }
        
    }

    // you cannot follow yourself

    if(this.followedId.equals(this.authorId)){this.errors.push("You cannot follow yourself.")}

    
}

Follow.prototype.create = function(){
    return new Promise(async (resolve, reject)=>{
        this.cleanUp()
        await this.validate("create")

        if(!this.errors.length){
            await followCollections.insertOne({followedId: this.followedId, authorId: new ObjectID(this.authorId)})
            resolve()
        }else{
           reject(this.errors)

        }

    })

}

Follow.prototype.delete = function(){
    return new Promise(async (resolve, reject)=>{
        this.cleanUp()
        await this.validate("delete")

        if(!this.errors.length){
            await followCollections.deleteOne({followedId: this.followedId, authorId: new ObjectID(this.authorId)})
            resolve()
        }else{
           reject(this.errors)

        }

    })

}



Follow.isVisitorFollowing = async function(followedId, visitorId){

    let followDoc = await followCollections.findOne({followedId: followedId, authorId: new ObjectID(visitorId)} )
    if (followDoc){
        return true
    } else {
        return false
    }
}


Follow.getFollowersById =  function(id){
    return new Promise( async (resolve, reject)=>{

        try{   
            // list of operations in aggregate
            let followers = await followCollections.aggregate([
                                    {$match: {followedId: id}},
                                    // fetch document as userDoc from users collections with mataching authorId == _id
                                    {$lookup: {from: "users", localField: "authorId", foreignField: "_id", as: "userDoc"}},
                                    // fetch username and email
                                    {$project: {
                                        username: {$arrayElemAt: ["$userDoc.username", 0]},
                                        email: {$arrayElemAt: ["$userDoc.email", 0]}
                                        }
                                    }
                            ]).toArray()

            // clean up followers document 
            // use email to get avatar of user                                        
            followers = followers.map((follower)=>{
                let user = new User(follower, true)
                return{username: follower.username, avatar: user.avatar}


            })
            resolve(followers)

        }catch(databaseError){
            console.log(databaseError)
            reject()

        }
    })

}

Follow.getFollowingById =  function(id){
    return new Promise( async (resolve, reject)=>{

        try{   
            // list of operations in aggregate
            let followers = await followCollections.aggregate([
                                    {$match: {authorId: id}},
                                    // fetch document as userDoc from users collections with mataching authorId == _id
                                    {$lookup: {from: "users", localField: "followedId", foreignField: "_id", as: "userDoc"}},
                                    // fetch username and email
                                    {$project: {
                                        username: {$arrayElemAt: ["$userDoc.username", 0]},
                                        email: {$arrayElemAt: ["$userDoc.email", 0]}
                                        }
                                    }
                            ]).toArray()

            // clean up followers document 
            // use email to get avatar of user                                        
            followers = followers.map((follower)=>{
                let user = new User(follower, true)
                return{username: follower.username, avatar: user.avatar}


            })
            resolve(followers)

        }catch(databaseError){
            console.log(databaseError)
            reject()

        }
    })

}

Follow.countFollowersByAuthorId = function(id){
    return new Promise(async (resolve, reject)=>{
        try {

            let followersCount = await followCollections.countDocuments({followedId: id})
            resolve(followersCount)
        } catch{
            reject()
        }

    })

}
Follow.countFollowingByAuthorId = function(id){
    return new Promise(async (resolve, reject)=>{
        try {

            let followingCount = await followCollections.countDocuments({authorId: id})
            resolve(followingCount)
        } catch{
            reject()
        }

    })

}




module.exports = Follow