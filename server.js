
const express = require('express');
const app = express();
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({
  extended:true
}))





mongoose.connect("mongodb://localhost:27017/userDB",{ useNewUrlParser: true })

const userSchema = new mongoose.Schema({
  name:String,
  password:Number
})

const User= mongoose.model("User",userSchema);


app.use(express.static('public'))


app.get("/",function(req,res){
  res.sendFile(__dirname + "/public/register.html")

})

app.get("/login", function(req,res){
res.sendFile(__dirname + "/public/login.html")
})

app.post("/register", function(req,res){
  const newUser= new User({
    name:req.body.username,
    password:req.body.password,
   
  
  })


  newUser.save(function(err){
    if(err){
      console.log(err);
    }else{
      res.sendFile(__dirname + "/public/login.html")
     
    }
  })


})



app.post("/login",function(req,res){
  
 const userName= req.body.userName;
 const password=req.body.password;
console.log(userName)
console.log(password)
 User.findOne({name:userName},function(err,foundUser){
  if(err){
    console.log(err)
  }else{
    if(foundUser){
      console.log(foundUser)
      if(foundUser.password==password){
        res.sendFile(__dirname+"/public/game.html")
      }
    }
  }

 });

});



app.listen(3000,function(){
console.log("server is listenning at port 3000")
})







