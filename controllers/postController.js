const Post = require('../models/Post')

exports.viewCreateScreen = function (req, res){
    res.render('create-post')
}

exports.create = function(req, res){
    let post = new Post(req.body, req.session.user._id)

    post.create().then(function(id){
        // this block will run if post is saved succesfully
        req.flash("success", "Post Created")
        // if you want to user to redirect to profile with new post
        // req.session.save(()=> res.redirect(`/profile/${req.session.user.username}`))
        // if you want user to redirect to post single view page -- for that you need id 

        req.session.save(()=> res.redirect(`/post/${id}/`))


    }).catch(function(errors){
        // this block will run if there is any error
        errors.forEach(error => req.flash("errors", error))
        req.session.save(()=> res.redirect("create-post"))

    })

}

exports.viewSingle = async function(req, res){
    try{
        let post = await Post.findSingleById(req.params.id, req.visitorId)
        res.render('single-post-screen', {post: post})
    } catch (e){
        console.log(e)
        res.render('404')

    }
}

exports.viewEditScreen = async (req, res)=>{
    
    try{
        let post = await Post.findSingleById(req.params.id, req.visitorId)
        //checks if visitorID is author of th post
        if(post.isVisitorOwner){
            res.render('edit-post', {post: post})
        }else{
            req.flash("errors", "You dont have permission to perform this action.")
            req.session.save(()=> res.redirect('/'))
        }

    }catch{
        res.render('404')
    }

}

exports.edit = (req, res)=>{
    // we need following for verification 
    // visitorId is set up in app.js 
    // req.params.id coming from url
    let post = new Post(req.body, req.visitorId, req.params.id)
    

    post.update().then((status)=>{
        // post successfully updated then redirect to edit page again with success message

        if (status == "success"){
          
            req.flash("success", "Post successfully edited")
            req.session.save(()=>{
                res.redirect(`/post/${req.params.id}/edit`)
            })
        } else{
       
            // validation errors on post while editing
            req.errors.forEach((error)=>{
                req.flash("errors", error)
            })

            req.session.save(()=>{
                res.redirect(`/post/${req.params.id}/edit`)
            })
        }

        // user is owner but there is validations errors

    }).catch(()=>{
        // user is not owner of post
        req.flash("errors", "You don't have permission to perform this action.")
        req.session.save(()=>{
            res.redirect('/')
        })
    })

}

exports.delete = function(req, res){

    // pass the post id that needed to be delete and id of the user who is trying to delete
    Post.delete(req.params.id, req.visitorId).then(()=>{
        req.flash("success", "Post has been deleted succesfully!" )
        // redirect to user profile once post deleted
        req.session.save( ()=> res.redirect(`/profile/${req.session.user.username}`))

    }).catch(()=> {
        req.flash("errors", "You don't have persmission to perform this action.")
        req.session.save(()=> res.redirect("/"))

    })

}


exports.search = function(req, res){
    // returns results posts if search from Post constructor is resolve or empty list if search rejected()
    Post.search(req.body.searchTerm).then(posts => {
        res.json(posts)
    }).catch(()=> res.json([]))
}