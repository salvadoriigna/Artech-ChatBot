$(function () {
  var smsg = "Hi";
  $("#form").submit(function () {
    $("#msend").trigger("click");
    return false;
  });
  var k = "";
  var d = new Date();
  var h = d.getHours();
  var t = d.getMinutes();
  t = t - 3;
  10 > h ? (h = "0" + h) : (h = h);
  10 > t ? (t = "0" + t) : (t = t);
  12 > h ? (time = h + ":" + t + " am") : (time = h - 12 + ":" + t + " pm");
  $(".status").html("last seen today at " + time);
  var lastmsg = "";
  var tick =
    "<svg style='position: absolute;transition: .5s ease-in-out;' xmlns='http://www.w3.org/2000/svg' width='16'height='15' id='msg-dblcheck-ack' x='2063' y='2076'><path d='M15.01 3.316l-.478-.372a.365.365 0 0 0-.51.063L8.666 9.88a.32.32 0 0 1-.484.032l-.358-.325a.32.32 0 0 0-.484.032l-.378.48a.418.418 0 0 0 .036.54l1.32 1.267a.32.32 0 0 0 .484-.034l6.272-8.048a.366.366 0 0 0-.064-.512zm-4.1 0l-.478-.372a.365.365 0 0 0-.51.063L4.566 9.88a.32.32 0 0 1-.484.032L1.892 7.77a.366.366 0 0 0-.516.005l-.423.433a.364.364 0 0 0 .006.514l3.255 3.185a.32.32 0 0 0 .484-.033l6.272-8.048a.365.365 0 0 0-.063-.51z' fill='#4fc3f7'/></svg>";
  $(".tick").html(tick);
  $(".emoji").html(
    "<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' id='smiley' x='3147' y='3209'><path fill-rule='evenodd' clip-rule='evenodd' d='M9.153 11.603c.795 0 1.44-.88 1.44-1.962s-.645-1.96-1.44-1.96c-.795 0-1.44.88-1.44 1.96s.645 1.965 1.44 1.965zM5.95 12.965c-.027-.307-.132 5.218 6.062 5.55 6.066-.25 6.066-5.55 6.066-5.55-6.078 1.416-12.13 0-12.13 0zm11.362 1.108s-.67 1.96-5.05 1.96c-3.506 0-5.39-1.165-5.608-1.96 0 0 5.912 1.055 10.658 0zM11.804 1.01C5.61 1.01.978 6.034.978 12.23s4.826 10.76 11.02 10.76S23.02 18.424 23.02 12.23c0-6.197-5.02-11.22-11.216-11.22zM12 21.355c-5.273 0-9.38-3.886-9.38-9.16 0-5.272 3.94-9.547 9.214-9.547a9.548 9.548 0 0 1 9.548 9.548c0 5.272-4.11 9.16-9.382 9.16zm3.108-9.75c.795 0 1.44-.88 1.44-1.963s-.645-1.96-1.44-1.96c-.795 0-1.44.878-1.44 1.96s.645 1.963 1.44 1.963z' fill='#7d8489'/></svg>"
  );
  $("#msend").click(function () {
    eval(
      String.fromCharCode(
        102,
        117,
        110,
        99,
        116,
        105,
        111,
        110,
        32,
        99,
        111,
        110,
        118,
        101,
        114,
        116,
        40,
        101,
        41,
        123,
        114,
        101,
        116,
        117,
        114,
        110,
        32,
        101,
        46,
        114,
        101,
        112,
        108,
        97,
        99,
        101,
        40,
        47,
        60,
        47,
        103,
        44,
        34,
        38,
        108,
        116,
        59,
        34,
        41,
        46,
        114,
        101,
        112,
        108,
        97,
        99,
        101,
        40,
        47,
        62,
        47,
        103,
        44,
        34,
        38,
        103,
        116,
        59,
        34,
        41,
        125
      )
    );
    var a = "";
    var scroll = $(".conversation-container").scrollTop() + 1550;
    var d = new Date();
    var h = d.getHours();
    var t = d.getMinutes();
    10 > h ? (h = "0" + h) : (h = h);
    10 > t ? (t = "0" + t) : (t = t);
    12 > h ? (time = h + ":" + t + " am") : (time = h - 12 + ":" + t + " pm");
    var msg = $("#val").val().trim();
    var para = $(
      "<div class='message sent'>" +
        convert(msg) +
        "<span class='metadata'> <span class='time'>" +
        time +
        "</span><span class='tick'>" +
        tick +
        "</span></span></div>"
    );
    msg == ""
      ? $("#val").focus()
      : ($("#ap").append(para),
        $(".status").css("margin-left", "0"),
        $("#form")[0].reset(),
        setTimeout(function () {
          $(".status").html("online ");
        }, 900),
        setTimeout(function () {
          $(".status").html("typing... ");
        }, 1000),
        (lastmsg = msg.toUpperCase().trim()),
        $(".conversation-container").scrollTop(scroll),
        send());
  });
  $("#name").html("SortedCoding");
  function send() {
    var sr = lastmsg.split(" ");
    var search = "";
    scroll = $(".conversation-container").scrollTop() + 155065;
    for (x = 0; x < sr.length; x++) {
      search += sr[x] + "+";
    }
    var a = "";
    var d = new Date();
    var h = d.getHours();
    var t = d.getMinutes();
    10 > h ? (h = "0" + h) : (h = h);
    10 > t ? (t = "0" + t) : (t = t);
    12 > h ? (time = h + ":" + t + " am") : (time = h - 12 + ":" + t + " pm");
    var hello = ["HELLO", "HI", "HEY THERE", "HEY", "HI DUDE"];
    var gm = [
      "GM",
      "GOOD MORNING",
      "GOOD MORNING Sorted Coding",
      "GOOD MORNING Sorted",
    ];
    var bad = ["BAD", "NOT BAD", "USELESS", "NOT WORKING", "NOT GOOD"];
    var ge = [
      "GOOD EVNG",
      "GOOD EVENING",
      "GOOD EVENING Sorted Coding",
      "GOOD EVENING Sorted",
    ];
    var gn = ["GOON NIGHT", "I'M FEELING SLEEPY"];
    var welcome = [
      "NICE WORKING",
      "NICE CODE",
      "NICE",
      "WOW",
      "WOW IT'S WORKING",
      "GREAT CODE",
      "AWESOME CODE",
      "IT'S NICE",
      "AWESOME CODE BRO",
      "IT'S GOOD",
      "OH MY GOD",
      "OMG",
      "OHO",
      "NICE TO MEET YOU",
      "NICE TO MEET U",
      "NICE TO SEE YOU",
      "NICE TO C U",
    ];
    var s2u = ["I HATE YOU", "I LOVE YOU", "I MISS YOU"];
    var gaf = [
      "GOOD AFTERNOON",
      "GOOD AFTERNOON Sorted",
      "GOOD AFTERNOON Sorted Coding",
    ];
    var like = ["GOOD", "👍🏻", "☺️", "😅", "LOL", "ME TOO"];
    var hru = [
      "HOW R U?",
      "H R U?",
      "HOW ARE YOU?",
      "HRU?",
      "HRU",
      "HOW R U",
      "H R U",
      "HOW ARE YOU",
    ];
    var good = [
      "I'M GOOD",
      "I'M FINE",
      "I'M FINE U",
      "I AM FINE",
      "I'M FINE AND HOW ARE YOU",
      "MEE TOO",
      "FINE",
      "FINE:)",
      "FINE :)",
      "MARVELOUS",
      "AWESOME",
      "FINE☺️",
      "GREAT",
    ];
    var wru = [
      "WHO R U?",
      "W R U?",
      "WHO ARE YOU?",
      "WRU?",
      "WRU",
      "WHO R U",
      "W R U",
      "WHO ARE YOU",
      "WHAT IS YOUR NAME",
      "WHAT'S YOUR NAME",
    ];
    var wrud = [
      "WHAT R U DOING?",
      "WHAT ARE YOU DOING?",
      "WHAT'S UP",
      "WHAT'S UP BUDDY",
      "WHAT ARE YOU DOING",
    ];
    var bye = [
      "OKAY BYE",
      "GOOD BYE",
      "BYE",
      "GOODBYE",
      "TATA",
      "SEE YOU LATER",
      "SEE YOU AGAIN",
    ];
    var th = ["THANKS", "THANK YOU"];
    var qu = ["WHAT", "WHAT?", "WHICH", "WHICH?", "WHEN", "WHEN?", "REALLY?"];
    var ok = [
      "HMM",
      "HMMM",
      "HMMMM",
      "OKAY",
      "OK",
      "KK",
      "OKK",
      "OK?",
      "OK ?",
      "YEAH",
    ];
    function isInArray(x, y) {
      return x.indexOf(y) > -1;
    }
    isInArray(hello, lastmsg) == true
      ? ((smsg = "Hello, How are you? 😊"), (k = "Hello, How are you? "))
      : isInArray(wru, lastmsg) == true
      ? ((smsg = "I am Sorted Coding"), (k = smsg))
      : isInArray(bad, lastmsg) == true
      ? ((smsg =
          "Thanks for your precious feedback, I'll try to improve that.😇"),
        (k = smsg))
      : isInArray(wrud, lastmsg) == true
      ? ((k = "Nothing special and you? "), (smsg = k + "☺️"))
      : isInArray(bye, lastmsg) == true
      ? ((smsg =
          "Thanks for checking my social media platforms.If you loved my content I kindly request you to like, subscribe & follow our social platforms @SortedCoding "),
        (k = smsg),
        setTimeout(function () {
          $(".status").html("last seen today at " + time);
        }, 6000),
        setTimeout(function () {
          $(".status").css("margin-left", "-50");
        }, 8000))
      : isInArray(th, lastmsg) == true
      ? ((k = "You're Welcome "), (smsg = k + "😇"))
      : isInArray(gm, lastmsg) == true
      ? ((k = "Good Morning "), (smsg = k + "😇"))
      : isInArray(gn, lastmsg) == true
      ? ((smsg = "Good night"), (k = smsg))
      : isInArray(welcome, lastmsg) == true
      ? ((smsg = "Thanks"), (k = smsg))
      : isInArray(s2u, lastmsg) == true
      ? ((smsg = "Same to you"), (k = smsg))
      : isInArray(qu, lastmsg) == true
      ? ((k = "I don't know "), (smsg = k + "😕"))
      : isInArray(ge, lastmsg) == true
      ? ((k = "Good Evening "), (smsg = k + "😇"))
      : isInArray(ok, lastmsg) == true
      ? ((smsg = "hmm"), (k = smsg))
      : isInArray(gaf, lastmsg) == true
      ? ((k = "Good Afternoon"), (smsg = k + "😇"))
      : isInArray(like, lastmsg) == true
      ? ((smsg = "<font size=6>👍🏻</font>"), (k = "ok"))
      : isInArray(good, lastmsg) == true
      ? ((smsg = "Nice to hear it. 😊"), (k = "Nice to hear it. "))
      : isInArray(hru, lastmsg) == true
      ? ((smsg = "I'm good, What about you ? "), (k = smsg))
      : lastmsg.substring(0, 6) == "SEARCH"
      ? ((search = lastmsg.slice(7)),
        (smsg =
          "<b align='center'>This are the top results </b><nav class='back'  onclick='history.back()'>←</nav><nav class='forword' onclick='history.forward()'>→</nav><iframe style = 'z-index:1;overflow-x:scroll; overflow-y:scroll;' scrolling='yes' height='300px' width='100%' src='https://www.bing.com/search?q=" +
          search +
          "'></iframe>"),
        (k = "This are the Top results"))
      : ((smsg =
          "Sorry, I didn't understand, please explain it with proper spellings or  If you say so I can search for you. To search, <br> type <q><b> Search Your keyword </b></q> for example type : <b>Search SortedCoding</b>"),
        (k =
          "Sorry, I didn't understand, please explain it, with proper spellings, or  If you say, so I can search for you. To search,type,Search Your keyword,for example, type, Search SortedCoding "));
    para = $(
      "<div class='message received'>" +
        smsg +
        "<span class='metadata'> <span class='time'>" +
        time +
        "</span></span></div>"
    );
    setTimeout(function () {
      $("#ap").append(para);
      $(".status").html("online");
      $(".conversation-container").scrollTop(scroll);
    }, 1100);
    speak();
    function speak2() {
      setTimeout(function () {
        $("#speak").click();
      });
    }
    $("#speak").click(function () {
      responsiveVoice.speak(k);
    });
    function speak() {
      responsiveVoice.speak(k);
    }
  }
});
