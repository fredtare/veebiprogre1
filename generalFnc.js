
exports.checkLogin = function(req, res, next) {
    if(req.session != 0) {
        if(req.session.userId){
            console.log("login kasutaja: " + req.session.userId);
            next();
        } else {
            console.log("keegi ei olnud sisse loginud");
            res.redirect("/login");
        }
    } else {
        let notice = "Palun logi sisse et sinna ligi p22seda"
        res.redirect("/login");
        console.log("sessiooni ei dekteteeritud ")
    }
};
