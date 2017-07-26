/**
 * Created by Tomer.Cohen on 4/6/2017.
 */
(function () {
    var app = angular.module("GameApp",["ngRoute"]);

    app.config(function ($routeProvider) {
            $routeProvider
                .when("/",{
                    templateUrl:"Html/welcome.html",
                    controller:"welcomeCTRL"
                })
                .when("/w6game",{
                   templateUrl:"Html/w6game.html",
                   controller: "GameCTRL"
               })
               .when("/result",{
                   templateUrl:"Html/Result.html",
                   controller: "ResultCTRL",
               })
                .when("/highscore",{
                templateUrl:"Html/highScore.html",
                controller: "highscoreCTRL",
            })
                .when("/event",{
                    templateUrl:"Html/event.html",
                    controller: "eventCTRL",

                })
                .otherwise({redirectTo:"/w6game"})
    });
}());