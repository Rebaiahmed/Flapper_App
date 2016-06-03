var express = require('express');
var router = express.Router();
var models = require('../models/index');

var Post = models.Post ;
var Comment = models.Comment ;


/* GET home page. */
router.get('/', function(req, res, next) {
  res.sendFile('./public/index.html',{})
});



router.get('/posts', function(req,res,next){

  Post.findAndCountAll({include :[
    {model :Comment},



  ]}).then(function(result){
    res.json(result.rows);
  })




})


/*
add a  new Post
 */

router.post('/posts', function(req,res){
  //get the data
  var title= req.body.title
  var link = req.body.link ;
  var upvotes = req.body.upvotes ;

Post.create({
  'title':title,
  'link':link,
  'upvotes':upvotes
}).then(function(post){

  res.json(post);
}).catch(function(err){
  throw  err;
})

})








/*
upvote a pots
*/

router.put('/posts/:idPost', function(req,res){
  //get the data

  var idPost= req.params.idPost ;

  var upvotes = req.body.upvotes ;

  //increment the upvotes
  upvotes+= 1

  Post.findById(idPost).then(function(post){
    if(!post){
      res.jsonp('error')
    }
    else{


      Post.update({
        'upvotes':upvotes
      }, {
        where: {
          'idPost': idPost
        }
      }).then(function (post) {
            res.json(post);
          })//





    }
  })




})



/*
view Comments for a post
 */




router.get('/post/:idPost', function(req,res){
  //get the data

  var idPost= req.params.idPost ;
  console.log('the id params is ' +idPost );

Post.findById(idPost,{
  include :[
    {model :Comment},



  ]

}).then(function(result){

  res.jsonp(result);

})




})



/*
 add a  new Comment
 */

router.post('/comments/:idPost', function(req,res){
  //get the data
  var body= req.body.body

  var Post_idPost = req.params.idPost ;

  Comment.create({
    'body':body,
    'author':'user',

    'Post_idPost':Post_idPost
  }).then(function(comment){

    res.json(comment);
  }).catch(function(err){
    throw  err;
  })

})




/*
upvotes a comment
 */

router.put('/comments/:idComment', function(req,res){
  //get the data

  var idComment= req.params.idComment;

  var upvotes = req.body.upvotes ;
  upvotes+=1;


  Comment.findById(idComment).then(function(post){
    if(!post){
      res.jsonp('error')
    }
    else{


      Comment.update({
        'upvotes':upvotes
      }, {
        where: {
          'idComment': idComment
        }
      }).then(function (post) {
        res.json(post);
      })





    }
  })


})

module.exports = router;
