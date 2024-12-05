const express = require("express");
const router = express.Router(); //Suur R on oluline
const generalFnc =  require("../generalFnc.js");
const fs = require("fs"); //lubab file systeemis ringi kynda

const {    
    indexRoot,
    userRegister,
    userRegisterPost,
    userLogin,
    userLoginPost,
    vanaSonad,
    regVisit,
    regVisitPost,
    regVisitDB,
    regVisitDBPost,
    visitLog,
    timeNow
} = require("../controllers/indexController")
   

//k'ima saamiseks vaja 0)teed route valmis index jee essis 1) siia constid teha dependencitest 2) siis ka exportida router lopust. 3)muuda app getid ar arouter route ("").get() iks 

//see siin on index route,

router.route("/").get(indexRoot);

router.route("/register").get(userRegister);

router.route("/register").post(userRegisterPost)

router.route("/login").get(userLogin);

router.route("/login").post(userLoginPost);

router.route("/vanasonad").get(vanaSonad);

router.route("/regvisit").get(regVisit);

router.route("/regvisit").post(regVisitPost);

router.route("/regvisitdb").get(regVisitDB);

router.route("/regvisitdb").post(regVisitDBPost);

router.route("/visitlog").get(visitLog);

router.route("/timenow").get(timeNow);

module.exports = router;