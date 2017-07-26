/**
 * Created by Tomer.Cohen on 7/12/2017.
 */
(function () {

    var app = angular.module("GameApp");

    var eventCTRL = function ($scope, $http, $q,$location,$route,$rootScope,$timeout){

        $scope.init=function () {

            var url='/getEvents';

            $http.get(url).then(function (data) {
                $scope.events=[];
                angular.forEach(data.data, function(value) {
                    var lastIndex = value.lastIndexOf('.');
                    $scope.events.push(value.substr(0,lastIndex));
                })
            });

        }


        $scope.submit=function () {
            if($scope.selectedevent!=undefined) {
                document.cookie = 'event=' + $scope.selectedevent + ";expires=" + new Date().getTime() + 24 * 60 * 1000;
                $location.path("/");
            }
            else{
                document.cookie = 'event=None event;expires=' + new Date().getTime() + 24 * 60 * 1000;
                $location.path("/");
            }

        };

        $scope.submitnew=function () {


            var url='/create?event='+$scope.newevent;

            $http.post(url).then(function (res) {
                if(res.data=='fail'){
document.getElementById('err').innerHTML='Event already exists'
                }
                    else{
                    document.cookie='event='+$scope.newevent+";expires="+new Date().getTime()+3*60*1000;
                    $location.path("/");
                }

            });

        }
    };

    app.controller("eventCTRL", eventCTRL);


}());

