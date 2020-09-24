const postsCollections = require('../db').db().collection('posts')
// ObjectID will convert any field to be id for that document in mongodb
const ObjectID = require('mongodb').ObjectID

const User = require('./User')
const { post } = require('../router')

const sanitizeHTML = require("sanitize-html")

let Post = function(data, userid, requestedPostId){
    this.userid = userid
    this.data = data
    this.errors = []
    this.requestedPostId = requestedPostId
}
Post.prototype.clean = function(){
    if (typeof(this.data.title) != "string"){this.data.title = ""}
    if (typeof(this.data.body) != "string"){this.data.body = ""}

    // get rid of any bogus property coming from template and/or add new properties.
    this.data = {
        title: sanitizeHTML(this.data.title.trim(), {allowedtags: {}, allowedAttributes: {} }),
        body: sanitizeHTML(this.data.body.trim(), {allowedtags: {}, allowedAttributes: {} }),
        
        // id of the object
        author: ObjectID(this.userid),
        createdDate: new Date()
    }
}

Post.prototype.validate = function(){
    if(this.data.title == ""){this.errors.push("You must provide title.")}
    if(this.data.body == ""){this.errors.push("You must provide post content.")}
    
}

Post.prototype.create = function(req, res){
    return new Promise((resolve, reject)=>{
        this.clean()
        this.validate()
        if (!this.errors.length){
            postsCollections.insertOne(this.data).then((info)=>{
                 // if post have been saved successfully.
                 // info.ops[0] is the post that just got created in mongobd
                 resolve(info.ops[0]._id)
             }).catch(()=>{
                 this.errors.push("Please try again. There must be a network problem.")
                 reject(this.errors)
             })
         

        } else {
            reject(this.errors)
        }

    })

}

Post.prototype.update = function(){
    return new Promise(async (resolve, reject)=>{
 
        // findSingleById finds the post by user id and  checks for ownership using isVisitorOwner variable as well
        try {
            console.log(this.userid)
            let post = await Post.findSingleById(this.requestedPostId, this.userid)
            if(post.isVisitorOwner){
                // actuallyupdate and resolve promise
              let status =   await this.finalizeUpdate()
              resolve(status)

            }else{
                // reject promise because of ownership of post
                reject()
            }
        } catch {
          
            // if there is not post with requestPostId findSingleID will reject
            reject()

        }


    })

}

Post.prototype.finalizeUpdate = function(){
    return new Promise(async (resolve, reject)=>{
        this.clean()
        this.validate()
        
        
        if(!this.errors.length){
            // update in databse now 
            await postsCollections.findOneAndUpdate({_id: new ObjectID(this.requestedPostId)}, {$set: {title: this.data.title, body: this.data.body }} )
            resolve("success")
        } else{
            
            // errors in input fields
            resolve("failure")
        }
    })
}

Post.postQueries = function (uniqueOperation, visitorId){
    return new Promise( async (resolve, reject)=>{
        // concat common queries for fetch one post or multiple post
        let aggOperation = uniqueOperation.concat([
            {$lookup: {from: "users", localField:"author", foreignField: "_id", as: "authorDocument"}},
            {$project: {
                // project let you choose which field to return as a result
                title: 1,
                body: 1,
                createdDate: 1,
                // author should be a object will its name,avatar  and other values
                // authorDocument is a field being return as result of lookup and it return an array
                // this following statement says return the element at 0 index as result of lookup and 
                // assign it to author
                // authorId will fetch author from mongodb
                authorId: "$author",
                author:{ $arrayElemAt: ["$authorDocument", 0] }
            }}
        ])
     
        // looking up authors and its post 
        let posts = await postsCollections.aggregate(aggOperation).toArray()

        // clean up author property on each post object 
        posts = posts.map(function(post){
            // checks if visitorId is equals authorId from mongo db
            post.isVisitorOwner = post.authorId.equals(visitorId)
            post.author = {
                username: post.author.username,
                avatar: new User(post.author, true).avatar
            }
            return post
        })
        resolve(posts)
    })
}

Post.findSingleById = function(postId, visitorId){
    return new Promise( async (resolve, reject)=>{
        // ObjectID will check if given id is valid mongodb id -- since mongodb id have certain length and pattern 
        if (typeof(postId) != "string" || !ObjectID.isValid(postId)){

            reject()
            return
        }
        // looking up authors and its post 
        let posts = await Post.postQueries([{ $match: { _id: new ObjectID(postId) }}], visitorId)
        
        if (posts.length){
            resolve(posts[0])
        }else{
            
            reject()

        }
    })

}


Post.findByAuthorId = function(authorId){
    return Post.postQueries([
        {$match: {author: authorId} }, 
        {$sort: {createdDate: -1} }
        
    ])}

Post.delete = function(postIDtoDelete, currentUserID){
    return new Promise( async (resolve, reject)=>{
        try{
            let post = await Post.findSingleById(postIDtoDelete, currentUserID)
            if (post.isVisitorOwner){
                await postsCollections.deleteOne({_id: new ObjectID(postIDtoDelete)})
                resolve()

            }else{
                // if current user is not owner of post
                reject()
            }

        }catch{
           
            // this will reject when post id not valid or doesnt exists
            reject()

        }
    })
}

Post.search = function(searchTerm){
    return new Promise(async(resolve, reject)=>{

        // make sure seachTerm is string type
        if (typeof(searchTerm) == "string"){
            let posts = await Post.postQueries([
                {$match : {$text: {$search: searchTerm}}},
                {$sort: {sort: {$meta: "textScore"}}}

            ])
            resolve(posts)

        } else {
            reject()
        }


    })
}

module.exports = Post