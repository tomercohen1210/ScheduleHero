/**
 * Created by Tomer.Cohen on 3/22/2017.
 */
(function () {

    var app = angular.module("GameApp");

    var ResultCTRL = function($scope,$http,$q,$rootScope,$location) {

        var resevents;
        $scope.isFocused = true;


        var img =document.createElement('img');
        img.src = "images/clicksoftware-logo%20copy.png";
        var img2=document.createElement('img');
        img2.src ="images/your.png";

        $scope.init = function () {


            document.getElementsByTagName("BODY")[0].style.backgroundColor='#DBEDF8';
            var head =document.getElementById("head").style.backgroundColor='#DBEDF8';


            getScores();

            resevents = $rootScope.resEvent;

            $scope.dp1 = new DayPilot.Scheduler("dp1");
            $scope.dp2 = new DayPilot.Scheduler("dp2");

            $scope.dp1.onBeforeEventRender = function (args) {

                args.data.barHidden = true;


                if (args.e.name != undefined) {
                    args.e.cssClass = ' schedule_task ' + args.e.skill[0];

                    var style1 = args.e.cssClass + "schedule_task";
                    var html = '<div class=style1>';
                    if (args.e.err != undefined) {
                        html += '<img src="images/RuleViolationIcon.png" style="max-width:15px ">';
                        args.e.toolTip=args.e.err;
                    }

                    html+='<p class="text">' + args.e.name + '</p>';

                    if (args.e.dep != undefined){
                        html+='<div class="depGantt">' + args.e.dep + '</div>';
                    }

                    html+='</div>';

                    args.e.html = html;
                }
                else {
                    args.e.html = '<div></div>';
                }


            };
            $scope.dp2.onBeforeEventRender = function (args) {

                args.data.barHidden = true;


                if (args.e.name != undefined) {
                    args.e.cssClass = ' schedule_task ' + args.e.skill[0];

                    var style1 = args.e.cssClass + "schedule_task";
                    if (args.e.dep != undefined)
                        var html = '<div class=style1><p class="text">' + args.e.name + '</p><div class="depGantt">' + args.e.dep + '</div></div>';
                    else
                        var html = '<div class=style1><p class="text">' + args.e.name + '</p></div>';
                    args.e.html = html;
                }
                else {
                    args.e.html = '<div></div>';
                }


            };

            $scope.dp1.onTimeRangeSelect = function (args) {
                $scope.dp1.clearSelection();
            };
            $scope.dp1.onBeforeCellRender = function (args) {  // for dolor the cells
                args.cell.cssClass = "scheduler_cell";

                if (args.cell.start.getHours() === 19 || args.cell.start.getHours() === 20) {
                    args.cell.backColor = '#a6a6a6';

                }
                else if (args.cell.start.getHours() === 18 || args.cell.start.getHours() === 17) {
                    args.cell.backImage = 'images/lines.jpg';
                }
                else if (args.cell.start.getHours() === 9 || args.cell.start.getHours() === 11 || args.cell.start.getHours() === 13 || args.cell.start.getHours() === 15) {
                    args.cell.backColor = "#f5f5f0";
                }
            };
            $scope.dp1.onBeforeResHeaderRender = function (args) {

                var worker = "images/worker" + args.resource.id + ".png";
                var reshtml = '<div class="res"> <img src=' + worker + ' style="width:30px;height: 30px;padding-right: 10px;border-radius: 50%"><div style="width: 45%">' + args.resource.name + '</div>';

                for (var i = 0; i < args.resource.skill.length; i++)
                    reshtml += '<div class="skill ' + args.resource.skill[i] + '"+ ></div>';

                reshtml += '</div>';
                args.resource.html = reshtml;
            };
            $scope.dp2.onTimeRangeSelect = function (args) {
                $scope.dp2.clearSelection();
            };
            $scope.dp2.onBeforeCellRender = function (args) {  // for dolor the cells
                args.cell.cssClass = "scheduler_cell";

                if (args.cell.start.getHours() === 19 || args.cell.start.getHours() === 20) {
                    args.cell.backColor = '#a6a6a6';

                }
                else if (args.cell.start.getHours() === 18 || args.cell.start.getHours() === 17) {
                    args.cell.backImage = 'images/lines.jpg';
                }
                else if (args.cell.start.getHours() === 9 || args.cell.start.getHours() === 11 || args.cell.start.getHours() === 13 || args.cell.start.getHours() === 15) {
                    args.cell.backColor = "#f5f5f0";
                }
            };
            $scope.dp2.onBeforeResHeaderRender = function (args) {

                var worker = "images/worker" + args.resource.id + ".png";
                var reshtml = '<div class="res"> <img src=' + worker + ' style="width:30px;height: 30px;padding-right: 10px;border-radius: 50%"><div style="width: 45%">' + args.resource.name + '</div>';

                for (var i = 0; i < args.resource.skill.length; i++)
                    reshtml += '<div class="skill ' + args.resource.skill[i] + '"+ ></div>';

                reshtml += '</div>';
                args.resource.html = reshtml;
            };



            //setlanguage();

            checkNWW();
            checkSV();
            checkDistance();
            checkTotalTime();
            checkovertime();
            checkDependencyViolation(["red", "green", "purple", "yellow"]);
            calcscore();
            makeGraph();

            setGantt($scope.dp1);
            setGantt($scope.dp2, "ans");


            $scope.dp1.init();
            $scope.dp2.init();


        };
        function setlanguage() {
            $http.get('Json/dictionary.json').then(function (data) {
                var dic = data.data;
                var lan = $rootScope.language;
                document.getElementById("ResultP1").innerHTML = dic["ResultP1"][lan] + document.getElementById("ResultP1").innerHTML;
                document.getElementById("ResultP2").innerHTML = dic["ResultP2"][lan] + document.getElementById("ResultP2").innerHTML;
                document.getElementById("ResultP3").innerHTML = dic["ResultP3"][lan] + document.getElementById("ResultP3").innerHTML;
                document.getElementById("ResultP31").innerHTML = dic["ResultP31"][lan] + document.getElementById("ResultP31").innerHTML;
                //document.getElementById("ResultP4").innerHTML = dic["ResultP4"][lan] + document.getElementById("ResultP4").innerHTML;
                //document.getElementById("ResultP5").innerHTML = dic["ResultP5"][lan] + document.getElementById("ResultP5").innerHTML;
                //document.getElementById("ResultP6").innerHTML = dic["ResultP6"][lan] + document.getElementById("ResultP6").innerHTML;


                document.getElementById("ResultH1").innerHTML = dic["ResultH1"][lan];
              //  document.getElementById("ResultH2").innerHTML = dic["ResultH2"][lan];
                //document.getElementById("ResultH3").innerHTML = dic["ResultH3"][lan];


            });

        }

        function addErr(name,err) {
            var events=$rootScope.events.list;
            for (var i=0; i<events.length;i++){
                if (events[i].name==name){
                    if (events[i].err==undefined)
                    {
                        events[i].err='';
                    }
                    events[i].err+=err+'\n';
                    break;
                }
            }
        }

        function setGantt(dp, ans) {
            dp.snapToGrid = false;
            dp.businessWeekends = true;
            dp.businessBeginsHour = 9;
            dp.businessEndsHour = 21;
            dp.showNonBusiness = false;
            dp.cellWidthSpec = "Auto";
            dp.heightSpec = "Parent100Pct";
            dp.durationBarVisible = true;
            dp.durationBarMode = "PercentComplete";
            dp.useEventBoxes = "Never";
            dp.rowMinHeight = 41;
            dp.rowMarginBottom = 3;
            dp.rowMarginTop = 6;
            dp.rowHeaderWidth = 240;
            dp.crosshairColor = '#A9A9A9';
            dp.eventResizeMargin = 0;

            dp.resources = $rootScope.res;
            if (ans === 'ans') {
                dp.events = angular.copy($rootScope.events);
                changeListToday();
                dp.events.list = $rootScope.ans.list;
                dp.events.$dY = $rootScope.ans.$dY;
                dp.events.$e7 = $rootScope.ans.$e7;
            }
            else {
                dp.events = $rootScope.events;

            }
            disablemove(dp);
        }

        function disablemove(dp) {
            for (var j; j < dp.events.length; j++)
                dp.events[j].moveDisabled = true;
        }

        function checkNWW() { // check to see how many extra hours over limit time
            $scope.notWorkingHours = 0;
            var endtime = DayPilot.Date.today().addHours(19);
            for (var i = 0; i < resevents.length; i++) {
                for (var j = 1; j < resevents[i].Events.length - 1; j++) {
                    if (resevents[i].Events[j].end.addSeconds(resevents[i].Events[j].travel) > endtime) {
                        $scope.notWorkingHours++;
                        addErr(resevents[i].Events[j].name,'Not Working Hours');
                    }
                }
            }

        }

        function checkSV() {
            $scope.skillViolation = 0;
            for (var i = 0; i < resevents.length; i++) {
                for (var j = 1; j < resevents[i].Events.length - 1; j++) {
                    if (!resevents[i].skill.includes(resevents[i].Events[j].skill[0])) {
                        $scope.skillViolation++;
                        addErr(resevents[i].Events[j].name,'Skill Violation');
                    }
                }
            }
        }

        function checkDistance() {
            $scope.distance = 0;
            for (var i = 0; i < resevents.length; i++) {
                for (var j = 0; j < resevents[i].Events.length - 1; j++) {
                    if (resevents[i].Events[j].distance != undefined || resevents[i].Events[j].distance == 0)
                        $scope.distance += resevents[i].Events[j].distance;


                }
            }
            $scope.distance = $scope.distance / 1000;
            $scope.distance=Math.round($scope.distance * 100) / 100
        }

        function checkTotalTime() {
            $scope.travelTime = 0;
            for (var i = 0; i < resevents.length; i++) {
                for (var j = 0; j < resevents[i].Events.length - 1; j++) {
                    $scope.travelTime += resevents[i].Events[j].travel;


                }
            }
            $scope.travelTime = $scope.travelTime / 3600;
            $scope.travelTime=Math.round($scope.travelTime * 100) / 100;



         var hours= Math.floor($scope.travelTime);
            if(hours>0) {
              var minutes = Math.floor(($scope.travelTime % hours)*60);
                $scope.showTime = hours + " HR " + minutes + " Min";
            }
            else{
                $scope.showTime = Math.floor(($scope.travelTime%1)*60)+ " Min";
            }

        }

        function checkovertime() { // check to see how many extra hours over limit time
            var extra = 0;
            var eve;
            var cur = 0;
            var seven = DayPilot.Date.today().addHours(17).getTime();
            for (var i = 0; i < resevents.length; i++) {
                eve = resevents[i].Events[resevents[i].Events.length - 2];
                if (DayPilot.Date.today().addHours(17) < eve.end.addSeconds(eve.travel)) {
                    cur = eve.end.addSeconds(eve.travel).getTime();
                    cur -= seven;
                    cur = cur / 3600000;
                    if (cur > 2)
                        cur = 2;
                    extra += cur;
                }
            }
            $scope.overtime = extra;
            $scope.overtime=Math.round($scope.overtime * 100) / 100




        }

        function checkDependencyViolation(depns) {

            var depTime = {}; // save all the start and end time for each pair of dep     {Agreen:end time, Ared:strt time
            $scope.dependencyViolation = 0;
            for (var x = 0; x < depns.length; x = x + 2) { //loop for each tow depss
                for (var i = 0; i < resevents.length; i++) {
                    for (var j = 0; j < resevents[i].Events.length - 1; j++) {
                        if (resevents[i].Events[j].dep != undefined && resevents[i].Events[j].skill != undefined) {

                            if(depTime[resevents[i].Events[j].dep + resevents[i].Events[j].skill[0]]==undefined){ // int for each one
                                depTime[resevents[i].Events[j].dep + resevents[i].Events[j].skill[0]]={};
                            }

                            if (resevents[i].Events[j].skill[0] == depns[x]) { // the first dep
                                depTime[resevents[i].Events[j].dep + resevents[i].Events[j].skill[0]].time = resevents[i].Events[j].end;
                                depTime[resevents[i].Events[j].dep + resevents[i].Events[j].skill[0]].name=resevents[i].Events[j].name;
                            }
                            else if (resevents[i].Events[j].skill[0] == depns[x + 1]) { // the last dep
                                depTime[resevents[i].Events[j].dep + resevents[i].Events[j].skill[0]].time = resevents[i].Events[j].start;
                                depTime[resevents[i].Events[j].dep + resevents[i].Events[j].skill[0]].name=resevents[i].Events[j].name;
                            }
                        }


                    }
                }
                // check the dep is ok
                var letters = 'ABCDEFGHIJKLMNPOQRST';
                for (var i = 0; i < letters.length; i++) {
                    if (depTime[letters[i] + depns[x]] != undefined && depTime[letters[i] + depns[x+1]] != undefined && depTime[letters[i] + depns[x]].time != undefined && depTime[letters[i] + depns[x + 1]].time != undefined) {
                        if (depTime[letters[i] + depns[x]].time > depTime[letters[i] + depns[x + 1]].time) {
                            $scope.dependencyViolation++;
                            addErr(depTime[letters[i] + depns[x]].name,'Dependency Violation');
                            addErr(depTime[letters[i] + depns[x + 1]].name,'Dependency Violation');
                        }

                    }


                }


            }
        }

        function calcscore() {


            $scope.openTasks = 0;
            var tasks = 0;
            for (var i = 0; i < resevents.length; i++) {
                for (var j = 1; j < resevents[i].Events.length - 1; j++) {
                    if (resevents[i].Events[j].distance != undefined || resevents[i].Events[j].distance == 0)
                        tasks++;
                }
            }
            $scope.openTasks=23-tasks;
            $scope.score = 100 -10*$scope.openTasks- 3 * ($scope.dependencyViolation) - 3 * ($scope.notWorkingHours) - 3 * ($scope.skillViolation) - ((($scope.travelTime-5.18) * 6) * 2) - ($scope.overtime-2.18) * 6 * 2;
            $scope.score= Math.floor($scope.score);


            $scope.score-= $rootScope.gameTime*2;
            $scope.score=Math.max($scope.score,0);
            $scope.score=Math.floor( $scope.score);

            var eve=getCookie('event');

            if(eve!='None event') {
                $http.post('/writeScore?event=' + getCookie('event') + '&name=' + getCookie('firstname') + ' ' + getCookie('lastname') + '&company=' + getCookie('company') + '&score=' + $scope.score);
            }

            $scope.moneysave=3*($scope.travelTime-5.16)*22*12*20+18*($scope.overtime-2.18)*22*12*20+($scope.dependencyViolation+$scope.notWorkingHours+$scope.openTasks+$scope.skillViolation)*20*22*12*20;
            $scope.moneysave=numberWithCommas(Math.floor( $scope.moneysave));

            $scope.savetravel=numberWithCommas(Math.floor(3*($scope.travelTime-5.16)*22*12*20));
            $scope.savehours=numberWithCommas(Math.floor(18*($scope.overtime-2.18)*22*12*20));
            $scope.savetasks=numberWithCommas(Math.floor(($scope.dependencyViolation+$scope.notWorkingHours+$scope.openTasks+$scope.skillViolation)*20*22*12*20));
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
       function changeListToday() { // change the dates in the ans list for today
           var today = new Date();
           var dd = today.getDate();
           var mm = today.getMonth()+1; //January is 0!
           var yyyy = today.getFullYear();

           if(dd<10) {
               dd='0'+dd
           }

           if(mm<10) {
               mm='0'+mm
           }

           today = yyyy+'-'+mm+'y'+dd+'T';
           for (var i=0;i<$rootScope.ans.list.length;i++){
               var time = $rootScope.ans.list[i].start.split("T")[1];
               $rootScope.ans.list[i].start=today+time;
               time=$rootScope.ans.list[i].end.split("T")[1];
               $rootScope.ans.list[i].end=today+time;
           }
       }

       function makeGraph() {
           paintGraph([0,$scope.dependencyViolation+$scope.skillViolation+$scope.notWorkingHours],1);
           paintGraph([5.16,$scope.travelTime,5.16],2);
           paintGraph([182.8,Math.round($scope.distance)],3);
           paintGraph([2.18,$scope.overtime],4);
           paintGraph([0.1,$scope.gameTime],5);



       }

        function numberWithCommas(x) {
            return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        }

        Chart.plugins.register({
            afterDatasetsDraw: function(chart, easing) {
                // To only draw at the end of animation, check for easing === 1
                var ctx = chart.ctx;
                chart.data.datasets.forEach(function (dataset, i) {
                    var meta = chart.getDatasetMeta(i);
                    if (!meta.hidden) {
                        meta.data.forEach(function(element, index) {
                            // Draw the text in black, with the specified font
                            ctx.fillStyle = '#556080';
                            var fontSize = 16;
                            var fontStyle = 'normal';
                            var fontFamily = 'Helvetica Neue';
                            ctx.font = Chart.helpers.fontString(fontSize, fontStyle, fontFamily);
                            // Just naively convert to string for now
                            var dataString = dataset.data[index].toString();
                            // Make sure alignment settings are correct
                            ctx.textAlign = 'center';
                            ctx.textBaseline = 'middle';
                            var padding = 5;
                            var position = element.tooltipPosition();
                           // ctx.fillText(dataString, position.x+20, position.y - (fontSize / 2) - padding-8);


                            if(index%2==0) {

                                ctx.drawImage(img, position.x-18, position.y - (fontSize / 2) - padding-30);
                            }
                            else{

                                ctx.drawImage(img2, position.x-15, position.y - (fontSize / 2) - padding-20);
                            }

                        });
                    }
                });
            }
        });


       function paintGraph(data,canvasNm) {
            var canvas = document.querySelector('canvas');



           var ctx = document.getElementById("myChart"+canvasNm);
           var myChart = new Chart(ctx, {

               type: 'bar',
               data: {
                   labels: ["", ""],
                   datasets: [{
                       data: data,
                       label:"",
                       backgroundColor: [
                           '#0A77BF',
                           '#1DCB7E'

                       ]

                   }]
               },
               options: {

                   responsive: true,
                   layout: {
                       padding: {
                           top: 10
                       }
                   },
                   maintainAspectRatio: false,
                   tooltips: {
                       callbacks: {
                           label: function(tooltipItem) {
                               return Number(tooltipItem.yLabel);
                           }
                       }
                   },
                   legend: {
                       display:true,
                       labels: {
                           boxWidth: 0
                       }
                       ,


                   },
                   scaleShowVerticalLines: false,
                   scales: {
                       yAxes: [{
                          display:false,
                           ticks: {
                               beginAtZero:true

                           }

                       }],
                       xAxes : [ {
                           barThickness : 30,
                           gridLines : {
                               display : false

                           }
                       } ]
                   }
               }
           });
       }

        var getScores=function () {

            var url='/highScores?event=eilat';

            $http.get(url).then(function (data) {
                $scope.scores=data.data;
                $scope.scores.sort(compare);

            })

            var url='/topScores';
            $http.get(url).then(function (data) {
                $scope.topscores=data.data;


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

    app.controller("ResultCTRL",ResultCTRL);

    }());