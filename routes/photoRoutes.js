const express = require("express");
const router = express.Router(); //Suur R on oluline
const generalFnc =  require("../generalFnc.js");
const multer = require("multer");
const upload = multer({dest: "./public/gallery/orig/"});

const {    
    photoGallery,
    photoUpload,
    photoUploadPost,
    photoGalleryPage

} = require("../controllers/photoController")
   
router.use(generalFnc.checkLogin); // annab checklogin igale router.route("").get ile automoaatselt sisse. kontrollib kas sa seda route yldse saad kasutada selleparast polegi vaja

//k'ima saamiseks vaja 0)teed route valmis index jee essis 1) siia constid teha dependencitest 2) siis ka exportida router lopust. 3)muuda app getid ar arouter route ("").get() iks 

//see siin on news route, kuna news on selle homepage asendame selle "/"ga 

//router.use(("photoInput"));
//see oli algselt post photouploadi kyljes enne req resi ja parast "/photoupload" i . Ma ei tea kuhu seda panna aga ta tahab seda uploadi konstanti


router.route("/").get(photoGallery);

router.route("/photoUpload").get(photoUpload);

router.route("/photoUpload", upload.single).post(photoUploadPost);

router.route("/:id").get(photoGalleryPage);



module.exports = router;