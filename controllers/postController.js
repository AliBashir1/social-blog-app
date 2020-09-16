const Post = require('../models/Post')

exports.viewCreateScreen = function (req, res){
    res.render('create-post')
}

exports.create = function(req, res){
    let post = new Post(req.body, req.session.user._id)

    post.create().then(()=>{
        // this block will run if post is saved succesfully
        res.send("new post created")

    }).catch((errors)=>{
        // this block will run if there is any error
        res.send(errors)

    })

}

exports.viewSingle = async function(req, res){
    try{
        let post = await Post.findSingleById(req.params.id)
        res.render('single-post-screen', {post: post})
    } catch (e){
        console.log(e)
        res.render('404')

    }
}