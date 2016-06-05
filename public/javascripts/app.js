var app = angular.module('flapperNews',['ui.router','LocalStorageModule','angular-jwt']);



/*
config the app
 */


/*app.config(function (localStorageServiceProvider) {
    localStorageServiceProvider
        .setPrefix('flapperNews')
        .setStorageType('sessionStorage')
        .setNotify(true, true)
});*/

app.config(['$stateProvider',
    '$urlRouterProvider',function($stateProvider,$urlRouterProvider){


$stateProvider
    .state('home',{
        url :'/home',
        templateUrl :'/partials/home.html',
        controller:'MainCtrl',
        /*resolve: {
            app: function ($q, $rootScope, $location,auth) {
                var defer = $q.defer();



                if (angular.isUndefined(auth.currentUser())) {


                    $location.path('/login');

                    deferred.reject();
                }

                defer.resolve();
                return defer.promise;
            }
        }*/

    })

    .state('posts',{
        url:'/posts/{{id}}',
        templateUrl :'/partials/post.html',
        controller:'PostCtrl',
        /*resolve: {
            post: ['$stateParams', 'flapperService', function($stateParams,flapperService) {
                return flapperService.getPostById($stateParams.id);
            }],
            app: function ($q, $rootScope, $location,auth) {
                var defer = $q.defer();



                if (angular.isUndefined(auth.currentUser())) {


                    $location.path('/login');

                    deferred.reject();
                }

                defer.resolve();
                return defer.promise;
            }
        }*/
    })

    .state('login',{
        url:'/login',
        templateUrl :'/partials/login.html',
        controller:'authCtrl',
        resolve :['$state','auth', function(auth,$state){
             //check if user is loggedIN
             if(auth.isLoggedIn()){
                 $state.go('home')
             }
         }

         ]


    })

    .state('Register',{
        url:'/Register',
        templateUrl :'/partials/register.html',
        controller:'authCtrl',
        resolve :['$state','auth', function(auth,$state){
            //check if user is loggedIN
            if(auth.isLoggedIn()){
                $state.go('home')
            }

        }

        ]
    })


        $urlRouterProvider.otherwise('home');



    }])












/*
define the factory
 */

app.service('flapperService',['$http','auth',function($http,auth){




    this.posts =[];



    this.getAllPosts = function(){

        var token = auth.getToken();
        return $http.get('/posts',{headers: {'Authorization': 'Bearer '+token} }
        ).success(function(data){

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
        return $http.put('/posts/' + post.idPost, post,{
            headers: {Authorization: 'Bearer '+auth.getToken()}})


    }




    /*

     */

    this.getPostById = function(id){

        return $http.get('/post/'+ id,{
            headers: {Authorization: 'Bearer '+auth.getToken()}}).then(function(res){
            return res.data ;
        })
    }




    this.addComment = function(comment, id){
        return $http.post('/comments/'+id ,comment,{
            headers: {Authorization: 'Bearer '+auth.getToken()}})
    }

    this.incrementUpvotes = function(comment,id){



        return $http.put('/comments/'+id, comment,{
            headers: {Authorization: 'Bearer '+auth.getToken()}} );

    }







}])

/*
our service for authentication
 */


app.factory('auth',['$http','jwtHelper','$window', function($http,jwtHelper,$window){

var auth ={};

    /*
    define the service for authentication
     */


/*
save the token
 */

    auth.saveToken = function(token){


        $window.localStorage['flapper-news-token'] = angular.toJson(token);

        console.log('after saving it ' + $window.localStorage['flapper-news-token']);

    }

    /*
    return the token
     */

    auth.getToken = function(){

        return $window.localStorage['flapper-news-token'];

    }

    /*
    check if user is loggedIN
     */

    auth.isLoggedIn = function(){

        var token = auth.getToken() ;






        if(token){
           var payload = jwtHelper.decodeToken(token)// decode the token

            return (payload.exp > Date.now() /1000) ;  // check  if session is expired

        }else{
            return false ;
        }


    }


    /*
    the currentUser
     */

    auth.currentUser = function(){


      if(auth.isLoggedIn()){
            //get the token
            var token = auth.getToken() ;

          var payload = jwtHelper.decodeToken(token);



            return payload.username ;
        }

    }




    /*
    register method
     */
    auth.register = function(user){
        return $http.post('/register', user).success(function(data){
            //if success save the data
            var obj = {"err_create": "CREATE_ALREADY_HAVE_ACCOUNT"};

            if(JSON.stringify(data) === JSON.stringify(obj))
            {
                console.log('data exist');
            }
            else {
                auth.saveToken(data);
            }

        })
    }


    /*
    login method
     */

    auth.login = function(user){
        return $http.post('/login', user).success(function(data){
            //if success save the data
            auth.saveToken(data);
        })
    }



    /*
    logout function
     */

    auth.logout = function(){

        $window.localStorage.removeItem('flapper-news-token');

    }

    return auth ;



}])





/*
define the controller for authentication
 */



app.controller('authCtrl',['$scope','auth','$state',function($scope,auth,$state){

$scope.user ={};
    $scope.error ;

    $scope.errorEmail = false ;

    /*
    define the register method
     */

    $scope.register = function(){
        auth.register($scope.user).error(function(err){
            $scope.error = err;
        }).then(function(data){


            var obj = {"err_create": "CREATE_ALREADY_HAVE_ACCOUNT"};


            if (JSON.stringify(data.data) === JSON.stringify(obj)) {

                $scope.errorEmail = true;
            }
            else{
                $state.go('home');
            }

        })
    }


    /*
    define the login method
     */

    $scope.login = function(){
        auth.login($scope.user).error(function(err){
            $scope.error = err;
        }).then(function(){
            $state.go('home');
        })
    }




}])




/*
navigationController
 */


app.controller('NavCtrl',['$scope','auth','$window','$location',function($scope,auth,$window,$location){


    //auth.logout();


    $scope.isloggedin = auth.isLoggedIn;

    $scope.currentUser = auth.currentUser;

    $scope.logOut = function(){
        auth.logout();
        $window.location.reload();
        $location.path('login');
    }



}])



/*
define our first controller
 */

app.controller('MainCtrl',['$scope','$http','flapperService','auth',function($scope,$http,flapperService,auth){


    //test $scope
    $scope.isloggedin = auth.isLoggedIn;


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

app.controller('PostCtrl',['$scope','$stateParams','flapperService','auth',function($scope,$stateParams,flapperService,auth){

    $scope.post ={};

    $scope.isloggedin = auth.isLoggedIn;
    $scope.newComment ={};


 getPost = function(){


 flapperService.getPostById($stateParams.id).then(function(data){

     $scope.post = data;
  })

 }

    getPost();


    $scope.addComment = function(comment,id) {

        flapperService.addComment(comment,id).then(function(data){


            $scope.post.Comments.push(data.data);
            $scope.newComment.body = '';

        }, function(err){
            console.log('er' + err);
        })


    }



    /*
    vote to comment
     */

    $scope.incrementUpvotes = function(comment,idPost){


        flapperService.incrementUpvotes(comment,idPost).then(function(data){
            comment.upvotes+=1;

        })
    }






}])