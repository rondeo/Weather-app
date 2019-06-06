const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const ejs = require('ejs');
const _ = require("lodash"); 
const mongoose = require('mongoose'); 

const app = express(); 

app.use(bodyParser.urlencoded({extended:true}));

// hbs.registerPartials(__dirname + '/views/partials',);

app.use(express.static(__dirname+'/public'));
app.set('view engine', 'ejs');

var item ; 
var timeZone  ; 
var dayNight ; 
var temperature ; 

// database ################################################################

// mongoose.connect("mongodb://localhost:27017/weatherDB", {useNewUrlParser: true});

mongoose.connect("mongodb+srv://admin-ram:R@m17mi556@cluster0-7am3t.mongodb.net/weatherDB", {useNewUrlParser: true}); 
//blue print of what data to be inserted

const personSchema = new mongoose.Schema({
    firstName:{
      type: String,
      required: [true, "Please enter your first name"]
    } ,
    lastName: String,
    email:{
       type: String,
       required: [true, "please enter your email"] 
    } ,
    password: {
        type: String,
        required: [true, "please enter your password"] 
    },
    checkbox: String
});

const Person = mongoose.model("Person", personSchema);

const person = new Person ({
    firstName: "R@m",
    lastName: "Chhabra",
    email: "rlc42847@gmail.com",
    password: "R@m17mi556",
    checkbox: "Remember me"
});

// insert data in database
//person.save();

// feedback Database ########################################################################

const weatherSchema = new mongoose.Schema({

    fName: {
        type: String,
        required: true
    },
    lName: {
        type: String,
    },
    cityName: {
        type: String,
        required: true
    },
    stateName: {
        type: String,
        required: true
    },
    zipCode: {
        type: Number,
    },
    feedback: {
        type: String,
        required: true
    },
    checkbox: {
        type: String
    }

});

const Weather = mongoose.model("Weather", weatherSchema); 


// get requests from search engine ##############################################################

app.get("/home", (req, res)=>{
    res.redirect("/");  
}); 

app.get("/about", (req, res)=>{
    res.render("about"); 
}); 

app.get("/signup", (req, res)=>{
    res.render("signup"); 
}); 

app.get("/login", (req, res)=>{
    res.render("login"); 
}); 

app.get("/weatherbug", (req, res)=>{
    res.render("weatherbug"); 
}); 

app.get("/feedback_thanks", (req, res)=>{
    res.render("feedbackthanks") ; 
}); 

// app.get("/data-delete", (req, res)=>{
//     Person.deleteMany({firstName: "bhawana"}, (err)=>{
//         console.log(err); 
//     }); 
// });

app.get("/", (req, res)=>{

    if(item === undefined){
        item = "Sardarshahar" ;
    }

   request(`https://api.opencagedata.com/geocode/v1/json?q=${item}&key=3ece9e4e6666444490c8ba1eb324dc7c`, (err, res, body)=>{
   if(err){
        console.log(err) ;
   } else { 

        var body = JSON.parse(body) ; 
        // console.log(body.timestamp.created_http);
        //   console.log(body.results[0].bounds.northeast.lat) ; 
        //   console.log(body.results[0].bounds.northeast.lng) ; 
        // console.log(body.results[0].annotations.flag);
        // console.log(body.results[0].annotations.timezone.name);
        // console.log(body.results[0].components.postcode);
        // console.log(body.results[0].components.city_district);

        timeZone = body.results[0].annotations.timezone.name; 
        
        let lat = body.results[0].bounds.northeast.lat ; 
        let lng = body.results[0].bounds.northeast.lng ; 

        var baseUrl = "https://api.darksky.net/forecast/4fe15aea7f078f333f5a73663e84d722/" ;
        var finalUrl = baseUrl+lat+","+lng ; 
        
      request(finalUrl, (err, res, body)=>{
      if(err){
        console.log(err); 
      } else {
         var body = JSON.parse(body) ; 
         //console.log(body.timezone);
        // console.log(body.currently.icon); 
         //console.log((body.currently.temperature-32)*5/9+" degree celsius");

         timeZone = body.timezone; 
         dayNight = body.currently.icon; 
         temperature = _.round((body.currently.temperature -32)*5/9, 2); 

    }
});
    }
});

        // res.redirect("/");
    
    item = _.upperFirst(item) ; 
         
    res.render("home", {nameOfCity: item, timeZone:timeZone, dayNight: dayNight, temperature: temperature}); 

});

// geting post request from forms#########################################

app.post("/", (req, res)=>{
    //  console.log(req.body.city); 
    item = req.body.city ; 
    res.redirect("/"); 
}); 


app.post("/backtohome",(req,res)=>{
    res.redirect("/");
});


 app.post("/signup", (req, res)=>{
    // console.log(req.body) ; 
    
  //  let signupData = JSON.parse(req.body); 

    const personData = new Person(req.body) ; 

    personData.save(); 

    res.render("sucess");
    
 }); 

 app.post("/login", (req, res)=>{
    //   console.log(req.body.email);
    //   console.log(req.body.password); 
     Person.find((err, people)=>{
         if(err){
             console.log(err); 
         } else {
    
             people.forEach((item)=>{
              
                 if((item.email === req.body.email) && (item.password === req.body.password)){
                       console.log(item.email===req.body.email && item.password === req.body.password); 
                    //   console.log(item.password ); 
                    // mongoose.connection.close(); 
                    res.redirect("/"); 
                 } 
             }) ;
         }
     }); 
     
 }); 

 
  app.post("/weatherbug", (req, res)=>{
    //   console.log(req.body); 
    const weather = new Weather(req.body);
    weather.save();
    
    res.redirect("/feedback_thanks"); 
  }); 

  

let port = process.env.PORT ; 

if(port == null || port == ""){
    port = 3000; 
}


app.listen(port, ()=>{
    console.log('Server started at port 3000');
});



//API key to get lat and longi 3ece9e4e6666444490c8ba1eb324dc7c ; 
// API for darksky 4c9e99276961bb4393017c94d20188a4