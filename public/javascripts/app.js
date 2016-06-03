var app = angular.module('flapperNews',['ui.router']);



/*
config the app
 */

app.config(['$stateProvider',
    '$urlRouterProvider',function($stateProvider,$urlRouterProvider){


$stateProvider
    .state('home',{
        url :'/home',
        templateUrl :'/partials/home.html',
        controller:'MainCtrl',
        resolve: {
            postPromise: ['flapperService', function(flapperService){
                return flapperService.getAllPosts();
            }]
        }

    })

    .state('posts',{
        url:'/posts/{{id}}',
        templateUrl :'/partials/post.html',
        controller:'PostCtrl',
        resolve: {
            post: ['$stateParams', 'flapperService', function($stateParams,flapperService) {
                return flapperService.getPostById($stateParams.id);
            }]
        }
    })


        $urlRouterProvider.otherwise('home');



    }])












/*
define the factory
 */

app.service('flapperService',['$http',function($http){




    this.posts =[];



    this.getAllPosts = function(){

        return $http.get('/posts').success(function(data){

            angular.copy(data, this.posts);
        }, function(err){
            console.log('err' + err);
        })
    }

    /*
    Creat a new Post
     */

    this.createPost =  function(post){
        return $http.post('/posts', post)
    }



    /*
    upvate  a post
     */

    this.upvatePost = function(post) {
        return $http.put('/posts/' + post.idPost, post)


    }
    /*

     */

    this.getPostById = function(id){

        return $http.get('/post/'+ id).then(function(res){
            return res.data ;
        })
    }




    this.addComment = function(comment, id){
        return $http.post('/comments/'+id ,comment)
    }







}])





/*
define our first controller
 */

app.controller('MainCtrl',['$scope','$http','flapperService',function($scope,$http,flapperService){


    //test $scope



    flapperService.getAllPosts().then(function (data) {

        $scope.posts = data.data;
    })




    /*
    addPOst
     */
    $scope.post = {};

    $scope.addPost = function(post){
        flapperService.createPost(post).success(function(data){

            $scope.posts.push(data);
        }, function(err){
            console.log('err' + err);
        })

        $scope.post ={};
    }


    /*
    define function to increment upvotes
     */
    $scope.incrementUpvotes = function(post)
    {



        flapperService.upvatePost(post).then(function(){
            post.upvotes += 1;

        }, function(err){

        })

    }


}])





/*
 define our second controller
 */

app.controller('PostCtrl',['$scope','$stateParams','flapperService',function($scope,$stateParams,flapperService){

    $scope.post ={};


    $scope.newComment ={};


 getPost = function(){


     console.log('params' + $stateParams.id)

 flapperService.getPostById($stateParams.id).then(function(data){

     $scope.post = data;
  })

 }

    getPost();


    $scope.addComment = function(comment,id) {

        flapperService.addComment(comment,id).then(function(data){

            console.log('data' + JSON.stringify(data.data));
            $scope.post.Comments.push(data.data);
            $scope.newComment.body = '';

        }, function(err){
            console.log('er' + err);
        })


    }



}])