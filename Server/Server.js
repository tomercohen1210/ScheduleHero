/**
 * Created by circle on 30/03/17.
 */
var path = require("path");
var router = require(path.join(__dirname,"HTTP/Http.js"))(80, "Game/public");
var info=require('./Data/google/USAData.json');
var fs = require('fs');

router.app.get('/getdata', function (req, res) {

    var dec=req.query.dec;
    var org=req.query.org;


    res.send(info[org][dec]);


});

router.app.post('/writeDetail', function (req, res) {

    var name=req.query.name;
    var lastname=req.query.lastname;
    var company=req.query.company;
    var phone=req.query.phone;
    var title =req.query.title ;
    var email=req.query.email;


    fs.appendFile("./Data/detail.txt", name+","+lastname+","+company+","+email+","+phone+","+title+"\n", function(err) {
        if(err) {
            return console.log(err);
        }

    });

    res.send("success");


});

router.app.post('/writeScore', function (req, res) {

    var event =req.query.event;
    var name=req.query.name;
    var score=req.query.score;
    var company=req.query.company;
    var file ="./Data/events/"+event+".json";
    var highfile="./Data/alltime.json";


    var scores=require(file);
    var top=require(highfile);

    var set = '{"name":"'+name+'","score":'+score+',"company":"'+company+'"}';
    set=JSON.parse(set);
    scores.push(set);
    top.push(set);
    top.sort(compare);
    if(top.length>5){
        top.remove(5);
    }

    fs.writeFile(highfile,JSON.stringify(top));
    fs.writeFile(file,JSON.stringify(scores), function(err) {
        if(err) {
            return console.log(err);
        }
        else{
            res.send("success");
        }

    });


});

function compare(a,b) {
    if (a.score > b.score)
        return -1;
    if (a.score < b.score)
        return 1;
    return 0;
}
router.app.get('/topScores', function (req, res) {



    var file ="./Data/alltime.json";

    var scores=require(file);


    res.send(scores);


});

router.app.get('/highScores', function (req, res) {

    var event =req.query.event;

    var file ="./Data/events/"+event+".json";

    var scores=require(file);


    res.send(scores);


});

router.app.post('/create', function (req, res) {

    var event =req.query.event;

    fs.stat("./Data/events/"+event+".json", function(err, stat) {
        if(err == null) {
            res.send("fail");
        }
        else
        {

            fs.writeFile("./Data/events/"+event+".json","[]", function(err) {
                if(err) {
                    return console.log(err);
                }

            });

            res.send("success");
        }
    });


});

router.app.get('/getEvents', function (req, res) {

    const testFolder = './Data/events/';

    fs.readdir(testFolder, (err, files) => {
        res.send(files);
});



});


