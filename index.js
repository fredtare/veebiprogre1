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
//async mitme requsti jaoks korraga et ta teeks k2su 2ra ja ootaks selle l6ppu
const async = require("async");


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



const indexRoutes = require("./routes/indexRoutes")
app.use("/", indexRoutes);

const newsRoutes = require("./routes/newsRoutes");
app.use("/news", newsRoutes);

const homeRoutes = require("./routes/homeRoutes");
app.use("/home", homeRoutes);

const filmRoutes = require("./routes/filmRoutes");
app.use("/eestifilm", filmRoutes);

const photoRoutes = require("./routes/photoRoutes");
app.use("/photogallery", photoRoutes);


app.listen(5101);