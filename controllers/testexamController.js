const express = require("express");
const router = express.Router(); //Suur R on oluline
const dbInfo = require("../../../vp2024config"); 
const mysql = require("mysql2");
const generalFnc =  require("../generalFnc.js");
const async = require("async");

//andmebaasiga yhenduse loomines. comad on iga rea taga kuna me paneme eri reale aga tegelt nad on jarjest
const connectionDatabase = mysql.createConnection({
    host: dbInfo.configData.host,
    user: dbInfo.configData.user,
    password: dbInfo.configData.passWord,
    database: dbInfo.configData.dataBase

}); 
   

//@desc testexam hompage where you can go to dataentry and summary
//@route GET  /testexamindex
//@access pub

const testexamIndex =  (req, res)=>{
    res.render("testexam/testexamindex.ejs");
};



//@desc summary page where you can see the total load of cargo delivered so far (trucks that have emptied themselves only), also filter by number and see all loads.
//@route GET /summary
//@access pub

const summary = (req, res)=>{
//teeme siia asynciga mitu querit
    const truckDataQueries = [ 

        function(callback) {
            let sqlRequest1 = "SELECT SUM(weight_in) AS total_in, SUM(weight_out) AS total_out FROM testexam WHERE weight_out IS NOT NULL";
        //ASiga sa saad defineerida mingi v22rtuse millega sellele saab ligi


            
            connectionDatabase.query(sqlRequest1, (err, result)=>{

                if (err) {
                    return callback(err);

                } else {
                    
                    return callback(null, result);

                }
            });
        },

        function(callback) {
            let sqlRequest2 = "SELECT truck, weight_in, weight_out FROM testexam WHERE weight_out IS NOT NULL"
    
            
            connectionDatabase.query(sqlRequest2, (err,result)=>{
                if (err){
                    return callback(err);
                } else {
                    return callback(null, result);
                }

            });
        },

        function(callback) {
            let sqlRequest3 = "SELECT DISTINCT truck FROM testexam WHERE weight_out IS NOT NULL"

            connectionDatabase.query(sqlRequest3, (err,result)=>{
                if (err){
                    return callback(err);
                } else {
                    return callback(null, result);
                }

            });

        }
    ]

    async.parallel(truckDataQueries, (err, results) => {

    if (err) {
        console.log(err);

        } else {
            

            let totalWeight = results[0][0].total_in - results[0][0].total_out;
            res.render("testexam/summary", {totalWeight: totalWeight, cargoList: results[1], truckList: results[2]});

        }
    });
};


//@desc summary page where you can see the total load of cargo delivered so far (trucks that have emptied themselves only), also filter by number and see all loads.
//@route POST /summary
//@access pub

const summaryPost = (req, res)=>{
//teeme siia asynciga mitu querit
    const truckDataQueries = [ 

        function(callback) {
            let sqlRequest1 = "SELECT SUM(weight_in) AS total_in, SUM(weight_out) AS total_out FROM testexam WHERE weight_out IS NOT NULL";
        //ASiga sa saad defineerida mingi v22rtuse millega sellele saab ligi


            
            connectionDatabase.query(sqlRequest1, (err, result)=>{

                if (err) {
                    return callback(err);

                } else {
                    
                    return callback(null, result);

                }
            });
        },

        function(callback) {
            let sqlRequest2 = "SELECT truck, weight_in, weight_out FROM testexam WHERE weight_out IS NOT NULL"
    
            
            connectionDatabase.query(sqlRequest2, (err,result)=>{
                if (err){
                    return callback(err);
                } else {
                    return callback(null, result);
                }

            });
        },

        function(callback) {
            let sqlRequest3 = "SELECT DISTINCT truck FROM testexam WHERE weight_out IS NOT NULL"

            connectionDatabase.query(sqlRequest3, (err,result)=>{
                if (err){
                    return callback(err);
                } else {
                    return callback(null, result);
                }

            });

        },
        
        function(callback) {
            let sqlRequest4 = "SELECT truck, weight_in, weight_out FROM testexam WHERE truck = ?"

            connectionDatabase.query(sqlRequest4,[req.body.truckFilter], (err, result)=>{
                if(err){
                    return callback(err);

                }else{
                    return callback(null, result);
                }
            });

        }
    ]

    async.parallel(truckDataQueries, (err, results) => {

    if (err) {
        console.log(err);

        } else {

            let totalWeight = results[0][0].total_in - results[0][0].total_out;
            let filteredList = results[3]
            res.render("testexam/summaryFiltered", {totalWeight: totalWeight, cargoList: results[1], truckList: results[2], filteredList: filteredList });

        }
    });
};



