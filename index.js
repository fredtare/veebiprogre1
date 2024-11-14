const express = require("express");

const dtEt = require("./public/dateTime");
const fs = require("fs"); //lubab file systeemis ringi kynda
const app = express();
const dbInfo = require("../../vp2024config"); 
const mysql = require("mysql2");
//paringu lahtiharutamiseks POST paringute puhul
const bodyparser = require("body-parser");
//failide yleslaadimiseks
const multer = require("multer");
//pildi suuruste muutmine
const sharp = require("sharp");
//crypteerimine
const bcrypt = require("bcrypt");
//sessioni salvestamine
const session = require("express-session");

//app session sellega saab panna palju sessiooni parameetreid aga meie paneme kiired oppetoo omad ara
app.use(session({secret: "frescoMagabKaua", saveUninitialized: true, resave: true}));
app.set("view engine", "ejs"); //ejs kaivitub ise aga siin maarame viewengineks ejsi parast expressi appimist
app.use(express.static("public"));//kaivitada func static expressi alt mis teeb kausta public kattesaadavaks
app.use(bodyparser.urlencoded({extended: true})); // paringu URLi parsimine false kui ainult tekst true kui muud ka

//seadistame vahevara - multer fotode laadimiseks x kataloogi
const upload = multer({dest: "./public/gallery/orig/"});


//andmebaasiga yhenduse loomines. comad on iga rea taga kuna me paneme eri reale aga tegelt nad on jarjest
const connectionDatabase = mysql.createConnection({
    host: dbInfo.configData.host,
    user: dbInfo.configData.user,
    password: dbInfo.configData.passWord,
    database: dbInfo.configData.dataBase

}); 
   
const checkLogin = function(req, res, next) {
    if(req.session != 0) {
        if(req.session.userId){
            console.log("login kasutaja: " + req.session.userId);
            next();
        } else {
            console.log("keegi ei olnud sisse loginud");
            res.redirect("/login");
        }
    } else {
        let notice = "Palun logi sisse et sinna ligi p22seda"
        res.redirect("/login");
        console.log("sessiooni ei dekteteeritud ")
    }
};

