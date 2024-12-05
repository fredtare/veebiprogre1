const express = require("express");
const router = express.Router(); //Suur R on oluline
const dbInfo = require("../../../vp2024config"); 
const mysql = require("mysql2");
const generalFnc =  require("../generalFnc.js");
const dtEt = require("../public/dateTime");
const multer = require("multer");
const upload = multer({dest: "../public/gallery/orig/"});
const async = require("async");

//andmebaasiga yhenduse loomines. comad on iga rea taga kuna me paneme eri reale aga tegelt nad on jarjest
const connectionDatabase = mysql.createConnection({
    host: dbInfo.configData.host,
    user: dbInfo.configData.user,
    password: dbInfo.configData.passWord,
    database: dbInfo.configData.dataBase

}); 
   
//@desc photogallery homepage router
//@route GET  /photogallery
//@access private

const photoGallery = (req, res) => {
    res.redirect("/photogallery/1");
};


//@desc photogallery page that displays photos
//@route GET  /photogallery/1
//@access private

const photoGalleryPage = (req, res) => {
    //muudab urli kirjutatud numbri integeriks
    let galleryLinks = "";
    let page = parseInt(req.params.page);
    //kui yritatakse vale lehte panna
    if (page < 1){
        page = 1;
    }

    let photos = [];
    let userName = req.session.userName
    const photoLimit = 5;
    let skip = 0;
    const privacy = 3;

    //p2ringud ette  ara mida ei saa korraga teha, vaja teada kogu piltide arvu enne kui galleeriii lehtedeks jaotame
    const galleryPageTasks = [
        function(callback){
            connectionDatabase.execute("SELECT COUNT(id) AS photos FROM photos WHERE privacy = ? AND deleted IS NULL", [privacy], (err, result) =>{
                if (err){
                    return callback(err); //annab callbacki osa koos veaga
                }else{
                    return callback(null, result); //err, result sulgudes, kuna err on null siis annab resuldi aint
                }
            });
        },
        function(photoCount, callback){
            if((page - 1) * photoLimit >= photoCount[0].photos) {

                page = math.ceil(photoCount[0].photos / photoLimit);
            }
            console.log(photoCount[0])
            console.log("LK on: " + page);


            //lingid oleksid <a href="/gallery/n-1"> eelmine leht</a>, <a href="/gallery/n+1">j2rgmine</a>
            if(page==1){
                galleryLinks = "eelmine leht &nbsp;&nbps; | &nbsp;&nbps;" //nbsp on nonbreakable space

            }else{
                galleryLinks = '<a href="/photogallery/' + (page - 1) + '"> eelmine leht </a> &nbsp;&nbsp; | &nbsp;&nbsp; '

            }

            if (page * photoLimit >= photoCount[0].photos){
                galleryLinks += "j2rgmine left"

            } else {
                galleryLinks += '<a href="/photogallery/' + (page + 1) + '"> J2rgmine leht </a>'

            }
            return callback(null, page);
        }

    ];
    async.waterfall(galleryPageTasks, (err, results)=>{
        if(err){throw err;} 
        else {
            console.log(results);
        }
    }); //k2ivitab yksteise j2rel need

        //kui aaadressis urlis on vale page siis muudab adres page oigeks labi redirecti. Tuleb panna asynci et ta t00taks
/*     if(page != req.params.page){
        res.redirect("/"+page);
    } */
    skip = (page-1) * photoLimit;
    let sqlRequest = "SELECT file_name, alt_text FROM photos WHERE privacy = ? AND deleted IS NULL ORDER BY id DESC LIMIT ?, ?";

    connectionDatabase.execute(sqlRequest, [privacy, skip, photoLimit], (err, sqlres) => {

        if (err) {
            throw err;

        } else {

            console.log(sqlres);
            for (let i = 0; i < sqlres.length; i++) {
                photos.push({file_name: sqlres[i].file_name, alt_text: sqlres[i].photoAltInput_text, href: "../gallery/thumbnail/" + sqlres[i].file_name}); 

            }
            res.render("photogallery", { photos: photos, userName: userName, galleryLinks: galleryLinks });
        }      
    });
};

//@desc photogallery photo upload
//@route GET  /photogallery/upload
//@access private

const photoUpload = (req, res) =>{
    let notice = "";
    let userName = req.session.userName
    res.render("photoupload", {notice: notice, userName: userName});
};

//@desc photogallery photo upload
//@route POST /photogallery/upload
//@access private

const photoUploadPost = (req, res) =>{
    
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
};



module.exports = {

    photoGallery,
    photoUpload,
    photoUploadPost,
    photoGalleryPage

};