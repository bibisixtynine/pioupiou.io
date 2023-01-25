//*eslint no-undef: 0*/
// this could be to avoid all undefined... (just delete one '/'' at the begining)

/* global io, ace, Swal */
// this is to avoid 'io is not defined' with a red dot for example with socket.io'

////////////////////////////////////////////////////////////////////
// <body onload=with(c.getContext('2d'))for(m=8e4;m;rotate(--m&-m&m/2?11:-11))fillRect(0,0,1,1),translate(1,0)><canvas id=c>


const GLITCH = true

//////////////////////////
//
// class : Network
// version : 2021-9-8 18:00
//
class Network {
  constructor() {
    console.clear();

    this.players = {};

    if (!localStorage.pioupiouName) this.name = "helpme";
    else {
      this.name = localStorage.pioupiouName;
    }

    //this.name = "Piou-" + (Math.random() * 100).toFixed(0);
    console.log("> my name is ", this.name);

    document.title = this.name;

    if (GLITCH)
      var socket = io.connect("https://pioupiou.glitch.me"); // Glitch hosted server
    else
      var socket = io.connect("ws://localhost:3000"); // Local hosted server

    Network.socket = socket;

    socket.emit("initialize", { name: this.name });

    var self = this;

    socket.onAny((event, data) => {
      //socket.broadcast.emit(event,data);
      //console.log('# onAny received at ' + Date());
      //console.log(' > event : ' + event);
      //console.log(' > data : ', + data);
    });

    socket.on("playerData", data => {
      self.onPlayerData(data);
    });
    socket.on("playerJoined", data => {
      self.onPlayerJoined(data);
    });
    socket.on("message", data => {
      self.onMessage(data);
    });
    socket.on("killPlayer", id => {
      self.onKillPlayer(id);
    });
  }

  onPlayerData(data) {
    this.players = data.players; // all players data
    Network.id = data.id; // unique id given by the server

    //jbjbconsole.log('> my unique ID is ' + Network.id);
    /*let newId = "id" + rnd(1, 10000).toString();
    addBox(newId);
    //setText(newId, "this is a new text in " + newId + " box !<br>");
    setText(newId, "toi : " + this.name + "<br>");
    setTitle(newId, "qui est en ligne ?");

    for (var id in this.players) {
      if (id != Network.id) {
        console.log("> ", this.players[id].name, " (id:", id, ") is present");
        appendText(newId, this.players[id].name + "<br>");
      }
    }*/

    this.initialized = true;
    console.log("> server connection established !");
  }

  onPlayerJoined(data) {
    this.players[data.id] = data;
    // console.log('> ',data.name,' (id:',data.id,') joined');
  }

  onPlayerMoved(data) {
    if (this.initialized) {
      console.log(
        "> ",
        data.name,
        " (id:",
        data.id,
        ") moved to x=",
        data.pos.x
      );
    }
  }

  onMessage(data) {
    if (this.initialized) {
      console.log(data.name, data.message);
      document.title = data.message;
      self = this;
      setTimeout(function() {
        document.title = self.name;
      }, 1000);
      // if (localStorage.pioupiouName!='message') return
      // tempo : display received message only if in Message Space
      let newId = "id" + rnd(1, 10000).toString();
      addBox(newId);
      setText(newId, data.message);
      setTitle(newId, data.name);
    }
  }

  onKillPlayer(id) {
    //console.log('> ',this.players[id].name,' (id:',id,') left the game');
    delete this.players[id];
  }

  sendMessage(msg) {
    if (this.initialized) {
      // console.log("> I send : <",msg,">");
      let data = {
        id: Network.id,
        name: this.name,
        message: msg
      };
      Network.socket.emit("message", data);
    }
  }

  save(code) {
    if (this.initialized) {
      // console.log("> I send : <",msg,">");
      let data = {
        id: Network.id,
        name: this.name,
        code: code
      };
      Network.socket.emit("save", data);
    }
  }

  setDirectory(msg) {
    if (this.initialized) {
      // console.log("> I send : <",msg,">");
      let data = {
        id: Network.id,
        name: this.name,
        message: msg
      };
      Network.socket.emit("directory", data);
    }
  }

  send(event, data) {
    if (this.initialized) {
      Network.socket.emit(event, data);
    }
  }
}

Network.id = null;
Network.socket = null;
// Network class
////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////
//
var evaluate = function(code, fromId) {
  var fn = new Function(["myId"], code);
  let result = "ok";
  try {
    fn(fromId);
  } catch (error) {
    console.error("!! OUPS !! CATCHED ERROR in client.js !! : ", error);
    let id = "ERROR" + "_" + fromId;
    addBox(id, fromId, "error");
    setText(id, error);
  }
};

