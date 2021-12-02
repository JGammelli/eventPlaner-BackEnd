var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');
const jwt = require("jsonwebtoken");
const bp = require("body-parser");
var dotenv = require("dotenv");

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();


dotenv.config();
app.use(cors({
  origin: function(origin, callback) {
     return callback(null, true);
  },
  optionsSuccessStatus: 200,
  credentials: true
}));

app.use(bp.json());
app.use(bp.urlencoded({extended: true}));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);



const secretjwt = "123secret";

const MongoClient = require('mongodb').MongoClient;
//const { json } = require('body-parser');
const uri = "mongodb+srv://judith:xJ27NTHqkeSE9t6@cluster3167.6la81.mongodb.net/Cluster3167?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });



client.connect(err => {
  const collection = client.db("test").collection("devices");
  // perform actions on the collection object
  if (err) return console.error(err);
  console.log('Connected to Database');

  const db = client.db("Events");
  const events = db.collection("events");
  const registeredUsers = db.collection("users");
  
    

  app.post("/login", (req, res)=>{
    const {username, password} = req.body;
    console.log('Req body in login ', req.body)

    registeredUsers.findOne(
      { $and: [ 
        { username: username }, 
        { password: password } 
      ] }, 
      (err, result) => {
        console.log(result);
        if(err) {
          res.status(500).send(err);
          return;
        }
        if(result.password === password){
          const token = jwt.sign({id: result._id, username: result.username},
          secretjwt);
          return res.
          cookie("access_token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
          })
          .status(200)
          .json({
            id:result._id,
            username: result.username
          
          });
            


          // jwt.sign(
          //   {id: result._id, username: result.username},
          //   secretjwt, 
          //   (err, token) => {
          //     if(err){
          //       console.log(err);
          //       res.sendStatus(500);
          //       console.log("error");
          //     }else{
          //       return(
          //       res.cookie("token", token).json({
          //         id:result._id,
          //         username: result.username
                
          //       })
          //       );
          //       console.log("success");
          //     }
          //   }
          // );
        }      
    });
    
    app.get('/islogedin', (req, res) => {
      console.log("trying to log", req.cookies.token);
      if (req.cookies.token) {
        console.log("is logging in");
          const tokenData = jwt.verify(req.cookies.token, secretjwt);
          registeredUsers.findById(tokenData.id).then((userInfo) => {
              res.json({ id: userInfo._id, username: userInfo.username });
          });
      }
    });
    // events.insertOne(test)
    // .then(result =>{
    //   console.log(result);
    //   res.redirect("/");
    // })
    // .catch(error => console.error(error));
  });


});

module.exports = app;


