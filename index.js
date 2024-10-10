const express = require("express");
const dtEt = require("./public/dateTime");
const fs = require("fs"); //lubab file systeemis ringi kynda
const app = express();
const dbInfo = require("../../vp2024config"); 
const mysql = require("mysql2");
//paringu lahtiharutamiseks POST paringute puhul
const bodyparser = require("body-parser");

app.set("view engine", "ejs"); //ejs kaivitub ise aga siin maarame viewengineks ejsi parast expressi appimist
app.use(express.static("public"));//kaivitada func static expressi alt mis teeb kausta public kattesaadavaks
app.use(bodyparser.urlencoded({extended: false})); // paringu URLi parsimine false kui ainult tekst true kui muud ka

//andmebaasiga yhenduse loomines. comad on iga rea taga kuna me paneme eri reale aga tegelt nad on jarjest
const connectionDatabase = mysql.createConnection({
    host: dbInfo.configData.host,
    user: dbInfo.configData.user,
    password: dbInfo.configData.passWord,
    database: dbInfo.configData.dataBase

}); 


//kirjeldame kodulehe ara
app.get("/", (req, res)=>{
    //res.send("express funkab ju");
    res.render("index");
});


//teeme timenow alalehe
app.get("/timenow", (req, res)=> {
    const weekdayNow = dtEt.weekDayEt();  //vota sealt datetime failist weekday funktsioon ja anna vastus
    const dateNow = dtEt.dateEt();
    const timeNow = dtEt.timeFormattedEt();
    const dayPartNow = dtEt.partOfDay();
    res.render("timenow",{weekdayCurrent: weekdayNow, dateCurrent: dateNow, timeCurrent: timeNow, dayPartCurrent: dayPartNow});
});


//kribab valja koik kes vanasonades kirjas
app.get("/vanasonad", (req, res)=>{
    let folkWisdom = [];
    fs.readFile("public/textfiles/vanasonad.txt", "utf8", (err, data)=>{
        if(err){
            throw err; 
        }
        else {
            folkWisdom = data.split(";");
            //saadab lehele justlist nimekirja dataga folkWisdom.txt
            res.render ("justlist", {h2: "Vanasonad", listData: folkWisdom});
        }
    });
});

//kylaliste registreerimise sait
app.get("/regvisit", (req, res)=>{
    //res.send("express funkab ju");
    res.render("regvisit");
});
app.post("/regvisit", (req, res) => {
    const weekdayNow = dtEt.weekDayEt();
    const dateNow = dtEt.dateEt();
    const timeNow = dtEt.timeFormattedEt();


    console.log(req.body);
    fs.open("public/textfiles/visitlog.txt", "a", (err, file) => {
        if (err) {
            throw err;
        }
        else {
            fs.appendFile("public/textfiles/visitlog.txt", weekdayNow + " " + dateNow + " " + timeNow + " " + req.body.firstNameInput + " " + req.body.lastNameInput + " ; ", (err) => {
                if (err) {
                    throw err;
                }
                else {
                    console.log("file write successful");
                    res.render("regvisit");
                }
            });
        };
    });
});


//kylaliste raamat
app.get("/visitlog", (req, res) => { 
    let visitLog = []; //las visitlog olla tyhi hulk
    fs.readFile("public/textfiles/visitlog.txt", "utf8", (err, data) => { 
        if (err) {
            throw err;
        } else {
            visitLog = data.split(";");
            res.render("visitlog", {h2: "visitlog", listData: visitLog });
        }
    });
});

app.get("/eestifilm", (req, res)=>{
    res.render("filmindex");
});

app.get("/eestifilm/tegelased", (req, res)=>{
    let sqlRequest = "SELECT first_name, last_name, birth_date FROM person";
    let persons = [];
    connectionDatabase.query(sqlRequest, (err, sqlres)=>{
        if (err) {
            throw err;
        } else {
            persons = sqlres;
            res.render("tegelased", {persons: persons});
        }
    });
});

//kylaliste registreerimise sait
app.get("/regvisitdb", (req, res)=>{

    let notice = "";
    let firstNameTemp = "";
    let lastNameTemp = "";

    res.render("regvisitdb", {notice: notice, firstNameTemp: firstNameTemp, lastNameTemp: lastNameTemp});
});

app.post("/regvisitdb", (req, res)=>{
    let notice = "";
    let firstNameTemp = "";
    let lastNameTemp = "";

    if(!req.body.firstNameInput || !req.body.lastNameInput) {
        notice = "Osa andmeid sisestamata!";
        let firstNameTemp = req.body.firstNameInput;
        let lastNameTemp = req.body.lastNameInput;
        res.render("regvisitdb", {notice: notice, firstNameTemp: firstNameTemp, lastNameTemp: lastNameTemp});
    }
    else {
    let sqlRequest = "INSERT INTO vp1visitlog (first_name, last_name) VALUES (?, ?)";
    connectionDatabase.query(sqlRequest, [req.body.firstNameInput, req.body.lastNameInput], (err, sqlres)=>{
        if (err) {
            throw err;
        } else {
            notice = "Teiega voetakse voidu korral yhendust...";
            res.render("regvisitdb", {notice: notice, firstNameTemp: firstNameTemp, lastNameTemp, lastNameTemp});
        }
    });
    }
});
app.listen(5101);