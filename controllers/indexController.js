const express = require("express");
const router = express.Router(); //Suur R on oluline
const dbInfo = require("../../../vp2024config"); 
const mysql = require("mysql2");
const generalFnc =  require("../generalFnc.js");
const dtEt = require("../public/dateTime");
const fs = require("fs"); //lubab file systeemis ringi kynda
const bcrypt = require("bcrypt");

//andmebaasiga yhenduse loomines. comad on iga rea taga kuna me paneme eri reale aga tegelt nad on jarjest
const connectionDatabase = mysql.createConnection({
    host: dbInfo.configData.host,
    user: dbInfo.configData.user,
    password: dbInfo.configData.passWord,
    database: dbInfo.configData.dataBase

}); 
   

//@desc home page 
//@route GET  /
//@access pub

const indexRoot = (req, res) => {
    
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
            }
        res.render("index", { frontPageNews: frontPageNews, timeElapsed: dtEt.timeElapsed("9-2-2024") });
        }
    
    });

}

//@desc page for regging user
//@route GET  /register
//@access pub

const userRegister = (req, res)=> {
    let firstNameTemp = "";
    let lastNameTemp = "";
    let birthDateTemp = "";
    let emailInputTemp  =  "";
 
    res.render("signup", {firstNameTemp: firstNameTemp, lastNameTemp: lastNameTemp, birthDateTemp: birthDateTemp, emailTemp: emailInputTemp});
};

//@desc page for regging
//@route post  /register
//@access pub

const userRegisterPost = (req, res) =>{

    let firstNameTemp = "";
    let lastNameTemp = "";
    let birthDateTemp = "";
    let emailInputTemp  =  "";
    
    let notice = "ootan andmeid"
    console.log(req.body); //piilume mis see veebisait meile v2lja sylgab
    let sqlEmailReq = "SELECT email FROM users WHERE email = ?"
    connectionDatabase.query(sqlEmailReq, [req.body.emailInput], (err, emailRes)=>{

        if(emailRes != null){
            notice = "Ole oma emailiga originaalsem"
            res.render("signup", {notice:notice, firstNameTemp: firstNameTemp, lastNameTemp: lastNameTemp, birthDateTemp: birthDateTemp, emailTemp: emailInputTemp});

        }else{ 
            if(!req.body.firstNameInput || !req.body.lastNameInput || !req.body.birthDateInput || !req.body.genderInput || !req.body.emailInput || !req.body.passwordInput || req.body.passwordInput.lenght < 8 || req.body.passwordInput !== req.body.confirmPasswordInput) {
                let firstNameTemp = req.body.firstNameInput;
                let lastNameTemp = req.body.lastNameInput;
                let birthDateTemp = req.body.birthDateInput;
                let emailInputTemp  =  req.body.emailInput;
                notice = "Osa infot sisestamata v6i parool liiga lyhike v6i paroolid ei kattu v6i kuufaaside ebasobivus teie tegevustega"
                res.render("signup", {notice: notice, firstNameTemp: firstNameTemp, lastNameTemp: lastNameTemp, birthDateTemp: birthDateTemp, emailTemp: emailInputTemp});
                
            } else {

                notice = "Andmed korras!";
                //teeme parooli hashi
                //genereerime soola, parameetrid: 10 astmeline krypt, 
                bcrypt.genSalt(10, (err, salt)  => {

                    if (err) {
                        notice = "tehniline viga parooli soolamisel, kasutajat ei loodud!";
                        res.render("signup", {notice: notice, firstNameTemp: firstNameTemp, lastNameTemp: lastNameTemp, birthDateTemp: birthDateTemp, emailTemp: emailInputTemp});
                    } else { //nyyd krypteerime. Arvesta et nested callback on vaaaga halb stiil

                        bcrypt.hash(req.body.passwordInput, salt, (err, pwdHash) =>{
                            if (err) {
                                notice = "tehniline viga parooli hashimisel, kasutaja loomise feil";
                                res.render("signup", {notice: notice, firstNameTemp: firstNameTemp, lastNameTemp: lastNameTemp, birthDateTemp: birthDateTemp, emailTemp: emailInputTemp});
                            } else {
                        
                                let sqlAccountRequest = "INSERT INTO users (first_name, last_name, birth_date, gender, email, password) VALUES (?, ?, ?, ?, ?, ?)";
                                connectionDatabase.execute(sqlAccountRequest, [req.body.firstNameInput, req.body.lastNameInput, req.body.birthDateInput, req.body.genderInput, req.body.emailInput, pwdHash], (err, result) =>{

                                    if (err){
                                        console.log(err)
                                        notice = "tehniline viga andmebaasi kirjutamisel";
                                        res.render("signup", {notice: notice, firstNameTemp: firstNameTemp, lastNameTemp: lastNameTemp, birthDateTemp: birthDateTemp, emailTemp: emailInputTemp});
                                    } else {
                                    notice = "konto " + req.body.emailInput + " loodud!";
                                    res.render("signup", {notice: notice, firstNameTemp: firstNameTemp, lastNameTemp: lastNameTemp, birthDateTemp: birthDateTemp, emailTemp: emailInputTemp});
                                    }
                                }); //.execute() testib andmebaasi yhendust ja kas see kask yldse eksisteerib ja siis laseb k2iku
                            }
                        }); //hashi lopp
                    }
                }); //gensalt loppeb
            }
        }
    });//emaili testi lopp
};

