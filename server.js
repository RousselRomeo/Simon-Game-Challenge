
const express = require('express');
const app = express();
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({
  extended:true
}))

app.use(express.static('public'))



mongoose.connect("mongodb://localhost:27017/userDB",{ useNewUrlParser: true })

const userSchema = new mongoose.Schema({
  name:{
    type:String,
    required:[true,"please specify name a name in the name field"]
  },
  password:{
    type:String,
    required:[true,"please specify a password in the password field"]
  }
})

const User= mongoose.model("User",userSchema);





app.get("/",function(req,res){
  res.sendFile(__dirname + "/public/registerlogin.html")

})
app.get("/register",function(req,res){
  res.sendFile(__dirname+"/public/registerlogin.html")
})

app.get("/login", function(req,res){
res.sendFile(__dirname + "/public/registerlogin.html")
})

app.post("/register", function(req,res){
  console.log(req.body.userName)
  const newUser= new User({
    name:req.body.userName,
    password:req.body.password
   
  
  })
    
  User.findOne({name:req.body.userName},function(err,foundUser){

    if(err){
      console.log(err)
    }else{
      if(foundUser){
        res.send("Username already in use! please change")
      }
    }
  })

  newUser.save(function(err){
    if(err){
      console.log(err)
      res.sendFile(__dirname + "/public/errorregister.html")
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
        res.sendFile(__dirname + "/public/game.html")
      }
    }else{
      res.send("please register")
    }
  }

 });

});



app.listen(3000,function(){
console.log("server is listenning at port 3000")
})







