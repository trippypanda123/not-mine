
//plz don't steal the code without giving me credit (Sh0T).
const fork = require('child_process').fork;
const botHandlerFile = './bot.js';
const request = require('request');
const WebSocket = require('ws');
const chalk = require('chalk');
var newestVersion = 1.0;
var botHandler = null;
var serverIp = 'none';
var started = false;
var origin = 'None';
var httpProxys = [];
var connected = 0;
var version = 1.0;
var botCount = 0;
var pkt255 = [];
var pkt254 = [];
var port = 8888;

console.log(chalk.green('Subscribe To LegendaryBoi!'));

function bufToArray(buf) {
	var ab = [];
	for (var i = 0; i < buf.byteLength; i++) {
		ab.push(buf.getUint8(i, true));
	}
	return ab;
}

function checkForUpdate() {
	if (version == newestVersion) return '';
	return '\n[UPDATE DETECTED]';
}

function startBots(server, origin) {
	if (started) return;
    botHandler = fork(botHandlerFile);
    transferData({
      "type": "init",
      "server": server,
	  "origin": origin,
	  "254": pkt254,
	  "255": pkt255
    });
    setupBotHandler();
}
function stopBots() {
    if (botHandler) {
      botHandler.kill();
      botHandler = null;
    }
	botCount = 0;
	started = false;
}

function setupBotHandler() {
	botHandler.on('message', message => {
		let msg = JSON.parse(message);
		switch (msg.type) {
			case 'botsInfo':
				botCount = msg.data;
				break;
		}
	});
}

function transferData(data) {
	if (!botHandler) return;
	try {
		botHandler.send(JSON.stringify(data));
	} catch (e) {}
}

function clear() {
	process.stdout.write('\033c');
}

function toArrayBuffer(buf) {
	var ab = new ArrayBuffer(buf.length);
	var view = new Uint8Array(ab);
	for (var i = 0; i < buf.length; ++i) {
		view[i] = buf[i];
	}
	return ab;
}

setTimeout(() => {
	console.log(chalk.hex('#FFEC00')('LOADING WEBSOCKET SERVER! PLEASE WAIT!'));
	var wss = new WebSocket.Server({
		port: port
	});
	wss.on('connection', (ws, req) => {
		connected++;
		if (connected > 1) ws.close(4444, 'FULL');
		ws.on('close', () => {
			connected--;
			if (connected == 0) {
				stopBots();
				botCount = 0;
			}
		});
		origin = req.headers.origin;
		var ip = req.connection.remoteAddress;
		ip = ip.replace('::ffff:', '');
		//console.log(ip);
		//if (ip !== '134.41.135.78') ws.close(4444, 'FULL');
		ws.on('error', () => {});
		ws.on('message', function(data) {
			try {
				data = new DataView(toArrayBuffer(data));
				opcode = data.getUint8(0);
				switch (opcode) {
					case 0: // start
						if (serverIp && serverIp !== 'none') startBots(serverIp, origin);
						break;
					case 1: // stop bots
						stopBots();
						break;
					case 2: // split / eject
						transferData({
							"type": 'action',
							"data": data.getUint8(1) == 0 ? 'split' : 'eject'
						});
						break;
					case 3: // server ip
						var offset = 1;
						serverIp = '';
						for (; offset < data.byteLength - 1; ) {
							serverIp += String.fromCharCode(data.getUint16(offset, true));
							offset += 2;
						}
						//for (let bot of bots) bot.server = serverIp;
						//serverIp = `${data.getUint8(1)}.${data.getUint8(2)}.${data.getUint8(3)}.${data.getUint8(4)}:${data.getUint16(5, true)}`;
						break;
					case 4: // pelletmode
						//data.getUint8(1) == 1 ? pelletMode = true : pelletMode = false;
						break;
					case 16: // cords
						//for (let bot of bots) bot.send(data);
						transferData({
							"type": 'send',
							"data": bufToArray(data)
						});
						break;
					case 254:
						pkt254 = [];
						for (var i = 1; i < data.byteLength; i++) {
							pkt254.push(data.getUint8(i));
						}
						transferData({
							"type": 'pkt254',
							"data": pkt254
						});
						break;
					case 255:
						pkt255 = [];
						for (var i = 1; i < data.byteLength; i++) {
							pkt255.push(data.getUint8(i));
						}
						transferData({
							"type": 'pkt255',
							"data": pkt255
						});
						break;
				}
			} catch (e) {
				console.log(e);
			}
		});
	});
	console.log(chalk.green('Loaded WebSocket Server!'));
	request(
		{
			url: 'https://pastebin.com/raw/KSJRTWVH'
		},
		function(error, response, body) {
			if (error) console.log(chalk.red('FAILED TO GET NEWEST VERSION!!!! ERROR: ' + error));
			newestVersion = body;
		}
	);
	setInterval(() => {
		clear();
		console.log(
			`${chalk.hex('#FFEC00')('[Agar Clone Smasher v' + '1.0' + ']\n[Latest version]: ' + newestVersion + checkForUpdate())}
            ${chalk.hex('#FFEC00')('[Connected Users]:')} ${connected > 0 ? chalk.green(connected) : chalk.red(connected)}${chalk.green(
				' / 1'
			)}
            ${chalk.hex('#FFEC00')('[Port]:')} ${chalk.green(port)}
            ${chalk.hex('#FFEC00')('[Bots in use]:')} ${botCount > 1 ? chalk.green(botCount) : chalk.red(botCount)}
            ${chalk.hex('#FFEC00')('[Server]:')} ${serverIp == 'none' ? chalk.red(serverIp) : chalk.green(serverIp)}
            ${chalk.hex('#FFEC00')('[Origin]: ')} ${chalk.green(origin)}
            `
		);
	}, 1000);
}, 1000);
