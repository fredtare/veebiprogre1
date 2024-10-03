const express = require("express");
const dtEt = require("./public/dateTime");
const app = express();
app.set("view engine", "ejs"); //ejs kaivitub ise aga siin maarame viewengineks ejsi parast expressi appimist
app.use(express.static("public"));//kaivitada func static expressi alt mis teeb kausta public kattesaadavaks

//kirjeldame kodulehe ara
app.get("/", (req, res)=>{
    //res.send("express funkab ju");
    res.render("index");
});
//teeme timenow alalehe
app.get("/timenow", (req, res)=> {
    const weekdayNow = dtEt.weekDayEt();  //vota sealt datetime failist weekday funktsioon ja anna vastus
    const dateNow = dtEt.dateEt();
    const timeNow = dtET.timeFormattedEt();
    res.render("timenow",{weekdayCurrent: weekdayNow, dateCurrent: dateNow, timeCurrent: timeNow});
});

app.listen(5101);