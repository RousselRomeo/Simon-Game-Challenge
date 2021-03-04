var buttonColours = ["red", "blue", "green", "yellow"];

var gamePattern = [];
var userClickedPattern = [];

var started = false;
var level = 0;

//nextSequence is called once when key is pressed at the start of the game
$("#level-title").on("touchstart", function () {
  if (!started) {
    $("#level-title").text("Level " + level);
    nextSequence();
    started = true;
  }
});

$("#level-title").on("keydown", function () {
  if (!started) {
    $("#level-title").text("Level " + level);
    nextSequence();
    started = true;
  }
});

//users choses  colour which are stored in userClickedPattern
$(".btn").click(function () {
  var userChosenColour = $(this).attr("id");
  userClickedPattern.push(userChosenColour);

  playSound(userChosenColour);
  animatePress(userChosenColour);

  checkAnswer(userClickedPattern.length - 1);
});
//check user's answer (gamePattern against userClickedPattern)
function checkAnswer(currentLevel) {
  if (gamePattern[currentLevel] === userClickedPattern[currentLevel]) {
    if (userClickedPattern.length === gamePattern.length) {
      setTimeout(function () {
        nextSequence();
      }, 1000);
    }
  } else {
    playSound("wrong");
    $("#level-title").addClass("game-over");
    $("#level-title").text("Game Over, Press screen  or key to Restart");

    setTimeout(function () {
      $("#level-title").removeClass("game-over");
    }, 200);

    startOver();
  }
}

//generates random colours which are stores in gamePattern
function nextSequence() {
  userClickedPattern = [];
  level++;
  $("#level-title").text("Level " + level);
  var randomNumber = Math.floor(Math.random() * 4);
  var randomChosenColour = buttonColours[randomNumber];
  gamePattern.push(randomChosenColour);

  $("#" + randomChosenColour)
    .fadeIn(100)
    .fadeOut(100)
    .fadeIn(100);
  playSound(randomChosenColour);
}

//add sparkling effect to button when pressed
function animatePress(currentColor) {
  $("#" + currentColor).addClass("pressed");
  setTimeout(function () {
    $("#" + currentColor).removeClass("pressed");
  }, 100);
}
//plays corresponding sounds of buttons
function playSound(name) {
  var audio = new Audio(name + ".mp3");
  audio.play();
}

// starts over the game
function startOver() {
  //"http://localhost:3000/storeLevel";

  $.post("https://afternoon-retreat-41766.herokuapp.com/storeLevel", {
    jsonStringPlayerLevel: JSON.stringify({
      playerLevel: level,
    }),
    function(data, status) {
      console.log(data);
    },
  });
  level = 0;
  gamePattern = [];
  started = false;
}
