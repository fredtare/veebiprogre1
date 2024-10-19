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
app.get("/", (req, res) => {
    
    let frontPageNews = [];
    let sqlRequest = "SELECT news_title, news_text, news_date FROM news WHERE expire_date >= (?) ORDER BY id  DESC LIMIT 1";

    connectionDatabase.query(sqlRequest, [dtEt.timeUnFormatted()], (err, sqlres) => {
        if (err) {
            throw err;

        } else {

            for (i = 0; i < sqlres.length; i++) {
                frontPageNews.push({ newsTitle: sqlres[i].news_title, newsText: sqlres[i].news_text, newsDate: dtEt.givenDateFormatted(sqlres[i].news_date) });
                    res.render("index", { frontPageNews: frontPageNews, timeElapsed: dtEt.timeElapsed("9-2-2024") });
            }
        }
    
    });

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
            //persons = sqlres; vana displeiviis mis pani koik kokku
            
            //for loop mis terve sqlres.lenght. Ta sylitab terve tabeli requesti ja length on terve tabeli pikkus. pikkuse jooksul muudab iga elemendi inimloetavaks
            //tsykkel votab iga loopiga yhe objekti ja topib selle listile objekt juurde {first_name: sql.res[i].first_name}
            //push.persons(lisatav element); push paneb massivil]ppu juurde
           for (let i = 0; i < sqlres.length; i++){
                persons.push({first_name: sqlres[i].first_name, last_name: sqlres[i].last_name, birth_date: dtEt.givenDateFormatted(sqlres[i].birth_date)});   
            }
            res.render("tegelased", {persons: persons});
        }
    });
});

//kylaliste registreerimise sait aga databaasi
app.get("/regvisitdb", (req, res)=>{

    let notice = "";
    let firstNameTemp = "";
    let lastNameTemp = "";

    res.render("regvisitdb", {notice: notice, firstNameTemp: firstNameTemp, lastNameTemp: lastNameTemp});
});


app.get("/eestifilm/personsubmit", (req, res) => {
    let notice = "";
    res.render("personsubmit", {notice: notice});
});

app.post("/eestifilm/personsubmit", (req, res) => {
    let notice = "";


        //Eraldame iga lahtri oma sqlrequestiks kuna ei ole sama tabel. Alsutame filmsubmit
    if (req.body.filmSubmit) {
        let sqlRequest = "INSERT INTO movie (title) VALUES (?)"
        connectionDatabase.query(sqlRequest, [req.body.filmSubmit], (err, sqlres) => {
                if (err) {
                    throw err;
                } else {
                    notice = "Film on lisatud!";
                    res.render("personsubmit", { notice: notice });
                }
            });

        } else if (req.body.characterSubmit) {
            let sqlRequest = "INSERT INTO person_in_movie (role) VALUES (?)";
            connectionDatabase.query(sqlRequest, [req.body.characterSubmit], (err, sqlres) => {
                if (err) {
                    throw err;
                } else {
                    notice = "Tegelane on lisatud!"
                    res.render("personsubmit", { notice: notice });
                }

            });


        } else if (req.body.positionSubmit) {
            let sqlRequest = "INSERT INTO position (position_name) VALUES (?)";
            connectionDatabase.query(sqlRequest, [req.body.positionSubmit], (err, sqlres) => {
                if (err) {
                    throw err;
                } else {
                    notice = "Positsioon on salvestatud!"
                    res.render("personsubmit", { notice: notice });
                }
            });
        }
    });

app.get("/news", (req, res) => {
    let latestNews = [];
    let sqlRequest = "SELECT news_title, news_text, news_date, expire_date FROM news WHERE expire_date >= (?) ORDER BY id DESC";

    connectionDatabase.query(sqlRequest, [dtEt.timeUnFormatted()], (err, sqlres) => {

        if (err) {
            throw err;

        } else {
            for (let i = 0; i < sqlres.length; i++) {
                latestNews.push({ newsTitle: sqlres[i].news_title, newsText: sqlres[i].news_text, newsDate: dtEt.givenDateFormatted(sqlres[i].news_date) }); 
            }
       res.render("news", { latestNews: latestNews });
        }      
    });
});

app.get("/news/addnews", (req, res) => {
    let notice = "";
    let newsTitleTemp = "";
    let newsTextTemp = "";
    res.render("addnews", {notice: notice, newsTitleTemp: newsTitleTemp, newsTextTemp: newsTextTemp});
});

app.post("/news/addnews", (req, res) => {
    let notice = "";
    let newsTitleTemp = "";
    let newsTextTemp = "";

    if (!req.body.newsTitleInput || !req.body.newsInput || !req.body.expireInput) {

        notice = "osa andmeid sisestamata!"
        let newsTitleTemp = req.body.newsTitleInput;
        let newsTextTemp = req.body.newsInput;
        res.render("addnews", { notice: notice, newsTitleTemp: newsTitleTemp, newsTextTemp: newsTextTemp });

        if (!req.body.expireInput) {
            let sqlRequest = "INSERT INTO news (news_title, news_text, expire_date, user_ID) values(?,?,?,1)";
            connectionDatabase.query(sqlRequest, [req.body.newsTitleInput, req.body.newsInput, dtEt.defaultExpireDate()]), (err, sqlres) => {
                if (err) {
                    throw err;
                } else {
                    console.log(sqlRequest);
                    notice = "Uudised on laetud pilve!"
                    res.render("addnews", { notice: notice, newsTitleTemp: newsTitleTemp, newsTextTemp: newsTextTemp });
                }
            };
        } else {
            let sqlRequest = "INSERT INTO news (news_title, news_text, expire_date, user_ID) VALUES(?,?,?,1)";
            connectionDatabase.query(sqlRequest, [req.body.newsTitleInput, req.body.newsInput, req.body.expireInput], (err, sqlres) => {

                if (err) {
                    throw err;

                } else {
                    console.log(sqlRequest);
                    notice = "Uudised on laetud pilve!"
                    res.render("addnews", { notice: notice, newsTitleTemp: newsTitleTemp, newsTextTemp: newsTextTemp });
                }
            });
        }
    }
});


    



app.post("/regvisitdb", (req, res) => {
    let notice = "";
    let firstNameTemp = "";
    let lastNameTemp = "";

    if (!req.body.firstNameInput || !req.body.lastNameInput) {
        notice = "Osa andmeid sisestamata!";
        let firstNameTemp = req.body.firstNameInput;
        let lastNameTemp = req.body.lastNameInput;
        res.render("regvisitdb", { notice: notice, firstNameTemp: firstNameTemp, lastNameTemp: lastNameTemp });
    }
    else {
        let sqlRequest = "INSERT INTO vp1visitlog (first_name, last_name) VALUES (?, ?)";
        
        connectionDatabase.query(sqlRequest, [req.body.firstNameInput, req.body.lastNameInput], (err, sqlres) => {
            if (err) {
                throw err;
            } else {
                notice = "Teiega voetakse voidu korral yhendust...";
                res.render("regvisitdb", { notice: notice, firstNameTemp: firstNameTemp, lastNameTemp, lastNameTemp });
            }
        });
    }
});

app.listen(5101);