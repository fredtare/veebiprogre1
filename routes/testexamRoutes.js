const express = require("express");
const router = express.Router(); //Suur R on oluline
const generalFnc =  require("../generalFnc.js");

const {    
    testexamIndex,
    dataSubmit,
    dataSubmitPost,
    summary,
    summaryPost,
    dataUpdatePost,
    dataUpdate
    
} = require("../controllers/testexamController")
   

//k'ima saamiseks vaja 0)teed route valmis index jee essis 1) siia constid teha dependencitest 2) siis ka exportida router lopust. 3)muuda app getid ar arouter route ("").get() iks 

//see siin on index route,

router.route("/").get(testexamIndex);

router.route("/dataentry").get(dataSubmit);
router.route("/dataentry").post(dataSubmitPost)

router.route("/summary").get(summary);
router.route("/summary").post(summaryPost);

router.route("/dataupdate").get(dataUpdate);
router.route("/dataupdate").post(dataUpdatePost);



module.exports = router;