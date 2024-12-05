const express = require("express");
const router = express.Router(); //Suur R on oluline
const dbInfo = require("../../../vp2024config"); 
const mysql = require("mysql2");
const generalFnc =  require("../generalFnc.js");
const dtEt = require("../public/dateTime");

//andmebaasiga yhenduse loomines. comad on iga rea taga kuna me paneme eri reale aga tegelt nad on jarjest
const connectionDatabase = mysql.createConnection({
    host: dbInfo.configData.host,
    user: dbInfo.configData.user,
    password: dbInfo.configData.passWord,
    database: dbInfo.configData.dataBase

}); 
   

//@desc home page for new section
//@route GET  /news
//@access private

const newsHome = (req, res) => {
    let userName = req.session.userName
       res.render("news", { userName: userName });

    };

//@desc =page for adding news
//@route GET  /news/addnews
//@access private

const newsAdd = (req, res) => {
    let notice = "";
    let userName = req.session.userName
    let newsTitleTemp = "";
    let newsTextTemp = "";
    res.render("addnews", {notice: notice, newsTitleTemp: newsTitleTemp, newsTextTemp: newsTextTemp, userName: userName});
};

//@desc =page for adding news
//@route POST  /news/addnews
//@access private

const newsPost = (req, res) => {
    let notice = "";
    let newsTitleTemp = "";
    let newsTextTemp = "";
    let userName = req.session.userName

    if (!req.body.newsTitleInput || !req.body.newsInput || !req.body.expireInput) {

        notice = "osa andmeid sisestamata!"
        let newsTitleTemp = req.body.newsTitleInput;
        let newsTextTemp = req.body.newsInput;
        res.render("addnews", { notice: notice, newsTitleTemp: newsTitleTemp, newsTextTemp: newsTextTemp });

    } else if (!req.body.expireInput) {
            let sqlRequest = "INSERT INTO news (news_title, news_text, expire_date, user_id) values(?,?,?,?)";
            let newsTextTemp = "";
            let newsTitleTemp = "";
            connectionDatabase.query(sqlRequest, [req.body.newsTitleInput, req.body.newsInput, dtEt.defaultExpireDate(), req.session.userId]), (err, sqlres) => {

                if (err) {
                    throw err;
                } else {
                    console.log(sqlRequest);
                    notice = "Uudised on laetud pilve!"
                    res.render("addnews", { notice: notice, newsTitleTemp: newsTitleTemp, newsTextTemp: newsTextTemp, userName: userName });
                }
            };
    } else {

            let sqlRequest = "INSERT INTO news (news_title, news_text, expire_date, user_id) VALUES(?,?,?,?)";
            let newsTitleTemp = "";
            let newsTextTemp = "";
            connectionDatabase.query(sqlRequest, [req.body.newsTitleInput, req.body.newsInput, req.body.expireInput, req.session.userId]), (err, sqlres) => {

                if (err) {
                    throw err;

                } else {
                    console.log(sqlRequest);
                    notice = "Uudised on laetud pilve!"
                    res.render("addnews", { notice: notice, newsTitleTemp: newsTitleTemp, newsTextTemp: newsTextTemp, userName: userName });
                }
            };
        }
};


//@desc  page for reading news
//@route GET  /news/readNews
//@access private

const newsRead = (req, res) => {
    let latestNews = [];
    let userName = req.session.userName
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
       res.render("readnews", { latestNews: latestNews, userName: userName });
        }      
    });
};

module.exports = {

    newsHome,
    newsRead,
    newsAdd,
    newsPost

};