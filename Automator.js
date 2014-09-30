var irc = require('irc');
var util = require('util');
var validator = require('validator');
var sys = require('sys')
var exec = require('child_process').exec;
var wolfram = require('wolfram').createClient("[CENSORED]");

var msgs = [];

var dictionary = [];

var wotd = null;

var staff = ['justin97530', 'kurisubrooks', 'Kurisu', 'Automator'];
var staffmask = ['*!*@hi.my.name.is.justin97530.ga', '*!*@i.am.kurisubrooks.com']

var config = {
	channels: ["#webdev"],
	server: "irc.esper.net",
	botName: "Automator",
	port: 5555
};

var bot = new irc.Client(config.server, config.botName, {
	userName: config.botName,
	realName: config.botName,
	port: config.port,
	channels: config.channels
});

function say(channel, message) {
	bot.say(channel, message);
	console.log("[" + channel + "]" + config.botName + ": " + message)
}

function shell(error, stdout, stderr) {
	say("Error: " + error);
	say("Stdout: " + stdout);
}

bot.addListener("registered", function(message) {
	console.log("Connection established");
	bot.send("PRIVMSG", "NickServ", "identify [CENSORED]");
});

bot.addListener("error", function(message) {
	console.log(message);
});

bot.addListener("join", function(channel, nick, message) {
	if(nick == config.botName) return;
	say(channel, "Welcome, " + nick + ". Please note the rules and be nice!");
});

bot.addListener("-mode", function(channel, by, mode, argument, message) {
	if(argument.charAt(0) != "#") {
		if(staff.indexOf(argument) != -1) {
			if(argument == config.botName && mode == "o") {
				bot.say(channel, "Hey, not nice!");
				bot.say(channel, "!op");
			} else if(mode == "o") {
				bot.say(channel, "Don't do that!");
				bot.send("MODE", channel, " +o ", argument);
			}
		}
	}
});

bot.addListener("+mode", function(channel, by, mode, argument, message) {
	if(argument.charAt(0) != "#") {
		if(staff.indexOf(argument) == -1) {
			if(mode == "o") {
				bot.say(channel, "I don't think you're supposed to be op....");
				bot.send("MODE", channel, " -o ", argument);
			}
			if(staffmask.indexOf(argument) != -1) {
				if(mode == "b") {
					bot.say(channel, "Rude!")
					bot.send("MODE", channel, " -b ", argument)
				}
			}
		}
	}
});

bot.addListener("message", function(from, to, text, object) {
	console.log("[" + to + "]" + from + ": " + text);
	if(from == config.botName) return;
	text.split(" ").forEach(function(word) {
		filteredWord = word.replace (/[.,?!\s,*;\\//]/g, " ");
		if(dictionary.indexOf(filteredWord) == -1) {
			dictionary.push(filteredWord);
		}
	});
	if
	86400000
	if(text.charAt(0) == "$") {
		var msgvar = text.split(" ");
		var cmd = msgvar[0].substr(1).toLowerCase();
		msgvar.splice(0, 1);
		if(staff.indexOf(from) != -1) {
			if(cmd == "$say") {
				say(to, msgvar.join(" "));
			} else if(cmd = "$getwotd") {
				say(to, "WOTD: " + wotd);
			}
		}
		
		if(cmd == "host") {
			if(msgvar[0] == null) {
				say(to, "Usage: " + text.charAt(0) + "host <IP/Hostname>");
				return;
			}
			if(validator.isIP(msgvar[0]) || validator.isFQDN(msgvar[0])) {
				exec("host " + msgvar[0], function(error, out, exitcode) {
					try {
						say(to, out);
					} catch(ex) {
						say(to, "Internal error occurred: " + ex)
					}
				});
			} else {
				say(to, "That doesn't look like an IP or Hostname! Try again.")
			}
		} else if(cmd == "kurisu") {
			say(to, "Kurisu... GIVE ME CARAMEL, NAO!")
		} else if(cmd == "w") {
			wolfram.query(msgvar.join(" "), function(err, result) {
				try {
					say(to, result);
					if(result[0] == undefined) {
  						say(to, "Result not found!");
  						return;
  					} else {
  						var res = [];
						for(var i = 0; i < result.length; i += 1) {
        					if(result[i] !== undefined) {
        						res.push(result[i]);
    						}
    					}
    					res.forEach(function(it) {
    						say(to, it.title + ":");
    						say(to, it.subpods[0].value);
						});
  					}
				} catch(ex) {
					say(to, "Internal error occurred: " + ex)
				}
			});
		} else if(cmd == "s") {
			if(msgvar[0] == null) {
				say(to, "Usage: " + text.charAt(0) + "s <Find>/<Replace>");
				return;
			}
			var sequence = msgvar.join(" ").split("/");
			var find = sequence[0];
			var replace = sequence[1];
			var match = null;
			msgs.every(function(msg) {
				if(msg.indexOf(find) != -1) {
					match = msg;
					console.log(msg);
					return false;
				} else {
					return true;
				}
			});
			if(match == null) {
				say(to, "Did not find " + find + " in any recent messages.");
			} else {
				say(to, "Correction, " + match.replace(find, replace))
			}
		} else {
			say(to, "Unknown command");
			return;
		}
		return;
	} else {
		if(msgs.length == 50) {
			msgs.splice(49, 1);
		}
		msgs.unshift("<" + from + "> " + text);
	}
});