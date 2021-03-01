const express = require("express");
const app = express();
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const randomstring = require("randomstring");
const nodemailer = require("nodemailer");
//const flash = require("express-flash");
const flash = require("connect-flash");
const session = require("express-session");
const ejs = require("ejs");

app.set("view engine", "ejs");

//Express session middleware
app.use(
  session({
    secret: "happy dog",
    saveUninitialized: true,
    resave: true,
  })
);

//connect flash middleware
app.use(flash());

//Global variables
app.use(function (req, res, next) {
  res.locals.success_messages = req.flash("success");
  res.locals.error_messages = req.flash("error");
  res.locals.incorrect_password = req.flash("incorrectPassword");
  res.locals.user_isnotavailable = req.flash("error2");
  res.locals.email_notverified = req.flash("error3");
  res.locals.email_alreadyverified = req.flash("error4");
  res.locals.email_successfullyverified = req.flash("success2");
  res.locals.email_notverified2 = req.flash("error5");

  next();
});

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

app.use(express.static("public"));
//"mongodb://localhost:27017/userDB"

mongoose.connect(
  "mongodb+srv://romeo:tchatchou111@cluster0.mxzx2.mongodb.net/userDB",
  { useNewUrlParser: true, useUnifiedTopology: true }
);

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "please specify name a name in the name field"],
  },
  password: {
    type: String,
    required: [true, "please specify a password in the password field"],
  },
  playerName: String,
  playerhighestLevel: { type: Number, default: 0 },
  secretToken: String,
  active: Boolean,
});

const User = mongoose.model("User", userSchema);

app.get("/", function (req, res) {
  User.find({})
    .limit(10)
    .sort({ playerhighestLevel: "descending" })
    .exec(function (err, foundUsers) {
      if (err) {
        console.log(err);
      } else {
        res.render("login", {
          foundUsers: foundUsers,
        });
      }
    });
  //res.render("loginregister");
});

app.get("/register", function (req, res) {
  res.render("register");
});

app.get("/startGame", function (req, res) {
  res.sendFile(__dirname + "/public/game.html");
});

app.get("/verify/:secretToken", function (req, res) {
  const secretToken = req.params.secretToken;
  User.findOne({ secretToken: secretToken }, function (err, foundUser) {
    if (err) {
      console.log(err);
    }
    if (!foundUser) {
      req.flash("error4", "Email already verified Please! login");
      res.redirect("/register");
    } else {
      //console.log(foundUser);
      foundUser.active = true;
      foundUser.secretToken = "";
      foundUser.save();
      req.flash("success2", "Email successfully Verified, You can now login");
      res.redirect("/register");
    }
  });
});

app.get("/logout", function (req, res) {
  //console.log(req.session);
  req.session.destroy(function (err) {
    if (err) {
      console.log(err);
    } else {
      res.redirect("/");
    }
  });
});

// register player name
app.post("/registerPlayerName", function (req, res) {
  const userId = req.session.userId;
  //console.log(userId);
  const playerName = req.body.playerName;
  console.log(playerName);
  User.findOne({ _id: userId }, function (err, foundUser) {
    if (err) {
      console.log(err);
    } else {
      User.find({})
        .limit(10)
        .sort({ playerhighestLevel: "descending" })
        .exec(function (err, foundUsers) {
          if (err) {
            console.log(err);
          } else {
            foundUser.playerName = playerName;
            foundUser.save();
            res.render("welcomePage", {
              playerName: foundUser.playerName,
              playerhighestLevel: foundUser.playerhighestLevel,
              foundUsers: foundUsers,
            });
          }
        });
      //console.log(foundUser);
      // foundUser.playerName = playerName;
      //foundUser.save();

      /* res.render("welcomePage", {
        playerName: foundUser.playerName,
        playerhighestLevel: foundUser.playerhighestLevel,
      });*/
    }
  });
});

//Register user
app.post("/register", function (req, res) {
  const newUser = new User({
    name: req.body.userName,
    password: req.body.password,
    playerName: "",
    secretToken: randomstring.generate(),
    active: false,
  });

  User.findOne({ name: req.body.userName }, function (err, foundUser) {
    if (err) {
      console.log(err);
    } else if (!foundUser) {
      newUser.save(function (err) {
        if (err) {
          console.log(err);
        } else {
          req.flash(
            "success",
            "Registration successful! Please verify your email"
          );
          sendMail(newUser.name, newUser.secretToken);
          res.redirect("register");
        }
      });
    } else if (
      foundUser.password === req.body.password &&
      foundUser.active === true
    ) {
      req.flash("error2", "username already verified, Please! login");
      res.redirect("/register");
    } else if (foundUser) {
      req.flash("error5", "Username not verified! Please verify then login");
      res.redirect("/register");
    }
  });
});

//user login
app.post("/login", function (req, res) {
  const userName = req.body.userName;
  const password = req.body.password;

  User.findOne({ name: userName }, function (err, foundUser) {
    if (err) {
      console.log(err);
    }
    if (!foundUser) {
      req.flash(
        "error",
        "No user found with the specified name,Please Register!!"
      );
      res.redirect("/");
    } else {
      if (foundUser.active === true) {
        if (foundUser.password === password && foundUser.playerName === "") {
          req.session.userId = foundUser._id;
          res.render("playerName");
          // res.render("welcomePage", { playerName: foundUser.playerName });
        } else if (foundUser.password === password) {
          req.session.userId = foundUser._id;
          User.find({})
            .limit(10)
            .sort({ playerhighestLevel: "descending" })
            .exec(function (err, foundUsers) {
              if (err) {
                console.log(err);
              } else {
                res.render("welcomePage", {
                  playerName: foundUser.playerName,
                  playerhighestLevel: foundUser.playerhighestLevel,
                  foundUsers: foundUsers,
                });
              }
            });
        } else {
          req.flash("incorrectPassword", "incorrect password,please Try again");
          res.redirect("/");
        }
      } else {
        req.flash("error3", "Username not verified! Please verify then login");

        res.redirect("/");
      }
    }
  });
});

app.post("/storeLevel", function (req, res) {
  const { playerLevel } = JSON.parse(req.body.jsonStringPlayerLevel);

  const userId = req.session.userId;
  console.log(userId);
  console.log(playerLevel);
  User.findOne({ _id: userId }, function (err, foundUser) {
    if (err) {
      console.log(err);
    } else {
      //console.log(foundUser);
      if (foundUser.playerhighestLevel < playerLevel) {
        foundUser.playerhighestLevel = playerLevel;
        foundUser.save();
      } else {
      }
    }
  });
});

//send Mail to user

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
    Eager to test how far you can memorise! and compete with friends!
    <br/>
    then click below to verify your account
    <br/><br>
      <a href="https://afternoon-retreat-41766.herokuapp.com/verify/${secretToken}"> <button style="color:green;font-size:40px;"> verify </button> </a> 
    <br/><br>
   Show  <b>Roussel Tchatchou</b> that your are the best !`,
  };

  Transport.sendMail(mailOptions, function (error, response) {
    if (error) {
      console.log(error);
    } else {
      console.log("message sent");
    }
  });
};

app.listen(process.env.PORT || 3000, function () {
  console.log("server is listenning at port 3000");
});
