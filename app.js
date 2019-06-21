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
var regionName  ; 
var dayNight ; 
var temperature ; 
var dayStatus ; 
var countryName ; 

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



//######################################################################################

app.get("/", (req, res)=>{
    if(item === undefined){
        item = "Churu" ;
    }

    request(`https://api.apixu.com/v1/current.json?key=8939f05ef73f4783bab60805190806&q=${item}`, (err, res, body)=>{

        if(err){
            throw new Error(`Somthing went wrong in getting data from server. ${err}`);
        } 
        else{
            const body1 = JSON.parse(body); 

            dayNight = body1.current.is_day ; 
            temperature = body1.current.temp_c; 
            regionName = body1.location.country + "/" +body1.location.region; 
            dayStatus = body1.current.condition.text ;   
        }
    });

    item = _.upperFirst(item) ; 
        
    res.render("home", {nameOfCity: item, regionName:regionName, dayNight: dayNight, temperature: temperature, dayStatus:dayStatus}); 
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

    const personData = new Person(req.body) ; 

    personData.save(); 

    res.render("sucess");
    
 }); 

 app.post("/login", (req, res)=>{
     Person.find((err, people)=>{
         if(err){
             throw new Error('Unable to login!'); 
         } else {
    
             people.forEach((item)=>{
              
                 if((item.email === req.body.email) && (item.password === req.body.password)){
                    res.redirect("/"); 
                 } 
             });
         }
     }); 
     
 }); 

 
  app.post("/weatherbug", (req, res)=>{
    try{
        const weather = new Weather(req.body);
        weather.save();
        res.redirect("/feedback_thanks"); 
    }catch(e){
        throw new Error('Something went wrong!'); 
    }
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