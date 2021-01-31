
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
  res.sendFile(__dirname+"/public/register.html")
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
        res.sendFile(__dirname + "/public/handleerrorregister.html")
      }
    }
  })

  newUser.save(function(err){
    if(err){
      console.log(err)
     
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
  if(err){console.log(err)}
  if(!foundUser){
    res.sendFile(__dirname + "/public/handleerrorlogin.html")
  }else{
    if(foundUser.password===password){
      console.log(foundUser)
        res.sendFile(__dirname + "/public/game.html")  
    }else{
      res.sendFile(__dirname + "/public/incorrectpwdlogin.html")
    }
  }

 });

});




app.listen(3000,function(){
console.log("server is listenning at port 3000")
})







