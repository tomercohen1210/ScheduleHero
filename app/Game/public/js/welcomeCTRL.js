/**
 * Created by Tomer.Cohen on 4/24/2017.
 */
(function () {

    var app = angular.module("GameApp");

    var welcomeCTRL = function($scope,$http,$location,$rootScope) {

        $scope.init = function () {

            document.getElementsByTagName("BODY")[0].style.backgroundColor='#70B5E2';

            var head =document.getElementById("head").style.backgroundColor='#70B5E2';

            setInfo();
            $scope.selectedcountry=null;
            $scope.country=[];
           // setlanguage();
            $http.get('Json/Config.json').then(function (data) {

                $scope.country = data.data.Country;

            });
            getEvent();
        };

        $scope.start= function () {
            var ddl=document.getElementById("ddl");
            var ok=false;


            if(ddl.options[ddl.selectedIndex].innerHTML!="Country") {

                if(document.getElementById("event").innerHTML=='EVENT: None event'){
                   ok=true;
                }
                else if($scope.lastname!='LAST NAME' &&$scope.firstname!='FIRST NAME' &&$scope.lastname!='EMAIL' &&$scope.company!='COMPANY' && $scope.check==true ){
                    $http.post('/writeDetail?name=' + $scope.firstname + '&lastname=' + $scope.lastname + '&company=' + $scope.company + '&email=' + $scope.email + '&phone=' + $scope.phone + '&title=' + $scope.jobtitle);
                    document.cookie="firstname="+$scope.firstname + ";expires=" + new Date().getTime() +20 * 1000;
                    document.cookie="lastname="+$scope.lastname + ";expires=" + new Date().getTime() +20 * 1000;
                    document.cookie="company="+$scope.company + ";expires=" + new Date().getTime() + 20* 1000;
                    console.log(document.cookie);
                    ok=true;
                }

                if(ok) {

                    $rootScope.country = ddl.options[ddl.selectedIndex].innerHTML;

                    $location.path('/w6game/').search({country: ddl.options[ddl.selectedIndex].innerHTML});
                }
            }


        };



        function getEvent() {
            var name = document.getElementById("event");
            var event= getCookie("event1");
            if(event=="") {
                name.innerHTML = "EVENT: None event";
                document.cookie='event=None event';
            }
            else{
                name.innerHTML='EVENT: '+event;
            }

        }

        function getCookie(cname) {
            var name = cname + "=";
            var decodedCookie = decodeURIComponent(document.cookie);
            var ca = decodedCookie.split(';');
            for(var i = 0; i <ca.length; i++) {
                var c = ca[i];
                while (c.charAt(0) == ' ') {
                    c = c.substring(1);
                }
                if (c.indexOf(name) == 0) {
                    return c.substring(name.length, c.length);
                }
            }
            return "";
        }



        function setInfo() {
            $scope.firstname="FIRST NAME";
            $scope.jobtitle="JOB TITLE";
            $scope.email="EMAIL";
            $scope.lastname="LAST NAME";
            $scope.company="COMPANY";
            $scope.phone="PHONE";


        }


        function setlanguage() {
            $http.get('Json/dictionary.json').then(function (data) {
                var dic = data.data;
                var language = "English";
                document.getElementById("GameP1").innerHTML = dic["GameP1"][language];
                document.getElementById("GameP2").innerHTML = dic["GameP2"][language];
                document.getElementById("GameP3").innerHTML = dic["GameP3"][language];
                document.getElementById("GameP4").innerHTML = dic["GameP4"][language];
                document.getElementById("GameP5").innerHTML = dic["GameP5"][language];
                document.getElementById("GameH1").innerHTML = dic["GameH1"][language];
                document.getElementById("GameH2").innerHTML = dic["GameH2"][language];


            });



        };

        $scope.changeEvent=function () {
            $location.path("/event");
        }
    };
        app.controller("welcomeCTRL", welcomeCTRL);

}());