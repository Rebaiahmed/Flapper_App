var express = require('express');
var passport = require('passport');
var router = express.Router();
var models = require('../models/index');

var Post = models.Post ;
var Comment = models.Comment ;
var User = models.User ;




/*
declare the jwt
 */
var jwt = require('express-jwt');


var auth = jwt({secret :'secret_User',userProperty: 'payload'});














/* GET home page. */
router.get('/', function(req, res, next) {
  res.sendFile('./public/index.html',{})
});



router.get('/posts',auth, function(req,res,next){

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

router.put('/posts/:idPost', auth,function(req,res){
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

router.post('/comments/:idPost',auth, function(req,res){
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
   res.json(err)
  })

})




/*
upvotes a comment
 */

router.put('/comments/:idComment',auth, function(req,res){
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

/*
router for register
 */



router.post('/register', function(req,res){

var username = req.body.username ;
  var password = req.body.password ;
var email = req.body.email ;



  // we must check if email exsit

  User.findOne({where :{email :email}}).then(function(user){

    if(user){
      console.log('user found !');
      res.json({"err_create":"CREATE_ALREADY_HAVE_ACCOUNT"});
    }
    else{





      var user = User.build({username:username, email :email})


      user.setPassword(password);
      user.save().
          then(function(){
            var token ;
            token = user.generateJwt();



            res.status(200).json(token);

          }).catch(function(err){
            res.json('err' +err);
          })





    }


  })


})







/*

 */

router.post('/login', function(req, res, next){


// we must chekc user !

var email = req.body.email ;
  var password = req.body.password ;
  var user ={'email' :email,'password':password}




  passport.authenticate('local', function(err,user, info){


    if(user){
      return res.json({token: user.generateJwt()});
    } else {
      return res.status(401).json(info);
    }
  })(req, res, next);
});






module.exports = router;
