const express = require("express");
const app = express();

app.get("/", (req, res)=>{
    res.send("express funkab ju");
});

app.listen(5101);