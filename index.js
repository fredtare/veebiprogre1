const express = require("express");
const dtEt = require("./public/dateTime");
const fs = require("fs"); //lubab file systeemis ringi kynda
const app = express();
//paringu lahtiharutamiseks POST paringute puhul
const bodyparser = require("body-parser");

app.set("view engine", "ejs"); //ejs kaivitub ise aga siin maarame viewengineks ejsi parast expressi appimist
app.use(express.static("public"));//kaivitada func static expressi alt mis teeb kausta public kattesaadavaks
app.use(bodyparser.urlencoded({extended: false})); // paringu URLi parsimine false kui ainult tekst true kui muud ka

//kirjeldame kodulehe ara
app.get("/", (req, res)=>{
    //res.send("express funkab ju");
    res.render("index");
});
//teeme timenow alalehe
app.get("/timenow", (req, res)=> {
    const weekdayNow = dtEt.weekDayEt();  //vota sealt datetime failist weekday funktsioon ja anna vastus
    const dateNow = dtEt.dateEt();
    const timeNow = dtEt.timeFormattedEt();
    const dayPartNow = dtEt.partOfDay();
    res.render("timenow",{weekdayCurrent: weekdayNow, dateCurrent: dateNow, timeCurrent: timeNow, dayPartCurrent: dayPartNow});
});

app.get("/vanasonad", (req, res)=>{
    let folkWisdom = [];
    fs.readFile("public/textfiles/vanasonad.txt", "utf8", (err, data)=>{
        if(err){
            throw err; 
        }
        else {
            folkWisdom = data.split(";");
            //saadab lehele justlist nimekirja dataga folkWisdom.txt
            res.render ("justlist", {h2: "Vanasonad", listData: folkWisdom});
        }
    });
});


app.get("/regvisit", (req, res)=>{
    //res.send("express funkab ju");
    res.render("regvisit");
});
app.post("/regvisit", (req, res)=>{
    console.log (req.body);
    fs.open("public/textfiles/visitlog.txt", "a", (err, file)=>{
        if(err){
            throw err;
        }
        else {
            fs.appendFile("public/textfiles/visitlog.txt", req.body.firstNameInput + " " + req.body.lastNameInput + ";", (err)=> {
                if(err){
                    throw err;
                }
                else {
                    console.log("file write successful");
                    res.render("regvisit");
                }
            });
        }
    });
});


app.listen(5101);