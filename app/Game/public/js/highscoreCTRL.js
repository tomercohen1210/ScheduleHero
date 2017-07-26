/**
 * Created by Tomer.Cohen on 6/26/2017.
 */
(function () {

    var app = angular.module("GameApp");

    var highscoreCTRL = function($scope,$http,$location,$rootScope) {

        $scope.init = function () {

        getScores();

        };


        var getScores=function () {

            var url='/highScores?event=Eilat.json';

            $http.get(url).then(function (data) {
                $scope.scores=data.data;
                $scope.scores.sort(compare);

            })

        };


        function compare(a,b) {
            if (a.score > b.score)
                return -1;
            if (a.score < b.score)
                return 1;
            return 0;
        }


    };
    app.controller("highscoreCTRL", highscoreCTRL);

}());