//kirjeldame kodulehe ara
app.get("/", (req, res) => {
    
    let frontPageNews = [];
    //let frontPagePhoto = [];
    let sqlRequest = "SELECT news_title, news_text, news_date FROM news WHERE expire_date >= (?) ORDER BY id  DESC LIMIT 1";
    //let sqlPhotoRequest = "SELECT file_name, alt_text FROM photos WHERE deleted = 0 and privacy = 3 ORDER BY id DESC LIMIT 1";

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

app.get("/home", checkLogin, (req, res) => {
    let notice = "Tere tulemast tagasi mr anderson!"
    console.log("sees on kasutaja: " + req.session.userId);
    res.render("home", {notice: notice});
});

app.get("/login" , (req, res) => {
    let notice = "";
    res.render("login", {notice:notice});
});

//esilehe sisselogimine
app.post("/login", (req,res) =>{
    let notice = "";
    console.log(req.body);
    if (!req.body.emailInput || !req.body.passwordInput) {
        notice = "Midagi j2i sisestamata!";
        console.log("v2li jai tyhjaks");
        res.render("login", {notice: notice});

    } else {
        //targem oleks esialgu parooli proovida ja siis edasi hakata vaatama muud infot turvalisuse eesm'rgil
        let sqlReq = "SELECT id, password FROM users WHERE email = ?";
        connectionDatabase.execute(sqlReq, [req.body.emailInput], (err, result) =>{

            if (err){
            console.log("viga andmebaasiga suhtlemisel emaili teel" + err);
            notice = "tehniline error andmebaasist emaili saamisega";
            res.render("login", {notice: notice});

            } else {
                if (result[0] != null) {//kuna saab mitu sama emaili olla siis votab ainult esimese vastuse et katsta nt "@gmail.com" sisselogimise vastu 
                    bcrypt.compare(req.body.passwordInput, result[0].password, (err, compareResult) =>{

                        if (err) {
                            notice = "tehniline viga, sisse logida ei saa"
                            res.render("login", {notice: notice});        

                        } else {  //kas tuli oige v vale parool
                             if (compareResult) {
                                notice = "Teretulemast! Olete Sisse Loginud!"
                                req.session.userId = result[0].id;
                                res.redirect("/home");

                             } else {
                                notice = "KT ja/voi parool vale!"
                                res.render("login", {notice: notice});
                             } //parool happy end
                        }
                    }); //parooli kontrolli lopp

                } else {
                    notice = "KT ja/voi parool vale!"
                    res.render("login", {notice: notice});
                } //email bad end
            }
        });  //saadame emaili kontrolli
    } //valjad taidetud lopp

});

//logime v2lja
app.get("/logout", (req, res) => {
    req.session.destroy();
    console.log("sess termineeritud");
    res.redirect("/");
});

//regamise l6bud
app.get("/register", (req, res)=> {
    res.render("signup");
});

app.post("/register", (req, res) =>{
    
    let notice = "ootan andmeid"
    console.log(req.body); //piilume mis see veebisait meile v2lja sylgab

    if(!req.body.firstNameInput || !req.body.lastNameInput || !req.body.birthDateInput || !req.body.genderInput || !req.body.emailInput || !req.body.passwordInput || req.body.passwordInput.lenght < 8 || req.body.passwordInput !== req.body.confirmPasswordInput) {
       
        notice = "Osa infot sisestamata v6i parool liiga lyhike v6i paroolid ei kattu v6i kuufaaside ebasobivus teie tegevustega"
        res.render("signup", {notice: notice});
        
    } else {

        notice = "Andmed korras!";
        //teeme parooli hashi
        //genereerime soola, parameetrid: 10 astmeline krypt, 
        bcrypt.genSalt(10, (err, salt)  => {

            if (err) {
                notice = "tehniline viga parooli soolamisel, kasutajat ei loodud!";
                res.render("signup", {notice: notice});
            } else { //nyyd krypteerime. Arvesta et nested callback on vaaaga halb stiil

                bcrypt.hash(req.body.passwordInput, salt, (err, pwdHash) =>{
                    if (err) {
                        notice = "tehniline viga parooli hashimisel, kasutaja loomise feil";
                        res.render("signup", {notice: notice});
                    } else {
                   
                        let sqlAccountRequest = "INSERT INTO users (first_name, last_name, birth_date, gender, email, password) VALUES (?, ?, ?, ?, ?, ?)";
                        connectionDatabase.execute(sqlAccountRequest, [req.body.firstNameInput, req.body.lastNameInput, req.body.birthDateInput, req.body.genderInput, req.body.emailInput, pwdHash], (err, result) =>{

                            if (err){
                                console.log(err)
                                notice = "tehniline viga andmebaasi kirjutamisel";
                                res.render("signup", {notice: notice});
                            } else {
                            notice = "konto " + req.body.emailInput + " loodud!";
                            res.render("signup", {notice: notice});
                            }
                        }); //.execute() testib andmebaasi yhendust ja kas see kask yldse eksisteerib ja siis laseb k2iku
                    }
                }); //hashi lopp
            }
        }); //gensalt loppeb
    }
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
    let sqlRequest = "SELECT news_title, news_text, news_date, expire_date, user_id, first_name, last_name FROM news INNER JOIN users ON news.user_id = users.id WHERE expire_date >= (?) ORDER BY news.id DESC";
    //let sqlRequest = "SELECT news_title, news_text, news_date, expire_date, user_id FROM news WHERE expire_date >= (?) ORDER BY id DESC";
    //see on tootav sqlrequest. kasuta h2dajuhtumitel

    connectionDatabase.query(sqlRequest, [dtEt.timeUnFormatted()], (err, sqlres) => {

        if (err) {
            throw err;

        } else {
            for (let i = 0; i < sqlres.length; i++) {
                latestNews.push({ newsTitle: sqlres[i].news_title, newsText: sqlres[i].news_text, newsDate: dtEt.givenDateFormatted(sqlres[i].news_date), first_name: sqlres[i].first_name + " " + sqlres[i].last_name }); 
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
            let sqlRequest = "INSERT INTO news (news_title, news_text, expire_date, user_id) values(?,?,?,?)";
            connectionDatabase.query(sqlRequest, [req.body.newsTitleInput, req.body.newsInput, dtEt.defaultExpireDate(), req.session.userId]), (err, sqlres) => {
                if (err) {
                    throw err;
                } else {
                    console.log(sqlRequest);
                    notice = "Uudised on laetud pilve!"
                    res.render("addnews", { notice: notice, newsTitleTemp: newsTitleTemp, newsTextTemp: newsTextTemp });
                }
            };
        } else {
            let sqlRequest = "INSERT INTO news (news_title, news_text, expire_date, user_id) VALUES(?,?,?,1)";
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


    
//regvisit aga databaaasi-------------------------------------------------------------------------------------

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


//fotoupload --------------------------------------------------------------------------------------------------------
app.get("/photoupload", (req, res) =>{
    let notice = "";
    res.render("photoupload", {notice: notice});
});

//req resi ees on vahevara milleks on see multer mis liigutab foto vahekausta ja votab sealt ja paneb oigesse kausta faili. Aga see fail on uue temp nimega mis on suvaline
app.post("/photoupload", upload.single("photoInput"), (req, res) =>{
    
    console.log(req.body);
    console.log(req.file);
    let notice = "";
    // genereeerime ise failinimee. Tegelikult reaalsuses peaksime ka kontrollima mida meile serverisse topitakse.
    const fileName = "vp_" + Date.now() + ".jpeg";
    //nimetame temp failnimega faili ymber
    fs.rename(req.file.path, req.file.destination + fileName, (err) =>{
        console.log(err);
    });

   
   
        if (!req.body.photoAltInput) {
            notice = "Alt tekst j2i sisestamata!"
            res.render("photoupload", {notice: notice});
            console.log(notice);

        } else {
            let sqlRequest = "INSERT INTO photos (file_name, orig_name, alt_text, user_id, privacy) VALUES(?,?,?,?,?)"
            connectionDatabase.query(sqlRequest, [fileName, req.file.originalname, req.body.photoAltInput, req.session.userId, req.body.privacyInput], (err, result)=>{
             //arva arva mis siin toimub. P2ris programmis me peaks arvestama ka vaiksemate piltide ja igasuguste erijuhtudega 
            sharp(req.file.destination + fileName).resize(480,720).jpeg({quality: 70}).toFile("./public/gallery/normal/" + fileName);
            sharp(req.file.destination + fileName).resize(100,100).jpeg({quality: 50}).toFile("./public/gallery/thumbnail/" + fileName);
             //talleteerime andmebaasi! Kysimargid seome kindlate vaartustega . ? definitsioon peab alati olema muutuja

                if (err){
                    throw err;
                } else {
                    notice = "Pilt on yles laetud!"
                    res.render("photoupload", {notice: notice});
                    }
             });
        }
});

//fotogaalleriii----------------------------------------------------------------------------------------------
app.get("/photogallery", (req, res) => {
    let photos = [];
    let sqlRequest = "SELECT file_name, alt_text FROM photos WHERE privacy = ? AND deleted IS NULL ORDER BY id DESC";
    const privacy = 3;

    connectionDatabase.query(sqlRequest, [privacy], (err, sqlres) => {

        if (err) {
            throw err;

        } else {

            console.log(sqlres);
            for (let i = 0; i < sqlres.length; i++) {
                photos.push({file_name: sqlres[i].file_name, alt_text: sqlres[i].photoAltInput_text, href: "gallery/thumbnail/" + sqlres[i].file_name}); 

            }
       res.render("photogallery", { photos: photos });
        }      
    });
});

app.listen(5101);