////////////////////////////////////////////////////////////////////
//
function rnd(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

var log = console.log;
//
////////////////////////////////////////////////////////////////////

function capitalizeFirstLetter(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

////////////////////////////////////////////////////////////////////
//
var timers = [];
function setTimer(fct, interval) {
  timers.push(setInterval(fct, interval));
}

// clear all timers in the array
function clearAllTimers() {
  for (let i = 0; i < timers.length; i++) {
    clearInterval(timers[i]);
  }
  timers = [];
}

////////////////////////////////////////////////////////////////////////
// setColor
function setColor(id, color) {
  var style = (document.querySelector(
    "#" + id + "-editable"
  ).style.color = color);
}

////////////////////////////////////////////////////////////////////////
// setText(id,title)
function setText(id, text) {
  var textElement = document.querySelector("#" + id + "-editable");
  textElement.innerHTML = text;
} ////////////////////////////////////////////////////////////////////////

// setTitle(id,title)
function setTitle(id, text) {
  var textElement = document.querySelector("#" + id + "-title");
  textElement.innerHTML = text;
}

////////////////////////////////////////////////////////////////////////
// setText(id,className,title)
function appendText(id, text) {
  var textElement = document.querySelector("#" + id + "-editable");
  textElement.innerHTML += text;
}

////////////////////////////////////////////////////////////////////////
//
// addBox(id,className,title)
//

function span(id, className, caption) {
  return (
    "<span class='" +
    className +
    "' id='" +
    id +
    "-" +
    className +
    "'>" +
    caption +
    "</span>"
  );
}

function onEventFromIdDo(event, from, id, fct) {
  let elem = document.querySelector("#" + id + "-" + from);
  elem.addEventListener(event, fct);
}

function addMessage(elem) {
  // 1) create the div element
  var divElement = document.createElement("div")

  divElement.className = "message last"

  divElement.innerHTML = elem.textContent + '<br>'
  com.sendMessage(elem.textContent)

  // 2) add the div element at the end of #boxesDiv

  let boxesDiv = document.querySelector("#mineLastMessages");
  boxesDiv.lastElementChild.className = "message"
  boxesDiv.appendChild(divElement)
  elem.innerHTML = ''
  elem.focus()
}

function addBox(id, fromId, error) {
  let isBoxAlreadyThere = document.querySelector("#box-" + id);
  if (isBoxAlreadyThere) return;

  // 1) create the div element
  var divElement = document.createElement("div");
  divElement.id = "box-" + id;

  if (error) divElement.className = "boxError";
  else divElement.className = "box";

  let saveButton = span(id, "saveButton", "SAVE");
  let boxTitle = span(id, "title", id);
  let closeBoxButton = span(id, "closeBoxButton", "x");
  let execButton = span(id, "execButton", "EXEC");
  let addBoxButton = span(id, "addBoxButton", "+");
  let boxFooterTitle = span(id, "boxFooterTitle", ":-)");

  divElement.innerHTML +=
    "<div class='boxTop'>" +
    boxTitle +
    saveButton +
    closeBoxButton +
    "</div>" +
    "<div id='" +
    id +
    "-editable' class='editable' contenteditable='true'><p>-</p></div>" +
    "<div class='boxFooter'>" +
    execButton +
    boxFooterTitle +
    addBoxButton +
    "</div>";

  // 2) add the div element at the end of #boxesDiv
  if (fromId) {
    var boxe = document.querySelector("#box-" + fromId);
    boxe.after(divElement);
  } else {
    var boxesDiv = document.querySelector("#boxesDiv");
    boxesDiv.appendChild(divElement);
  }

  var aPara = document.querySelector("#" + id + "-execButton");
  aPara.addEventListener("click", function() {
    let codeElement = document.querySelector("#" + id + "-editable");

    // convert ios safari (reg1) charCode 8216 & 8217 to <'>, (reg2) 8220 & 8221 to <">
    // they look the same... but are not the same... and charCode don't match the
    // javascript compiler requirement
    let reg1 = new RegExp(
      "[" +
        String.fromCharCode(8216) +
        String.fromCharCode(8217) +
        String.fromCharCode(8242) +
        "]",
      "g"
    );
    let reg2 = new RegExp(
      "[" +
        String.fromCharCode(8220) +
        String.fromCharCode(8221) +
        String.fromCharCode(8243) +
        String.fromCharCode(187) +
        String.fromCharCode(171) +
        "]",
      "g"
    );
    let code = codeElement.innerText.replace(reg1, "'");
    code = code.replace(reg2, '"');
    let footerTitle = document.querySelector("#" + id + "-boxFooterTitle");
    footerTitle.innerHTML = '<span style="color: #ff0000">#ERROR#</span>';
    setTimeout(function() {
      let footerTitle = document.querySelector("#" + id + "-boxFooterTitle");
      footerTitle.innerHTML = '<span style="color: #440000">#ERROR#</span>';
    }, 1000);

    let start = Date.now();
    evaluate(code, id);
    let end = Date.now();
    let elapsedTime = end - start;
    console.log("tryed to execute :");
    console.log(code);

    footerTitle.innerHTML =
      '<span style="color: #ffffff"> éxécuté en ' + elapsedTime + "ms</span>";
    setTimeout(function() {
      let footerTitle = document.querySelector("#" + id + "-boxFooterTitle");
      footerTitle.innerHTML =
        '<span style="color: black">' + elapsedTime + "ms</span>";
    }, 1000);
  });

  // [focus]
  aPara.addEventListener("focus", function() {
    console.log("focus from <" + id + ">");
  });

  // [blur]
  aPara.addEventListener("blur", function() {
    console.log("blur from <" + id + ">");
  });

  // [X] close button
  aPara = document.querySelector("#" + id + "-closeBoxButton");
  aPara.addEventListener("click", function() {
    console.log("close from <" + id + ">");
    let elem = document.querySelector("#box-" + id);
    elem.remove();
  });

  // [+] add box button
  aPara = document.querySelector("#" + id + "-addBoxButton");
  aPara.addEventListener("click", function() {
    console.log("close from <" + id + ">");
    let ID = "id" + rnd(1, 100000);
    addBox(ID, id);
    setText(ID, "-");
  });

  // [SAVE] button
  aPara = document.querySelector("#" + id + "-saveButton");
  aPara.addEventListener("click", function() {
    let date = smallDate();
    let footerTitle = document.querySelector("#" + id + "-boxFooterTitle");
    footerTitle.innerHTML =
      '<span style="color: #ffffff">saving ' + date + "</span>";
    setTimeout(function() {
      let footerTitle = document.querySelector("#" + id + "-boxFooterTitle");
      footerTitle.innerHTML = '<span style="color: lime">' + date + "</span>";
    }, 1000);

    let elem = document.querySelector("#" + id + "-editable");
    let code = elem.innerHTML;
    com.save(code);
  });
}

function smallDate() {
  let days = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
  let date = new Date();
  return (
    days[date.getDay()] +
    " " +
    date.getHours() +
    ":" +
    ("0" + date.getMinutes()).slice(-2) +
    ":" +
    ("0" + date.getSeconds()).slice(
      -2
    ) /*+
    "." +
    (date.getMilliseconds() + "000").slice(0, 1)*/
  );
}

//
// addBox(id,className,title)
//
////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////
//
// MAIN
//

let com = new Network();
/*
let onPioupiou = function() {
  Swal.fire({
    title: "Entrez votre identifiant ou helpme",
    input: "text",
    inputAttributes: {
      autocapitalize: "off"
    },
    showCancelButton: true,
    confirmButtonText: "Connect",
    showLoaderOnConfirm: true,
    preConfirm: login => {
      return fetch(`//api.github.com/users/${login}`)
        .then(response => {
          if (!response.ok) {
            throw new Error(response.statusText);
          }
          return response.json();
        })
        .catch(error => {
          Swal.showValidationMessage(`Request failed: ${error}`);
        });
    },
    allowOutsideClick: () => !Swal.isLoading()
  }).then(result => {
    if (result.isConfirmed) {
      let e = document.getElementById("pioupiouId");
      localStorage.pioupiouName = capitalizeFirstLetter(result.value.login);
      e.innerHTML = `connected to <span style="color:yellow">${localStorage.pioupiouName}</span>'s github`;

      Swal.fire({
        title: `Welcome ${localStorage.pioupiouName} !`,
        imageUrl: result.value.avatar_url
      }).then(result => {
        console.log("# New id <" + localStorage.pioupiouName + "> => reload !");
        location.reload();
      });
    }
  });
};
*/




let onPioupiou = function() {
  Swal.fire({
    title: 'Entrez votre identifiant ou helpme',
    input: 'text',
    preConfirm: (value) => {
      if (!value) {
        Swal.showValidationMessage(
          '<i class="fa fa-info-circle"></i> Votre identifiant est requis'
        )
      }
    }
  }).then((result) => {

    if (true) {
      let e = document.getElementById("pioupiouId");
      localStorage.pioupiouName = capitalizeFirstLetter(result.value);
      console.log('#########')
      console.log(result)
      e.innerHTML = `connecté à <span style="color:yellow">${localStorage.pioupiouName}</span>`;

      Swal.fire({
        title: `Bienvenue ${localStorage.pioupiouName} !`,
        timer:3000,
        showConfirmButton: false,
        timerProgressBar: true
      }).then(result => {
        console.log("# New id <" + localStorage.pioupiouName + "> => reload !");
        location.reload();
      });
    }

  })

}

if (!localStorage.pioupiouName) onPioupiou();
else {
  let e = document.getElementById("pioupiouId");
  console.log("e = ", e);
  e.innerHTML = `L'extraordinaire espace de <span style="color:yellow">${localStorage.pioupiouName}</span>`;
}

//
// MAIN
//
////////////////////////////////////////////////////////////////////////
