const express = require("express");
const app = express();
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const randomstring = require("randomstring");
const nodemailer = require("nodemailer");

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/userDB", { useNewUrlParser: true });

//userSchema
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "please specify name a name in the name field"],
  },
  password: {
    type: String,
    required: [true, "please specify a password in the password field"],
  },
  secretToken: String,
  active: Boolean,
});

const User = mongoose.model("User", userSchema);

app.get("/", function (req, res) {
  res.sendFile(__dirname + "/public/registerlogin.html");
});
app.get("/register", function (req, res) {
  res.sendFile(__dirname + "/public/register.html");
});

app.get("/login", function (req, res) {
  res.sendFile(__dirname + "/public/login.html");
});

app.get("/verify", function (req, res) {
  res.sendFile(__dirname + "/public/secretToken.html");
});

//register user
app.post("/register", function (req, res) {
  const newUser = new User({
    name: req.body.userName,
    password: req.body.password,
    secretToken: randomstring.generate(),
    active: false,
  });

  User.findOne({ name: req.body.userName }, function (err, foundUser) {
    if (err) {
      console.log(err);
    } else {
      if (foundUser) {
        res.sendFile(__dirname + "/public/handleerrorregister.html");
      }
    }
  });
  sendMail(newUser.name, newUser.secretToken);
  console.log(newUser);
  newUser.save(function (err) {
    if (err) {
      console.log(err);
    } else {
      res.sendFile(__dirname + "/public/login.html");
    }
  });
});

//user login
app.post("/login", function (req, res) {
  console.log(req.body);
  const userName = req.body.userName;
  const password = req.body.password;

  User.findOne({ name: userName }, function (err, foundUser) {
    if (err) {
      console.log(err);
    }
    if (!foundUser) {
      res.sendFile(__dirname + "/public/handleerrorlogin.html");
    } else {
      if (foundUser.active === true) {
        if (foundUser.password === password) {
          res.sendFile(__dirname + "/public/game.html");
        } else {
          res.sendFile(__dirname + "/public/incorrectpwdlogin.html");
        }
      } else {
        res.sendFile(__dirname + "/public/secretToken.html");
      }
    }
  });
});

// verify secret token
app.post("/verifySecretToken", function (req, res) {
  const secretToken = req.body.secretToken;
  User.findOne({ secretToken: secretToken }, function (err, foundUser) {
    if (err) {
      console.log(err);
    }
    if (!foundUser) {
      res.send("no user found with the specified token");
    } else {
      console.log(foundUser);
      foundUser.active = true;
      foundUser.secretToken = "";
      foundUser.save();

      res.redirect("/login");
    }
  });
});

//send Mail
const sendMail = function (email, secretToken) {
  const Transport = nodemailer.createTransport({
    service: "Yahoo",

    auth: {
      user: "rousseltchatchou@yahoo.com",
      pass: "czwwnxrpnwhorljw",
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  var mailOptions = {
    from: "rousseltchatchou@yahoo.com",
    to: email,
    subject: "Email Confirmation",
    html: `Hi there,
    <br/>
    Thank you for registering!
    <br/><br>
    please verify your email by typing the following token:
    <br/>
    Token:<b>${secretToken}</b>
    <br/>
    on the following page:
    <a href="http://localhost:3000/verify"> verify </a> 
    Have a pleasant day !`,
  };

  Transport.sendMail(mailOptions, function (error, response) {
    if (error) {
      console.log(error);
    } else {
      console.log("message sent");
    }
  });
};

app.listen(3000, function () {
  console.log("server is listenning at port 3000");
});
