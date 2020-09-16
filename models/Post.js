const postsCollections = require('../db').db().collection('posts')
// ObjectID will convert any field to be id for that document in mongodb
const ObjectID = require('mongodb').ObjectID

const User = require('./User')


let Post = function(data, userid){
    this.userid = userid
    this.data = data
    this.errors = []
}
Post.prototype.clean = function(){
    if (typeof(this.data.title) != "string"){this.data.title = ""}
    if (typeof(this.data.body) != "string"){this.data.body = ""}

    // get rid of any bogus property coming from template and/or add new properties.
    this.data = {
        title: this.data.title.trim(),
        body: this.data.body.trim(),
        // id of the object
        author: ObjectID(this.userid),
        createdDate: new Date()
    }
}

Post.prototype.validate = function(){
    if(this.data.title == ""){this.errors.push("You must provide title.")}
    if(this.data.body == ""){this.errors.push("You must provide post content.")}
    
}

Post.prototype.create = function(){
    return new Promise(  (resolve, reject)=>{
        this.clean()
        this.validate()
        if (!this.errors.length){
             postsCollections.insertOne(this.data).then(()=>{
                 // if post have been saved successfully.
                 resolve()
             }).catch(()=>{
                 this.errors.push("Please try again. There must be a network problem.")
                 reject(this.errors)
             })
            resolve()

        } else {
            reject(this.errors)
        }

    })

}

Post.postQueries = function (uniqueOperation){
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
                //
                author:{ $arrayElemAt: ["$authorDocument", 0] }
            }}
        ])
     
        // looking up authors and its post 
        let posts = await postsCollections.aggregate(aggOperation).toArray()

        // clean up author property on each post object 
        posts = posts.map(function(post){
            post.author = {
                username: post.author.username,
                avatar: new User(post.author, true).avatar
            }
            return post
        })
        resolve(posts)
    })
}

Post.findSingleById = function(id){
    return new Promise( async (resolve, reject)=>{
        // ObjectID will check if given id is valid mongodb id -- since mongodb id have certain length and pattern 
        if (typeof(id) != "string" || !ObjectID.isValid(id)){
            reject()
            return
        }
        // looking up authors and its post 
        let posts = await Post.postQueries([
                { $match: {_id: new ObjectID(id) } }
            ])
        
        if (posts.length){
            console.log(posts[0])
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


module.exports = Post