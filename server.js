//-------------------------------------------------------------------------------------------------------------

const express = require("express"); //loading express module
const exphbs = require("express-handlebars"); //for writing html templates in serverside
const methodOverride = require("method-override"); //for using put method for upload purpose
const mongoose = require("mongoose"); //database driver
const bodyParser = require("body-parser"); //for extracting data from body
const app = express(); //top level function //root  //its like container

const Handlebars = require("handlebars"); //only for date purpose bootstrap
const HandlebarsIntl = require("handlebars-intl"); //only for date purpose bootstrap
const multer = require("multer"); //multer is used for uploading files

//load profile schema module ..exported from their now we have to import here
require("./Model/Profile");
const Profile = mongoose.model("profile");

const cloudMongoUrl =
  "mongodb+srv://fullstack:fullstack123@cluster0-h5na9.mongodb.net/test?retryWrites=true&w=majority";
//connection database middleware
mongoose.connect(
  cloudMongoUrl,
  { useUnifiedTopology: true, useNewUrlParser: true },
  err => {
    if (err) throw err;
    console.log("database connected");
  }
);

//middlewares
app.engine("handlebars", exphbs());
app.set("view engine", "handlebars");
//close template engine middleware here

//serve static files in express app
app.use(express.static(__dirname + "/node_modules/bootstrap")); //express static middleware
app.use(express.static(__dirname + "/node_modules/jquery")); //express static middleware
app.use(express.static(__dirname + "/public")); //express static middleware

//body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//methodoverride middleware for put and delete method because html doesnot have put and delete

// override with the X-HTTP-Method-Override header in the request(put method)
app.use(methodOverride("X-HTTP-Method-Override")); //header
// override with POST having ?_method=DELETE
app.use(methodOverride("_method")); //body

//format js middleware here
HandlebarsIntl.registerWith(Handlebars);

//multer middleware here for uploading files
//These 1st 3 lines we used to remove 1st 6 character of path...for removing profile from begining
Handlebars.registerHelper("trimArray", function(passedString) {
  var theArray = [...passedString].splice(6).join("");
  return new Handlebars.SafeString(theArray);
});

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, "public/uploads");
  },
  filename: function(req, file, cb) {
    cb(null, Date.now() + file.originalname);
  }
});

const upload = multer({ storage: storage });
//multer code is ending here

//create express basic routing

app.get("/", (req, res) => {
  res.render("home.handlebars", { title: "This is home page" }); //.handlebars is optional
}); //home route

//create profile routing here
app.get("/profiles/addprofile", (req, res) => {
  //routing path that should be written in add profile href
  //inside get its custom we can write anything(profile/addprofile) //routing path that we write in url
  res.render("profiles/addprofile"); //folder path should be same or exact
});

//edit profile route here //binding
app.get("/profile/editprofile/:id", (req, res) => {
  // res.render("/profiles/editprofile");
  Profile.findOne({ _id: req.params.id }) //params means parameter
    .then(profile => {
      // console.log(profile);
      res.render("profiles/editprofile", {
        //by using this profile we are getting values to edit in placeholder from database
        profile: profile
      });
    })
    .catch(err => console.log(err));
});

//------------------------------------------------GET-----------------------------------------------------------
//create profile routes   //GET
app.get("/profile/profiles", (req, res) => {
  //find data from mongodb database b using find method
  Profile.find({})
    .then(profile => {
      // console.log(profile);
      res.render("profiles/profiles", {
        profile: profile //FOR PRINTING OBJECTS
      });
    })
    .catch(err => console.log(err));
});

//------------------------------------------PUT(update)-----------------------------------------------------------

//put req here for updating data
app.put("/profiles/editprofile/:id", upload.single("photo"), (req, res) => {
  //should tell which object want to modify
  Profile.findOne({ _id: req.params.id })
    .then(profile => {
      //save new data
      profile.photo = req.file;
      profile.firstname = req.body.firstname;
      profile.lastname = req.body.lastname;
      profile.email = req.body.email;
      profile.phonenumber = req.body.phonenumber;
      profile.location = req.body.location;

      profile
        .save()
        .then(profile => {
          res.redirect("/profile/profiles", 301, { profile });
        })
        .catch(err => console.log(err));
    })
    .catch(err => console.log(err));
});

//----------------------------------Delete----------------------------------------------------------------------

app.delete("/profile/deleteprofile/:id", (req, res) => {
  Profile.remove({ _id: req.params.id })
    .then(profile => {
      res.redirect("profile/profiles", 301, { profile });
    })
    .catch(err => console.log(err));
});

//--------------------------------------------------------------------------------------------------------------
//Wild card
app.get("**", (req, res) => {
  res.render("404.handlebars", { title: "404 page" });
}); //404 route

//---------------------------------------------POST(CREATE)-----------------------------------------------------

//create profile data through http-post method
app.post("/profiles/addprofile", upload.single("photo"), (req, res) => {
  //this path we have to paste in form action
  // console.log(req.body);
  // res.send("ok successfully created data");
  const errors = [];
  if (!req.body.firstname) {
    errors.push({ text: "firstname is required" });
  }
  if (!req.body.lastname) {
    errors.push({ text: "lastname is required" });
  }
  if (!req.body.email) {
    errors.push({ text: "email is required" });
  }
  if (!req.body.phonenumber) {
    errors.push({ text: "phonenumber is required" });
  }
  if (!req.body.location) {
    errors.push({ text: "location is required" });
  }
  if (errors.length > 0) {
    res.render("profiles/addprofile", {
      errors: errors,
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      email: req.body.email,
      phonenumber: req.body.phonenumber,
      location: req.body.location
    });
  } else {
    const newProfile = {
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      photo: req.file,
      email: req.body.email,
      phonenumber: req.body.phonenumber,
      location: req.body.location
    };
    // res.send(ok);
    //save data to mongodb database
    new Profile(newProfile)
      .save()
      .then(profile => {
        res.redirect("/", 301, { profile });
      })
      .catch(err => console.log(err));
  }
}); //for create should use http-post method //the name should be same into handlebars inside action attribute inside form tag

//-------------------------------------------------------------------------------------------------------------

const port = process.env.PORT || 4000; //custom http port
app.listen(port, err => {
  if (err) throw err;
  console.log(`server is running on a port number ${port}`);
});

//------------------------- HOW TO USE MIDDLEWARE-----------------------------------------------------------

// const express = require("express"); //loading express module
// const app = express(); //top level function //root  //its like container

// //create express basic routing

// var myLogger = function(req, res, next) {
//   console.log("LOGGED");
//   next();
// };

// app.use(myLogger);   //compulsary to call next function

// app.get("*", (req, res) => {
//   res.send(`<h1 style="color:red">Hello expressjs</h1>`);
//   // res.render("./index.html");
// });

// const port = process.env.PORT || 4000; //custom http port
// app.listen(port, err => {
//   if (err) throw err;
//   console.log(`server is running on a port number ${port}`);
// });

//---------------------------------------BASIC----------------------------------------------------------------

// const express = require("express"); //loading express module
// const app = express(); //top level function //root  //its like container

// //create express basic routing
// app.get("*", (req, res) => {
//   //   res.send(`<h1 style="color:red">Hello expressjs</h1>`);
//   res.render("./index.html");
// });

// const port = process.env.PORT || 4000; //custom http port
// app.listen(port, err => {
//   if (err) throw err;
//   console.log(`server is running on a port number ${port}`);
// });
