var exec = require('child_process').exec;

var express = require("express");
var fs = require("fs");
var app = express();

app.set("views", __dirname+'/views');
app.set("view engine", "jade");
app.use('/static', express.static(__dirname+"/static"));
app.enable('trust proxy');

var config = JSON.parse(fs.readFileSync('configuration.json').toString());

var language = JSON.parse(fs.readFileSync('languages.json').toString())[config.language || 'en'];

var users = new Array();
for(var user; user=config.users.pop();)
	users.push({name: user.name, login: user.login,	pwd: user.pwd, "ok": false, "disabled": false});

function makeid(){
    var r = "", letters = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    for(var i=0; i<4; i++)
        r += letters.charAt(Math.floor(Math.random() * letters.length));
    return r;
}

var canPerformCall = true;

var idCount = 0;
var confirmCode = new Array();

function sendMessageTo(user, message){
	idCount = (idCount+1)%99;
	var code;
	confirmCode.push({code: code = makeid()+""+idCount+makeid(), user: user.name});
	if(fs.existsSync('./tmpfile'))
		fs.unlinkSync('./tmpfile');
	var command = 'wget --no-check-certificate -O tmpfile "https://smsapi.free-mobile.fr/sendmsg?user='+ user.login +'&pass='+user.pwd+'&msg='+encodeURIComponent(message+code)+'"';
	exec('set H+;'+command);
}

function ask(){
	var message = config.message.content + config.message.urlBase;
	for(var i in users)
		if(!users[i].ok && !users[i].disabled)
			sendMessageTo(users[i], message);
}
function souldIBlock(req, res){
	if(req.ip.substr(0,10)=='192.168.0.')
		return false;
	else{
		// res.end('Error 403');
		return false;
	}
}

app.get('/', function(req, res){
	if(!souldIBlock(req, res)){
		res.setHeader('Content-type', 'text/html');
		var usersForClient = [];
		for(var i in users)
			usersForClient.push({name: users[i].name, state: canPerformCall?'waiting':((users[i].ok)?'ok':'asking'), disabled: users[i].disabled});
		res.render('index', {users: JSON.stringify(usersForClient), language: language});
	}
});


app.get('/check', function(req, res){
	if(!souldIBlock(req, res)){
		res.setHeader('Content-type', 'text/html');
		var result = [];
		for(var i in users)
			if(users[i].ok)
				result.push(i);
		res.end('['+result.join(',')+']');
	}
});

app.get('/doNotCall/:name', function(req, res){
	if(!souldIBlock(req, res)){
		res.setHeader('Content-type', 'text/html');
		for(var i in users)
			if(users[i].name==req.params.name)
				users[i].disabled = true;
		res.end('done');
		setTimeout(function(){
			if(canPerformCall)
				for(var i in users)
					users[i].disabled = false;
		}, 35*1000);
	}
});
app.get('/performCall', function(req, res){
	if(!souldIBlock(req, res)){
		res.setHeader('Content-type', 'text/html');
		if(canPerformCall){
			canPerformCall = false;
			ask();
			res.end('done');
			setTimeout(function(){
				canPerformCall = true;
				for(var i in users){
					users[i].ok = false;
					users[i].disabled = false;
				}
				while(confirmCode.length)
					confirmCode.pop();
			}, 60*5*1000);
			for(var i in config.times)
				setTimeout(function(){
					ask();
				}, times[i]*1000);
		}else{
			res.end('error - alerady calling');
		}
	}
});

// app.get('/get-confirmCodes', function(req, res){
// 	res.setHeader('Content-type', 'text/html');
// 	res.end(JSON.stringify(confirmCode));
// });
// app.get('/get-users', function(req, res){
// 	res.setHeader('Content-type', 'text/html');
// 	res.end(JSON.stringify(users));
// });

app.get('/:id', function(req, res){
	res.setHeader('Content-type', 'text/html');
	var indexFound = -1;
	var u;
	for(var i in confirmCode)
		if(confirmCode[i].code == req.params.id){
			indexFound = i;
			u = confirmCode[i].user;
		}
	if(indexFound!=-1){
		for(var i in users)
			if(users[i].name==u)
				users[i].ok = true;
		delete confirmCode[indexFound];
		res.render('valid', {language: language});
	}else
		res.end('false');
});


app.listen(config.port);