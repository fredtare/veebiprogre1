const express = require("express");
const router = express.Router(); //Suur R on oluline
const dbInfo = require("../../../vp2024config"); 
const mysql = require("mysql2");
const generalFnc =  require("../generalFnc.js");
const dtEt = require("../public/dateTime");
const bcrypt = require("bcrypt");

//andmebaasiga yhenduse loomines. comad on iga rea taga kuna me paneme eri reale aga tegelt nad on jarjest
const connectionDatabase = mysql.createConnection({
    host: dbInfo.configData.host,
    user: dbInfo.configData.user,
    password: dbInfo.configData.passWord,
    database: dbInfo.configData.dataBase

}); 
   

//@desc home page for logged in users
//@route GET  /home
//@access private

const userHome = (req, res) => {

    let userName = req.session.userName
    let notice = "Tere tulemast tagasi mr anderson!"
    console.log("sees on kasutaja: " + req.session.userId + req.session.userName);
    res.render("home", {notice: notice, userName: userName});
};

//@desc logout page
//@route GET  /logout
//@access private

const logOut = (req, res) => {
    req.session.destroy();
    console.log("sess termineeritud");
    res.redirect("/");
}

module.exports = {

    userHome,
    logOut

};