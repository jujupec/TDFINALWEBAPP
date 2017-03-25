
//---------------------------------------------------------------------------

// Avant de lancer l'app il faut importer les 2 fichier json dans mongodb et dans une meme database

// Ensuite il faudra faire des petits changements

// au  cas où nous avons fait des screen de la page html dans le repertoire screenshot


//---------------------------------------------------------------------------









var express = require('express');

var MongoClient = require("mongodb").MongoClient;




var app = express();

app.set( 'view engine', 'ejs' );

app.use( '/public', express.static( 'public' ) );




var spots2;

app.get( '/', function ( req, res ) {

            // Pour se connecté à la database où les 2 fichiers json sont, il faut ecrire à la place du miens : mongodb://localhost/nomdelacollection

            MongoClient.connect("mongodb://192.168.99.100:32769/test", function(error, db) {
                if (error) throw error;

                // pour acceder à la collection il faut ecrire le nom de votre collection à la place de spot

                db.collection('spot').find().toArray(function (error, results) {
                    if (error) throw error;

                        spots2=results;
                    res.render('index', {spots:results, sopot:"", Proches:"", introuvable:""});
                    });


            });

           });

var WantThisSpot;

var Proches;

app.get( '/process', function ( req, res ) {
            MongoClient.connect("mongodb://192.168.99.100:32769/test", function(error, db) {
                            if (error) throw error;

                            db.collection('spot').findOne({ 'properties.SITE':req.query.Site },function (error, result) {
                                WantThisSpot=result;

                                if(result!=null){
                                        db.collection('camping2').find().toArray(function (error2, results) {
                                                                                                      if (error2) throw error;


                                                                                                              Proches=distancesCamping(results,result);
                                                                                                              res.render('index', {WantThisSpot: WantThisSpot, sopot:"Les camping les plus proches de: "+WantThisSpot.properties.SITE, spots:spots2 , Proches: Proches , introuvable:"" });
                                                                                                });
                                }
                                else{
                                     db.collection('spot').find().toArray(function (error, results) {
                                                         if (error) throw error;

                                                             spots2=results;
                                                             res.render('index', {spots:spots2, sopot:"", Proches:"" , introuvable: "spot introuvable"})
                                                         });

                                }


                            });







                      });

});


function distancesCamping(amping, SPot){
    var distances=new Array(amping.length);
    var distancesTri=new Array(amping.length);
    var proche=[];
    amping.forEach(function(camp,i){
        distances[i]=distanceCamping(camp,SPot);
        distancesTri[i]=distanceCamping(camp,SPot);
    });


    distancesTri=distancesTri.sort(function(a, b) {
      return a - b;
    });


    for (var i = 0 ; i < 5; i++) {
       proche.push(amping[distances.indexOf(distancesTri[i])]);

    }
    return proche;
}

function distanceCamping(a,b){
     return Math.round(10000*Math.sqrt(Math.pow(b.geometry.coordinates[0]-a.geometry.coordinates[0],2)+Math.pow(b.geometry.coordinates[1]-a.geometry.coordinates[1],2)))/10000;
}




           app.listen( 8080, function () {
               console.log( 'App listening on port 8080!' );
           });


