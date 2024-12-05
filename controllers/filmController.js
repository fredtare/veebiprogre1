const express = require("express");
const router = express.Router(); //Suur R on oluline
const dbInfo = require("../../../vp2024config"); 
const mysql = require("mysql2");
const generalFnc =  require("../generalFnc.js");
const dtEt = require("../public/dateTime");
const async = require("async");

//andmebaasiga yhenduse loomines. comad on iga rea taga kuna me paneme eri reale aga tegelt nad on jarjest
const connectionDatabase = mysql.createConnection({
    host: dbInfo.configData.host,
    user: dbInfo.configData.user,
    password: dbInfo.configData.passWord,
    database: dbInfo.configData.dataBase

}); 
   

//@desc film homepage
//@route GET  /filmindex
//@access private

const filmHome =  (req, res)=>{
    res.render("filmindex");
};

//@desc movie characters page
//@route GET  /tegelased
//@access private

const filmTegelased = (req, res)=>{
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
};

//@desc movie person submit page
//@route GET /personsubmit
//@access private

const filmPersonSubmit = (req, res) => {
    let userName = req.session.userName
    let notice = "";
    res.render("personsubmit", {notice: notice, userName: userName});
};

//@desc movie person submit page
//@route POST /personsubmit
//@access private


 const filmPersonSubmitPost = (req, res) => {
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
    };

//@desc movie table relatioship page
//@route GET /addrelations
//@access private

const filmRelations = (req,res) =>{
    //votan async mooduli et korraga teha mitut andmebaasi p2ringut
    const filmQueries = [
        function(callback) {
            let sqlReq1 = "SELECT id, first_name, last_name, birth_date FROM person";
            connectionDatabase.execute(sqlReq1, (err, result) =>{

                if (err){
                    return callback(err)

                } else {
                    return callback(null, result);
                }
            });
        }, 
        function(callback) {
            let sqlReq2 = "SELECT id, title, production_year  FROM movie";
            connectionDatabase.execute(sqlReq2, (err, result) =>{

                if (err){
                    return callback(err)

                } else {
                    return callback(null, result);
                }
            });
        },
        function(callback) {
            let sqlReq3 = "SELECT id, position_name FROM position";
            connectionDatabase.execute(sqlReq3, (err, result) =>{

                if (err){
                    return callback(err)

                } else {
                    return callback(null, result);
                }
            });
        },           
    ];

    //paneme eelmainitud p2ringud k2ima korraga. tulemus on 3 p2ringu koondus
    async.parallel(filmQueries, (err, results) => {

        if (err) {
            console.log(err);

        } else {
            res.render("addrelations", {personList: results[0], filmList: results[1], positionList: results[2]});
        }
    });
};

//@desc movie table relatioship page
//@route POST /addrelations
//@access private

const filmRelationsPost = (req,res) =>{
    console.log(req.body);

    let sqlRequest = "INSERT INTO person_in_movie (person_id, movie_id, position_id, role) VALUES (?, ?, ?, ?)";
    connectionDatabase.query(sqlRequest, [req.body.personSelect, req.body.movieSelect, req.body.positionSelect, req.body.roleInput], (err, sqlres) => {
            if (err) {
                throw err;
            } else {
                console.log(sqlres);

                notice = "roll on lisatud!";
                res.render("filmindex", { notice: notice });
            }
        });

};

//@desc movie table relatioship page
//@route GET /addrelations
//@access private



module.exports = {

    filmHome,
    filmTegelased,
    filmPersonSubmit,
    filmPersonSubmitPost,
    filmRelations,
    filmRelationsPost



};