//@desc data entry page where you can input truck number, load in and load out. Also nice to have: you can forgo load out and update it later.
//@route GET  /dataentry
//@access pub
const dataSubmit = (req, res) => {

    let sqlRequest = "SELECT truck, weight_in FROM testexam WHERE weight_out IS NULL"

    connectionDatabase.query(sqlRequest, (err, sqlres) => {

        if (err) {
            throw err;
        
        } else {
            let notice = ""
            res.render("testexam/datasubmit", { notice: notice, loadingList: sqlres });
        }
    });
};


//@desc dataentry post page where you submit the data
//@route POST /dataentrypost
//@access pub

 const dataSubmitPost = (req, res) => {
    let sqlRequest = "SELECT truck, weight_in FROM testexam WHERE weight_out IS NULL"

    connectionDatabase.query(sqlRequest, (err, sqlres) => {

        if (err) {
            throw err;

                //Eraldame iga lahtri oma sqlrequestiks kuna ei ole sama tabel. Alsutame filmsubmit
            }else{ 
                if (!req.body.emptyInput){
        
                    let sqlRequest2 = "INSERT INTO testexam (truck, weight_in) VALUES (?, ?)"
        
                    connectionDatabase.query(sqlRequest2, [req.body.truckInput, req.body.fullInput, req.body.emptyInput], (err, sqlres) => {
        
                        if (err) {
                            throw err;
                        
                        } else {
                            notice = "koorem on lisatud!";
                            res.render("testexam/dataentry", { notice: notice, loadingList: sqlres });
                        }
                    });         let sqlRequest3 = "INSERT INTO testexam (truck, weight_in, weight_out) VALUES (?, ?, ?)"
        
                    connectionDatabase.query(sqlRequest3, [req.body.truckInput, req.body.fullInput, req.body.emptyInput], (err, sqlres) => {
        
                        if (err) {
                            throw err;
                        
                        } else {
                            notice = "koorem on lisatud!";
                            res.render("testexam/dataentry", { notice: notice});
                        }
                    });
                }
            }
    });
 };
  
 
//@desc data entry page where you can input truck number, load in and load out. Also nice to have: you can forgo load out and update it later.
//@route GET  /dataentry
//@access pub
const dataUpdate = (req, res) => {

    let sqlRequest = "SELECT truck, weight_in FROM testexam WHERE weight_out IS NULL"

    connectionDatabase.query(sqlRequest, (err, sqlres) => {

        if (err) {
            throw err;
        
        } else {
            let notice = ""
            res.render("testexam/dataupdate", { notice: notice, loadingList: sqlres });
        }
    });
};


//@desc dataentry post page where you submit the data
//@route POST /dataentrypost
//@access pub

 const dataUpdatePost = (req, res) => {
    let sqlRequest = "SELECT truck, weight_in FROM testexam WHERE weight_out IS NULL"

    connectionDatabase.query(sqlRequest, (err, sqlres) => {

        if (err) {
            throw err;
        
        } else {
            let notice = "";
        
        
                let sqlRequest1 = "UPDATE testexam SET weight_out = ? WHERE truck = ?"
   
                connectionDatabase.query(sqlRequest1, [req.body.updateWeight, req.body.loadedTrucks], (err, sqlres) => {
        
                    if (err) {
                        throw err;
                    
                    } else {
                        let sqlRequest = "SELECT truck, weight_in FROM testexam WHERE weight_out IS NULL"
                        connectionDatabase.query(sqlRequest, (err, sqlres) => {
                        notice = "koorem on uuendatud!";
                        res.render("testexam/dataupdate", { notice: notice, loadingList: sqlres});
                        });
                    };
                });
         };
    });
 };



module.exports = {

    testexamIndex,
    dataSubmit,
    dataSubmitPost,
    summary,
    summaryPost,
    dataUpdate,
    dataUpdatePost


};