//@desc page for logging in
//@route GET  /login
//@access pub

const userLogin = (req, res) => {
    let notice = "";
    res.render("login", {notice:notice});
}

//@desc page for  posting logging in
//@route post /login
//@access pub

const userLoginPost = (req,res) =>{
    let notice = "";
    console.log(req.body);
    if (!req.body.emailInput || !req.body.passwordInput) {
        notice = "Midagi j2i sisestamata!";
        console.log("v2li jai tyhjaks");
        res.render("login", {notice: notice});

    } else {
        //targem oleks esialgu parooli proovida ja siis edasi hakata vaatama muud infot turvalisuse eesm'rgil
        let sqlReq = "SELECT id, password, first_name, last_name FROM users WHERE email = ?";
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
                                req.session.userName = result[0].first_name + " " + result[0].last_name;
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

}

//@desc page for timenow
//@route GET  /timenow
//@access pub

const timeNow = (req, res)=> {
    const weekdayNow = dtEt.weekDayEt();  //vota sealt datetime failist weekday funktsioon ja anna vastus
    const dateNow = dtEt.dateEt();
    const timeNow = dtEt.timeFormattedEt();
    const dayPartNow = dtEt.partOfDay();
    res.render("timenow",{weekdayCurrent: weekdayNow, dateCurrent: dateNow, timeCurrent: timeNow, dayPartCurrent: dayPartNow});
};


//kribab valja koik kes vanasonades kirjas
const vanaSonad = (req, res)=>{
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
};

//@desc page for regging visit 2 datab
//@route GET  /regvisitdb
//@access pub

const regVisit = (req, res)=>{
    //res.send("express funkab ju");
    res.render("regvisit");
};

//@desc page for regging visit 2 datab
//@route GET  /regvisitdb
//@access pub

const regVisitPost = (req, res) => {
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
}


//@desc page for regging visit 2 datab
//@route GET  /regvisitdb
//@access pub

const regVisitDB = (req, res)=>{

    let notice = "";
    let firstNameTemp = "";
    let lastNameTemp = "";

    res.render("regvisitdb", {notice: notice, firstNameTemp: firstNameTemp, lastNameTemp: lastNameTemp});
}

//@desc page for posting visit 2 datab
//@route post /regvisitdb
//@access pub

const regVisitDBPost = (req, res) => {
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
}

//@desc =page for visitlog
//@route get /visitlog
//@access pub

const visitLog = (req, res) => { 
    let visitLog = []; //las visitlog olla tyhi hulk
    fs.readFile("public/textfiles/visitlog.txt", "utf8", (err, data) => { 
        if (err) {
            throw err;
        } else {
            visitLog = data.split(";");
            res.render("visitlog", {h2: "visitlog", listData: visitLog });
        }
    });
};

module.exports = {

    indexRoot,
    userLogin,
    userLoginPost,
    userRegister,
    userRegisterPost,
    regVisit,
    regVisitPost,
    regVisitDB,
    regVisitDBPost,
    vanaSonad,
    visitLog,
    timeNow

};