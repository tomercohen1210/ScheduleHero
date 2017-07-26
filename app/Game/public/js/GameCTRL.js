(function () {

    var app = angular.module("GameApp");

    var GameCTRL = function ($scope, $http, $q,$location,$route,$rootScope,$timeout) {


        var directionsService = new google.maps.DirectionsService();
        CustomMarker.prototype = new google.maps.OverlayView();
        var map;

        var directions={};
        var jsonEng;
        var jsonTask;
        var resEvent = [];
        var SaveresEvent;
        var roaddic = [];  // save all road index by format [name,origin,dis]=index
        var resourcesDirectionsRenderer = [];
        var markers = [];
        var home;
        var language;
        var country;
        var config;
        $scope.clock = "loading clock...";
        $scope.tickInterval = 1000; //ms
        var d1;
        var endTime; // set the time to 10 minutes



        $scope.init = function () {

            document.getElementsByTagName("BODY")[0].style.backgroundColor='#A1CFEE';
            var head =document.getElementById("head").style.backgroundColor='#A1CFEE';

            $scope.dp = new DayPilot.Scheduler("dp");                                   // start the Gantt


            setGantt();                                                                 // set the Gantt property
            $scope.dp.init();                                                           // init the dayPilot
            $http.get('Json/Config.json').then(function (data) {

                config = data.data;
                country = $location.search().country;
                language = config[country].Language;

                initMap();                                                                  // init the google map
                loadResources();                                                            //load the engineers and tasks

            });


            // set the events for the Gantt
            $scope.dp.onTimeRangeSelect = function (args) {
                $scope.dp.clearSelection();
            };
            $scope.dp.onBeforeCellRender = function (args) {  // for dolor the cells
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
            $scope.dp.onBeforeResHeaderRender = function (args) {
                if (args.IsCorner)
                {
                    args.InnerHTML = String.Format("<div style='padding:5px; font-weight: bold; font-size:22px; text-align:center'>{0}</div>", DayPilotScheduler1.StartDate.Year);
                }


                var worker = "images/worker" + args.resource.id + ".png";
                var reshtml = '<div class="res"> <img src=' + worker + ' style="width:20px;height: 20px;padding-right: 10px;border-radius: 50%;;"><div style="width: 45%">' + args.resource.name + '</div>';

                for (var i = 0; i < args.resource.skill.length; i++)
                    reshtml += '<div class="skill ' + args.resource.skill[i] + '"+ ></div>';

                reshtml += '</div>';
                args.resource.html = reshtml;
            };
            $scope.dp.onBeforeEventRender = function (args) {

                args.data.areas = [
                    {left:22, top:5, bottom:5, width: 20, css: "icon icon-move", action:"Move"},

                ];
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


            $scope.dp.onEventRightClicked = function (args) {

                if (args.e.data.order != undefined) {
                    returntomap(args);

                }
            };
            $scope.dp.onEventMoving = function (event) {

                if (event.end > DayPilot.Date.today().addHours(21))
                    event.allowed = false;
            };
            $scope.dp.onEventMove = function (event) {

                SaveresEvent = JSON.stringify(resEvent); // save the currnet posion for go back
                removeFromRes(event);
            };
            $scope.dp.onEventMoved = function (event) {


                resEvent[event.e.data.resource - 1].Events.push(event.e.data);                //pushing the data of each event to res
                resEvent[event.e.data.resource - 1].Events.sort(function (a, b) {

                    //sort bu start time
                    if (a.pos !== undefined && a.pos === "start")
                        return -1;
                    else if (b.pos !== undefined && b.pos === "start")
                        return 1;
                    else if (a.pos !== undefined && a.pos === "end")
                        return 1;
                    else if (b.pos !== undefined && b.pos === "end")
                        return -1;
                    else if (new DayPilot.Date(a.start.value) > new DayPilot.Date(b.start.value))
                        return 1;
                    else
                        return -1;
                });

                //set the order of event start at 0

                for (var i = 0; i < resEvent[event.e.data.resource - 1].Events.length; i++) {
                    resEvent[event.e.data.resource - 1].Events[i].order = i;

                    if (resEvent[event.e.data.resource - 1].Events[i].name == event.e.data.name) { //set tht event order
                        event.e.data.order = i;
                    }
                }



                beforeTravel(event).then(function () {
                 thisTravel(event).then(function () {


                    //check if have place for the new task

                    for (var i = 1; i < resEvent[event.e.data.resource - 1].Events.length - 1; i++) {

                        if (resEvent[event.e.data.resource - 1].Events[i - 1].end.addSeconds(resEvent[event.e.data.resource - 1].Events[i - 1].travel) > resEvent[event.e.data.resource - 1].Events[i].start) {
                            resEvent[event.e.data.resource - 1].Events[i].start = resEvent[event.e.data.resource - 1].Events[i - 1].end.addSeconds(resEvent[event.e.data.resource - 1].Events[i - 1].travel);
                            resEvent[event.e.data.resource - 1].Events[i].end = resEvent[event.e.data.resource - 1].Events[i].start.addHours(resEvent[event.e.data.resource - 1].Events[i].time);
                        }

                    }
                    var endtime = resEvent[event.e.data.resource - 1].Events[resEvent[event.e.data.resource - 1].Events.length - 2].travel;
                    if (resEvent[event.e.data.resource - 1].Events[resEvent[event.e.data.resource - 1].Events.length - 2].end.addSeconds(endtime) > DayPilot.Date.today().addHours(21)) { /// add the time of travel after
                        resEvent = JSON.parse(SaveresEvent);
                        updateGanttTravel(true);

                        if (!checkIfInRes(event.e.data.id)) { // in case the user pull from the map
                            var e = $scope.dp.events.find(event.e.data.id);
                            $scope.dp.events.remove(e);
                            setTask([{
                                "location": event.e.data.location,
                                "time": event.e.data.time,
                                "skill": event.e.data.skill,
                                "id": event.e.data.id - 1,
                                "name": event.e.data.name,
                                "dep": event.e.data.dep
                            }]);
                        }
                        window.alert("problem no place")

                    }

                    else {
                        updateGanttTravel();

                        updateroads(event);

                        updateMarkers();


                    }

                })

            })
                var audio = document.getElementById("audio");
                audio.play();

            };
        };

        function updateroads(event) {  //get event and update the roads to and from it

            //set the road
            var resource;
            var org;
            var dec;
            var resource = resEvent[event.e.data.resource - 1].Events[0].name;

            //this event
            org = resEvent[event.e.data.resource - 1].Events[event.e.data.order].name;
            dec = resEvent[event.e.data.resource - 1].Events[event.e.data.order + 1].name;
            setDir(resource, org, dec);


            //before event

            org = resEvent[event.e.data.resource - 1].Events[event.e.data.order - 1].name;
            dec = resEvent[event.e.data.resource - 1].Events[event.e.data.order].name;
            setDir(resource, org, dec);

            //remove previous road from map between order+1 and order-1

            org = resEvent[event.e.data.resource - 1].Events[event.e.data.order - 1].name;
            dec = resEvent[event.e.data.resource - 1].Events[event.e.data.order + 1].name;

            if (org != dec && resourcesDirectionsRenderer[roaddic[resource + org + dec]] != null) {

                resourcesDirectionsRenderer[roaddic[resource + org + dec]].setMap(null);
                resourcesDirectionsRenderer[roaddic[resource + org + dec]] = null;

            }
        }

        function updateMarkers() {
            //   remove all the makres from the map
            for (var i = 0; i < markers.length; i++)
                markers[i].setMap(null);


            for (var i = 0; i < resEvent.length; i++) { // update the gant event for the currnt markers
                if (resEvent[i].Events.length > 2) {
                    for (var j = 0; j < resEvent[i].Events.length - 1; j++) {

                        var road;
                        for (var k = 0; k < jsonEng.eng.length; k++)
                            if (jsonEng.eng[k].name == resEvent[i].Events[j].name)
                                road = jsonEng.eng[k].road;

                        markers.push(addMarker(resEvent[i].Events[j].location, map, resEvent[i].Events[j].order, road));
                    }
                }
            }
        }

        function returntomap(args) {
            removeFromRes(args);
            $scope.dp.events.remove(args.e);
            setTask([{
                "location": args.e.data.location,
                "time": args.e.data.time,
                "skill": args.e.data.skill,
                "id": args.e.data.id - 1,
                "name": args.e.data.name,
                "dep": args.e.data.dep
            }]);
            var e = $scope.dp.events.find(args.e.data.id + "road");
            $scope.dp.events.remove(e); // remove road from gantt
            updateGanttTravel();
            updateMarkers();
        }


        function updateGanttTravel(dotask) {  // update the travel time on the gantt

            if (dotask) { //in case that the user did somthing wrong need to go back
                for (var i = 0; i < resEvent.length; i++) { // update the gant event for the currnt events
                    for (var j = 0; j < resEvent[i].Events.length - 1; j++) {
                        if (j != 0) { //the home event dont need
                            var e = $scope.dp.events.find(resEvent[i].Events[j].id);
                            e.data.start = resEvent[i].Events[j].start;
                            e.data.end = resEvent[i].Events[j].end;
                            e.data.resource = resEvent[i].Events[j].resource;
                            e.data.travel = resEvent[i].Events[j].travel;
                            e.data.order = resEvent[i].Events[j].order;
                            $scope.dp.events.update(e).notify();
                            var event = {};
                            event.e = e;
                            updateroads(event);
                        }

                        resEvent[i].Events[j].start = DayPilot.Date(resEvent[i].Events[j].start);
                        resEvent[i].Events[j].end = DayPilot.Date(resEvent[i].Events[j].end);
                        resEvent[i].Events[j].location = new google.maps.LatLng(resEvent[i].Events[j].location.lat, resEvent[i].Events[j].location.lng);

                    }
                }

            }


            //remove the first roads
            for (var i = 0; i < resEvent.length; i++) {
                var firstroad = $scope.dp.events.find(i + "strat");

                if (firstroad != undefined) {
                    $scope.dp.events.remove(firstroad);
                }
            }


            for (var i = 0; i < resEvent.length; i++) {
                for (var j = 1; j < resEvent[i].Events.length - 1; j++) {

                    if (j == 1) { //first task, need road from the start

                        firstroad = new DayPilot.Event({
                            start: resEvent[i].Events[j].start.addSeconds(resEvent[i].Events[0].travel * -1),
                            end: resEvent[i].Events[j].start,
                            id: i + "strat",
                            resource: "" + resEvent[i].Events[j].resource,
                            moveDisabled: true,

                        });
                        $scope.dp.events.add(firstroad);

                    }

                    var road = $scope.dp.events.find(resEvent[i].Events[j].id + "road");

                    if (road != undefined) {
                        $scope.dp.events.remove(road);
                    }
                    road = new DayPilot.Event({
                        start: resEvent[i].Events[j].end,
                        end: resEvent[i].Events[j].end.addSeconds(resEvent[i].Events[j].travel),
                        id: resEvent[i].Events[j].id + "road",
                        resource: "" + resEvent[i].Events[j].resource,
                        moveDisabled: true
                    });

                    $scope.dp.events.add(road);


                }
            }

            $scope.dp.update();
        }

        function addMarker(location, map, order, road) {
            var labels = '123456789';
            var marker = new google.maps.Marker({
                position: location,
                label: {
                    text: labels[order],
                    color: 'white'
                },
                icon: {
                    path: google.maps.SymbolPath.CIRCLE,
                    strokeColor: road,
                    strokeWeight: 15,
                    scale: 7.5
                },
                map: map
            });
            return marker;
        }

        function removeFromRes(event) {
            if (event.e.data.order !== undefined) {

                //remove the road from the map and set road between order -1 and order +1

                var org;
                var dec;
                var resource;

                // remove from event and to event

                //from

                resource = resEvent[event.e.data.resource - 1].Events[0].name;
                org = resEvent[event.e.data.resource - 1].Events[event.e.data.order].name;
                dec = resEvent[event.e.data.resource - 1].Events[event.e.data.order + 1].name;
                if (org != dec && resourcesDirectionsRenderer[roaddic[resource + org + dec]] != null) {
                    resourcesDirectionsRenderer[roaddic[resource + org + dec]].setMap(null);
                    resourcesDirectionsRenderer[roaddic[resource + org + dec]] = null;
                }
                //to
                org = resEvent[event.e.data.resource - 1].Events[event.e.data.order - 1].name;
                dec = resEvent[event.e.data.resource - 1].Events[event.e.data.order].name;
                if (org != dec && resourcesDirectionsRenderer[roaddic[resource + org + dec]] != null) {
                    resourcesDirectionsRenderer[roaddic[resource + org + dec]].setMap(null);
                    resourcesDirectionsRenderer[roaddic[resource + org + dec]] = null;
                }


                //set

                org = resEvent[event.e.data.resource - 1].Events[event.e.data.order - 1].name;
                dec = resEvent[event.e.data.resource - 1].Events[event.e.data.order + 1].name;
                if (org != dec) {
                    setDir(resource, org, dec);
                }

                // remove form the res events

                resEvent[event.e.data.resource - 1].Events.splice(event.e.data.order, 1);
                for (var i = 0; i < resEvent[event.e.data.resource - 1].Events.length; i++) {  //set the order of events --start at 0
                    resEvent[event.e.data.resource - 1].Events[i].order = i;
                }
                thisTravel(resEvent[event.e.data.resource - 1].Events[event.e.data.order - 1]); //fix the event one before the one remove

            }
        }

        function beforeTravel(event) { // fix travel time of event before

            var defer=$q.defer();
            var Duration;
            var origin = resEvent[event.e.data.resource - 1].Events[event.e.data.order - 1].name;
            var destination = resEvent[event.e.data.resource - 1].Events[event.e.data.order].name;

            var promis=[getDuration(origin, destination),getDistance(origin, destination)];

            $q.all(promis).then(function (data) {
                Duration = data[0];
                resEvent[event.e.data.resource - 1].Events[event.e.data.order - 1].travel = Duration;           //set the travel duration to the next event
                Distance = data[1];
                resEvent[event.e.data.resource - 1].Events[event.e.data.order - 1].distance = Distance;           //set the travel distance to the next event
                defer.resolve(true);
            });
            return defer.promise;
        }

        function thisTravel(event) {

            // fix travel time of this event
            var defer=$q.defer();
            var Duration;
            var origin;
            var destination;
            var Distance;


            if (event.e !== undefined) { // in case of normal event
                origin = resEvent[event.e.data.resource - 1].Events[event.e.data.order].name;
                destination = resEvent[event.e.data.resource - 1].Events[event.e.data.order + 1].name;

                var promis=[getDuration(origin, destination),getDistance(origin, destination)];
                $q.all(promis).then(function (data) {

                Duration = data[0];
                resEvent[event.e.data.resource - 1].Events[event.e.data.order].travel = Duration;
                Distance = data[1];
                resEvent[event.e.data.resource - 1].Events[event.e.data.order].distance = Distance;           //set the travel distance to the next event
                defer.resolve(true);
                })

            }
            else { // ni case of home base event

                origin = resEvent[event.resource - 1].Events[event.order].name;
                destination = resEvent[event.resource - 1].Events[event.order + 1].name;

                var promis=[getDuration(origin, destination),getDistance(origin, destination)];
                $q.all(promis).then(function (data) {
                    Duration = data[0];
                    resEvent[event.resource - 1].Events[event.order].travel = Duration;
                    Distance = data[1];
                    resEvent[event.resource - 1].Events[event.order].distance = Distance;           //set the travel distance to the next event
                    defer.resolve(true);
                })
            }

            return defer.promise;
        }

        function getDuration(p1, p2) {

            promises=[];
            var defer = $q.defer();
            if(directions[p1]==undefined || directions[p1][p2]==undefined )
                promises.push(getdata(p1,p2));

            $q.all(promises).then(function () {


            if (p1 != p2) // in case of an empty gannt for this person
            {
                defer.resolve(directions[p1][p2].routes[0].legs[0].duration.value);
            }
            else {
                defer.resolve(null);
            }
            });
            return defer.promise;
        }

        function getDistance(p1, p2) {

            promises=[];
            var defer = $q.defer();

            if(directions[p1]==undefined || directions[p1][p2]==undefined )
                promises.push(getdata(p1,p2));


            $q.all(promises).then(function () {


                if (p1 != p2) // in case of an empty gannt for this person
                {
                    defer.resolve(directions[p1][p2].routes[0].legs[0].distance.value);
                }
                else {
                    defer.resolve(null);
                }
            });

            return defer.promise;
        }

        function setDir(name, p1, p2) {
            promises=[];
            if(directions[p1]==undefined || directions[p1][p2]==undefined )
               promises.push(getdata(p1,p2));

            $q.all(promises).then(function () {
                var place;
                if (roaddic[name + p1 + p2] == undefined)                                         // get the index number for the road
                    place = resourcesDirectionsRenderer.length;
                else
                    place = roaddic[name + p1 + p2];

                roaddic[name + p1 + p2] = place;

                //get road color
                var road;
                for (var i = 0; i < jsonEng.eng.length; i++)
                    if (jsonEng.eng[i].name == name)
                        road = jsonEng.eng[i].road;

                if (resourcesDirectionsRenderer[place] != null) {
                    resourcesDirectionsRenderer[place].setMap(null);
                    resourcesDirectionsRenderer[place] = null;
                }
                resourcesDirectionsRenderer[place] = new google.maps.DirectionsRenderer({
                    preserveViewport: true,
                    polylineOptions: {strokeColor: road},
                    suppressMarkers: true
                });
                resourcesDirectionsRenderer[place].setMap(map);
                resourcesDirectionsRenderer[place].setDirections(directions[p1][p2]);
            })
        }

        function setGantt() {

            $scope.dp.cornerHtml="<div style='position: absolute;bottom: 0;right: 40px;font-size: 15px;color: #556080;'>Skills</div>";
            $scope.dp.snapToGrid = false;
            $scope.dp.businessWeekends = true;
            $scope.dp.businessBeginsHour = 9;
            $scope.dp.businessEndsHour = 21;
            $scope.dp.showNonBusiness = false;
            $scope.dp.cellWidthSpec = "Auto";
            $scope.dp.heightSpec = "Parent100Pct";
            $scope.dp.durationBarVisible = true;
            $scope.dp.durationBarMode = "PercentComplete";
            $scope.dp.useEventBoxes = "Never";
            $scope.dp.rowMinHeight = 25;
            $scope.dp.rowMarginBottom = 1;
            $scope.dp.rowMarginTop = 1;
            $scope.dp.rowHeaderWidth = 240;
            $scope.dp.crosshairColor = '#A9A9A9';
            $scope.dp.eventResizeMargin = 0;
            $scope.dp.cellBorderColor = "white";


        }

        function loadResources() {


            var eng = config[country].Engineers;
            var tasks = config[country].Tasks;
            var dat = config[country].Data;


            $q.all([$http.get('Json/' + eng + '.json'), $http.get('Json/' + tasks + '.json'),$http.get('Json/USASolution.json')]).then(function (values) {
                jsonEng = values[0].data;
                jsonTask = values[1].data;
                $rootScope.ans=values[2].data;

                    //strat the clock
              //  cacheData();
                 d1=new Date();
                 endTime=new Date().setMinutes(d1.getMinutes()+10); // set the time to 10 minutes
                $timeout(tick, $scope.tickInterval);

                //insert home base as first and last event
                var startDay = DayPilot.Date.today().addHours(9);
                var endDay = startDay.addHours(12);

                for (var i = 0; i < jsonEng.eng.length; i++) {

                    resEvent[i] = {
                        "Events": [{
                            "id": i + "start",
                            "location": new google.maps.LatLng(jsonEng.eng[i].lat, jsonEng.eng[i].lng),
                            "pos": "start",
                            "resource": i + 1,
                            "name": jsonEng.eng[i].name,
                            "start": startDay,
                            "end": startDay,
                            "travel": 0
                        },
                            {
                                "id": i + "end",
                                "location": new google.maps.LatLng(jsonEng.eng[i].lat, jsonEng.eng[i].lng),
                                "pos": "end",
                                "resource": i + 1,
                                "name": jsonEng.eng[i].name,
                                "start": endDay,
                                "end": endDay,
                                "travel": 0
                            }],
                        "skill": jsonEng.eng[i].skill
                    };

                }

                $scope.dp.resources = jsonEng.eng;
                $scope.dp.update();
                setHome(jsonEng.eng);
                setTask(jsonTask.task);
                setGanntMapHeight();                                                           //set the gannt height by number of res
               // setlanguage();                                                              // set the language


            });
        }

        function checkIfInRes(id) {
            for (var i = 0; i < resEvent.length; i++) { // update the gant event for the currnt events
                for (var j = 1; j < resEvent[i].Events.length - 1; j++) {
                    if (resEvent[i].Events[j].id == id)
                        return true;
                }
            }
            return false;
        }

        function CustomMarker(latlng, map, args) {
            this.latlng = latlng;
            this.args = args;
            this.setMap(map);
        }

        function setHome(eng) {
            var overlay;
            for (var i = 0; i < eng.length; i++) {
                overlay = new CustomMarker(
                    new google.maps.LatLng(eng[i].lat, eng[i].lng),
                    map,
                    {
                        "skill": eng[i].skill,
                        "name": eng[i].name
                    }
                );
            }


        }

        function setTask(task) {
            if (task[0].location !== undefined) { // in case that location in google map already
                var overlay = new CustomMarker(
                    task[0].location,
                    map,
                    {
                        "skill": task[0].skill,
                        "time": task[0].time,
                        "id": task[0].id,
                        "location": task[0].location,
                        "name": task[0].name,
                        "dep": task[0].dep

                    }
                );

            }
            else {
                for (var i = 0; i < task.length; i++) {
                    var overlay = new CustomMarker(
                        new google.maps.LatLng(task[i].lat, task[i].lng),
                        map,
                        {
                            "skill": [task[i].skill],
                            "time": task[i].time,
                            "id": i,
                            "location": new google.maps.LatLng(task[i].lat, task[i].lng),
                            "name": task[i].name,
                            "dep": task[i].dep
                        }
                    );
                }
            }

        }

        CustomMarker.prototype.draw = function () {

            var self = this;

            var div = this.div;

            if (!div) {

                div = this.div = document.createElement('div');

                div.className = 'marker';


                div.style.position = 'absolute';
                div.style.cursor = 'pointer';
                div.style.width = '30px';
                div.style.height = '30px';




                if (typeof(self.args.skill) !== 'undefined') {

                    if (self.args.skill.length == 1) {                                                //for tasks
                        var span = document.createElement('span');
                        span.className = 'bubble';
                        span.innerHTML = self.args.name;
                        div.appendChild(span);
                        div.style.width = '40px';

                        div.className = div.className + ' ' + self.args.skill[0] + ' task';

                    }
                    else {
                        // for home
                        var bob = document.createElement('div');
                        var skills=document.createElement('div');
                        skills.className='res';
                        skills.innerHTML +=self.args.name;
                        for (var i = 0; i < self.args.skill.length; i++)
                            skills.innerHTML += '<div class="skillmap ' + self.args.skill[i] + '"+ ></div>';

                        bob.appendChild(skills);
                        bob.className = 'bubble';
                        div.appendChild(bob);
                        div.style.backgroundImage = "url('images/home.png')";
                        div.style.backgroundSize = "30px 30px";

                    }
                    if (typeof(self.args.dep) !== 'undefined') {
                        div.style.width = '65px';
                        var depdiv = document.createElement('div');
                        depdiv.className = 'dep';
                        depdiv.innerHTML = self.args.dep;
                        depdiv.style.width = '25px';
                        depdiv.style.color = self.args.skill[0];
                        if (self.args.skill[0]=="yellow")
                            depdiv.style.color ="#F9C300";
                        div.appendChild(depdiv);
                    }

                }

                if (typeof(self.args.id) !== 'undefined') {
                    div.innerHTML = self.args.time + "h" + '  ' + div.innerHTML;  //delte this!!!!


                    var e = div;

                    var item = {
                        element: e,
                        id: self.args.id + 1,
                        text: self.args.name,
                        duration: self.args.time * 3600,
                        location: self.args.location,
                        skill: [self.args.skill[0]],
                        time: self.args.time,
                        name: self.args.name

                    };
                    if (typeof(self.args.dep) !== 'undefined') { // for the dependency, no all task have
                        item.dep = self.args.dep;

                    }
                    DayPilot.Scheduler.makeDraggable(item);

                }

                google.maps.event.addDomListener(div, "click", function (event) {
                    google.maps.event.trigger(self, "click");
                });

                var panes = this.getPanes();
                panes.overlayImage.appendChild(div);


            }

            var point = this.getProjection().fromLatLngToDivPixel(this.latlng);

            if (point) {
                div.style.left = point.x + 'px';
                div.style.top = point.y + 'px';
            }
            if (div.id !== undefined) {
                //makeDrag(div.id);
            }
        };

        function initMap() {
            map = new google.maps.Map(document.getElementById('map'), {
                center: {lat: config[country].Center.lat, lng: config[country].Center.lng},
                zoom: 12
            }),
                map.setOptions({
                    draggable: false,
                    zoomControl: true,
                    scrollwheel: false,
                    disableDoubleClickZoom: true
                });


        }

        function setGanntMapHeight() {

            var div = document.getElementById("gantt");
            var size = 3 + $scope.dp.resources.length * 35 + 'px';
            div.style.height = size;

            var divM = document.getElementById("map");
            var sizeM = 'calc(100% - ' + size + ')';
            divM.style.height = sizeM;

        }

        $scope.finish = function finish() {

                var currnttime=new Date(endTime-new Date());
                var gameTime =currnttime.getMinutes()+currnttime.getSeconds()/60;

                $rootScope.gameTime=10-gameTime;
                $rootScope.gameTime=Math.round($rootScope.gameTime * 100) / 100;
                $rootScope.events = $scope.dp.events;

                var list = $rootScope.ans.list;
                var dy = $rootScope.ans.$dY;
                var e7 = $rootScope.ans.$e7;
                $rootScope.ans = angular.copy($scope.dp.events);
                $rootScope.ans.$e7 = e7;
                $rootScope.ans.list = list;
                $rootScope.ans.$dY = dy;


                $rootScope.res = $scope.dp.resources;
                $rootScope.resEvent = resEvent;
                $rootScope.language = language;
                $location.path("/result");
                // $window.location.assign('/result')

        };

        $scope.reset = function () {

                for (var i = $scope.dp.events.list.length - 1; i >= 0; i--) {

                    var e = $scope.dp.events.find($scope.dp.events.list[i].id);
                    if ($scope.dp.events.list[i].name !== undefined) {
                        var args = {};
                        args.e = e;
                        returntomap(args);
                    }

                }


        };

        function setlanguage() {
            $http.get('Json/dictionary.json').then(function (data) {
                var dic = data.data;
                var lan = language;
                document.getElementById("GameP1").innerHTML = dic["GameP1"][language];
                document.getElementById("GameP2").innerHTML = dic["GameP2"][language];
                document.getElementById("GameP3").innerHTML = dic["GameP3"][language];
                document.getElementById("GameP4").innerHTML = dic["GameP4"][language];
                document.getElementById("GameP5").innerHTML = dic["GameP5"][language];
                document.getElementById("GameH1").innerHTML = dic["GameH1"][language];
                document.getElementById("GameH2").innerHTML = dic["GameH2"][language];
                document.getElementById("GameB1").value = dic["GameB1"][language];
                document.getElementById("GameB2").value = dic["GameB2"][language];


            });

        };


        var tick = function () {
            /*
           var time= 600-timePass;
           var min=Math.floor(time / 60);
           var sec =time%60;
           if (sec<10)
               sec= "0"+sec;
           if(min<10)
               min="0"+min;
            $scope.clock =min+":"+sec; // get the current time
            timePass++;
            */
            var currnttime=new Date(endTime-new Date());
            var sec=currnttime.getSeconds();
            var min =currnttime.getMinutes();
            if (min==0 && sec==0)
                $scope.finish();
            if (sec<10)
                sec= "0"+sec;
            if(min<10)
                min="0"+min;
            $scope.clock=min+":"+sec;

            $timeout(tick, $scope.tickInterval); // reset the timer
        };

        function getdata( org, dec){

            var defer=$q.defer();

            var url='/getdata?org='+org+'&dec='+dec;


            $http.get(url).then(function (data) {
                if (directions[org]==undefined)
                 directions[org]={};
                directions[org][dec]=data.data;
                defer.resolve(true);
            },
            function (reason) {

                defer.resolve(false);
            });

            return defer.promise;

        }
        
        function cacheData() {
            var EngAndTaskNames=[];
            for (var i=0;i<jsonEng.eng.length;i++)
                EngAndTaskNames.push(jsonEng.eng[i].name);
            for (var i=0;i<jsonTask.task.length;i++)
                EngAndTaskNames.push(jsonTask.task[i].name);

            for (var i=0;i<EngAndTaskNames.length;i++){
                for (var j=0;j<EngAndTaskNames.length;j++){
                    if (EngAndTaskNames[j]!=EngAndTaskNames[i]){
                        $timeout(null,500);
                        getdata(EngAndTaskNames[i],EngAndTaskNames[j])
                    }

                }

            }

        }



    }
    app.controller("GameCTRL", GameCTRL);


}());



