var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

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
  const newEvent = db.collection("events");

  
  app.post("/", (req, res)=>{
    let test = req.body;

    newEvent.insertOne(test)
    .then(result =>{
      console.log(result);
      res.redirect("/");
    })
    .catch(error => console.error(error));
  });


});

module.exports = app;
