const express = require("express");
const router = express.Router(); //Suur R on oluline
const generalFnc =  require("../generalFnc.js");

const {    
    newsHome,
    newsRead,
    newsAdd,
    newsPost
} = require("../controllers/newsController")
   
router.use(generalFnc.checkLogin); // annab checklogin igale router.route("").get ile automoaatselt sisse. kontrollib kas sa seda route yldse saad kasutada selleparast polegi vaja

//k'ima saamiseks vaja 0)teed route valmis index jee essis 1) siia constid teha dependencitest 2) siis ka exportida router lopust. 3)muuda app getid ar arouter route ("").get() iks 

//see siin on news route, kuna news on selle homepage asendame selle "/"ga 

router.route("/").get(newsHome);

router.route("/readnews").get(newsRead);

router.route("/addnews").get(newsAdd);

router.route("/addnews").post(newsPost);

module.exports = router;