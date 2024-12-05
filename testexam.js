const express = require("express");

const dtEt = require("./public/dateTime");
const fs = require("fs"); //lubab file systeemis ringi kynda
const app = express();
const dbInfo = require("../../vp2024config"); 
const mysql = require("mysql2");
//paringu lahtiharutamiseks POST paringute puhul
const bodyparser = require("body-parser");
//failide yleslaadimiseks
const session = require("express-session");
//async mitme requsti jaoks korraga et ta teeks k2su 2ra ja ootaks selle l6ppu
const async = require("async");

app.set("view engine", "ejs"); //ejs kaivitub ise aga siin maarame viewengineks ejsi parast expressi appimist
app.use(express.static("public"));//kaivitada func static expressi alt mis teeb kausta public kattesaadavaks
app.use(bodyparser.urlencoded({extended: true})); // paringu URLi parsimine false kui ainult tekst true kui muud ka


//andmebaasiga yhenduse loomines. comad on iga rea taga kuna me paneme eri reale aga tegelt nad on jarjest
const connectionDatabase = mysql.createConnection({
    host: dbInfo.configData.host,
    user: dbInfo.configData.user,
    password: dbInfo.configData.passWord,
    database: dbInfo.configData.dataBase

}); 



const testexamRoutes = require("./routes/testexamRoutes")
app.use("/", testexamRoutes);



app.listen(5101);