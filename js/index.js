$(document).ready(function() {
    var breakDuration = 5; // unit is minutes
    var sessionDuration = 25; // minutes
    var start; //holds new Date() in other words current time
    var r = 100; // timer radius
    var o = 2 * r * Math.PI; // timer circumference
    var i = 0; // counts intervals
    var timerColor = "silver"; // timer and paragraph background color
    var pomodoroTimer, x, step; // interval; holds remaining time in seconds; visual animation step
    var soundOn = true;
    var stepCurrent = 0; // latest position of visual animation timer
    var expires = null; // length of current cycle in milliseconds
    var currentlyOn = "session"; // values session and break
    var focused;
    var ticking = false;
    var audio = new Audio("https://raw.githubusercontent.com/Beekey/timer/master/audio/A-Tone.mp3");
    var printRadialTimer = true;
    //----------------------------------------
    // set an event listener to detect and record the window
    //becoming invisible due to change of tab
    //minimilsation of the window or any other event
    // that makes the timer window invisible to the viewer
    function visibilityChanged() {
      if (printRadialTimer === true) printRadialTimer = false;
      else printRadialTimer = true;
    }
    document.addEventListener("visibilitychange", visibilityChanged);
    //------------------------------------------
    // calculates and prints initial session duration
    x = Math.round(sessionDuration * 60, 0);
    $("#timeLeft").text(displayTime(x));
    //-------------------------------------
    //------ display timer clock----
    // if time is hour or longer prints hours, minutes, seconds
    //if time is a minute or longer but less than hour prints minutes and seconds
    // if time is less than a minute prints seconds only
    // format hh:mm:ss
    function displayTime(timeInSeconds) {
      var toDisplay = "";
      var hours = Math.floor(timeInSeconds / 3600);
      timeInSeconds = timeInSeconds % 3600;
      var minutes = Math.floor(timeInSeconds / 60);
      var seconds = timeInSeconds % 60;
      if (hours !== 0) {
        toDisplay = hours + ":";
        if (minutes < 10) toDisplay += "0";
        toDisplay += minutes + ":";
        if (seconds < 10) toDisplay += "0";
        toDisplay += seconds;
      } else {
        if (minutes !== 0) {
          toDisplay = minutes + ":";
          if (seconds < 10) toDisplay += "0";
          toDisplay += seconds;
        } else toDisplay += seconds;
      }
      return toDisplay;
    } //end of display time
    //------------------------------
    // timer engine
    function timerOn() {
      //if running for the first time set initial values
      if (expires === null) {
        timerColor = "tomato";
        expires = sessionDuration * 60000;
        step = o / sessionDuration / 60;
        $("#progress").css("stroke-dasharray", stepCurrent + "," + o);
      }
      // set active color
      $("p").css("background-color", timerColor);
      $("#progress").css("stroke", timerColor);
      // if timer is working stop it
      if (ticking) {
        expires = x * 1000;
        clearInterval(pomodoroTimer);
        ticking = false;
        $("#timerStartStop").html("CLICK TO RESUME");
      } else {
        //if timer is inactive or paused activate it
        ticking = true;
        $("#timerStartStop").html("CLICK TO PAUSE");
        // get time to use it for determining the elapsed time
        start = new Date();
        // set interval to 50 miliseconds, print circle stroke animation once during
        // each interval and clock timer every 20th interval (once a second)
        // if window is invisible interval will repeate every 1000 milliseconds
        // regardless of  the setting below. Variable printRadialTimer is true
        // if the window is visible, if not it's false. Depending on its value
        // i will increase differently to reflect the change in interval time.
        // If window is not visible, cirle stroke timer will not print, but stepCurrent
        // will continue to hold the accurate latest position of the timer.
        pomodoroTimer = setInterval(function() {
          if (printRadialTimer) {
            i++;
            stepCurrent += step;
          } else {
            i += 19;
            stepCurrent += step * 19;
          }
          if (printRadialTimer) $("#progress").css("stroke-dasharray", stepCurrent / 20 + "," + o);
          if (i % 20 === 0 || !printRadialTimer) {
            x = Math.round((expires - (new Date - start)) / 1000, 0);
            $("#timeLeft").text(displayTime(x));
            // if timer is up play sound and switch to the next cycle
            // reset all values, change active color print new starting time
            if (x <= 0) {
              if (soundOn) audio.play();
              if (currentlyOn === "break") {
                currentlyOn = "session";
                expires = sessionDuration * 60000;
                step = o / sessionDuration / 60;
                timerColor = "tomato";
                $("p").css("background-color", timerColor);
                $("#progress").css("stroke", timerColor);
                x = Math.round(sessionDuration * 60, 0);
                $("#timeLeft").text(displayTime(x));
              } else {
                currentlyOn = "break";
                expires = breakDuration * 60000;
                step = o / breakDuration / 60;
                timerColor = "#93AB58";
                $("p").css("background-color", timerColor);
                $("#progress").css("stroke", timerColor);
                x = Math.round(breakDuration * 60, 0);
                $("#timeLeft").text(displayTime(x));
              }
              // reset the circle stroke timer to initial values, reset interval counter, set new starting date
              stepCurrent = 0;
              $("#progress").css("stroke-dasharray", stepCurrent + "," + o);
              i = 0;
              start = new Date;
            }
          }

        }, 50);
      }
    }
    //--------------------------------
    $("#clock").on("click", function() {
        timerOn();
      }) //end of click on play
      //-------------------------------
      // decrease break length, don't allow it to go under 1
    $("#break_minus").on("click", function() {
        if (breakDuration > 1) {
          breakDuration--;
          $("#break_duration").text(breakDuration);
        }
      })
      // increase break length, don't allow it to go over 300 (5 hours)
    $("#break_plus").on("click", function() {
        if (breakDuration < 300) {
          breakDuration++;
          $("#break_duration").text(breakDuration);
        }
      })
      // decrease session length, don't allow it to go under 1
      // if timer has not been activated change the remaining time display
      // on the timer
    $("#session_minus").on("click", function() {
        if (sessionDuration > 1) {
          sessionDuration--;
          if (expires === null) {
            x = Math.round(sessionDuration * 60, 0);
            $("#timeLeft").text(displayTime(x));
          }
          $("#session_duration").text(sessionDuration);
        }
      })
      // increase session length, don't allow it to go over 300 (5 hours)
    $("#session_plus").on("click", function() {
        if (sessionDuration < 300) {
          sessionDuration++;
          if (expires === null) {
            x = Math.round(sessionDuration * 60, 0);
            $("#timeLeft").text(displayTime(x));
          }
        }
        $("#session_duration").text(sessionDuration);
      })
      // if reset button is clicked, stop interval, reset all the values to initial
      // and start new cycle with current session time
    $("#refresh").on("click", function() {
        stepCurrent = 0;
        timerColor = "tomato";
        x = Math.round(sessionDuration * 60, 0);
        $("#timeLeft").text(displayTime(x));
        $("p").css("background-color", timerColor);
        $("#progress").css("stroke", timerColor);
        $("#progress").css("stroke-dasharray", stepCurrent + "," + o);
        i = 0;
        step = o / sessionDuration / 60;
        expires = null;
        ticking = false;
        currentlyOn = "session";
        clearInterval(pomodoroTimer);
        timerOn();
      })
      //------------------
      // toggle sound on and off
      // change sound icon to reflect current state
      // make sure the background color of 
      // title paragraph matches the rest of paragraphs
    $("#sound").on("click", function() {
      if (soundOn) {
        soundOn = false;
        $(this).html('<p>Sound</p><div id="noSoundIcon"><i class="fa fa-volume-off" title="Click to turn sound on"></i></div><div id="soundBox"><i id="noSound" class="fa fa-times"></i></div>')
      } else {
        soundOn = true;
        $(this).html('<p>Sound</p><i class="fa fa-volume-up" title="Click to turn sound off"></i>')
      }
      $("p").css("background-color", timerColor);
    })

  }) //end of document ready