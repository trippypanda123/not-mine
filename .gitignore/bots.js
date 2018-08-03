//plz don't steal the code without giving me credit (Sh0T).
const HttpProxyAgent = require('http-proxy-agent');
const Writer = require('./DataFrameWriter');
const request = require('request');
const WebSocket = require('ws');
const chalk = require('chalk');
const Socks = require('socks');
const btoa = require('btoa');
const fs = require('fs');
var startInterval = null;
var pelletMode = false;
var socksProxys = [];
var proxyAgents = [];
var spawnMass = 1000;
var origin = 'None';
var httpProxys = [];
var botsPerIp = 3;
var botCount = 0;
var pkt255 = [];
var pkt254 = [];
var token = '';
var bots = [];
var json_send = {};
json_send.email = 'test@teqt.teqt';
json_send.pwd = 'testBotAcc';
json_send.udi = 'WKzXGR7zuVN89JFjbHLQDc1XB11srcvwfLom38HDBjjSAGTc5JbvWHzMG7t7YPmW';
var toSend = btoa(JSON.stringify(json_send));
request(
	{
		url: 'http://api.agariohub.net/login/' + toSend
	},
	function(error, response, body) {
		var data = JSON.parse(body);
		if (data.state == 'success') token = data.token;
	}
);

setInterval(() => {
	request(
		{
			url: 'http://api.agariohub.net/login/' + toSend
		},
		function(error, response, body) {
			var data = JSON.parse(body);
			if (data.state == 'success') token = data.token;
			console.log(data.token);
		}
	);
}, 300000);
function loadAgents() {
	for (var i = 0; i < botsPerIp; i++) {
		for (var proxy of socksProxys) {
			proxy = proxy.split(':');
			proxyAgents.push(
				new Socks.Agent({
					proxy: {
						ipaddress: proxy[0],
						port: parseInt(proxy[1]),
						type: parseInt(proxy[2]) || 5
					}
				})
			);
		}
		for (var proxy of httpProxys) proxyAgents.push(new HttpProxyAgent('http://' + proxy));
	}
	return `Loaded ${proxyAgents.length} proxy agents!`;
}

console.log(chalk.hex('#FFEC00')('LOADING PROXYS! PLEASE WAIT!'));
fs.readFile('./socks.txt', 'utf-8', (err, data) => {
	if (err) console.log(chalk.red('ERROR: ' + err));
	socksProxys = data.split('\n');
	console.log(chalk.green(`Loaded ${socksProxys.length} socks proxys!`));
	fs.readFile('./http.txt', 'utf-8', (errr, dataa) => {
		if (errr) console.log(chalk.red('ERROR: ' + errr));
		httpProxys = dataa.split('\n');
		console.log(chalk.green(`Loaded ${httpProxys.length} http proxys!`));
		console.log(chalk.green(`Loaded ${httpProxys.length + socksProxys.length} total proxys!`));
		console.log(chalk.hex('#FFEC00')(`Loading proxy agents for bots!`));
		console.log(chalk.green(loadAgents()));
	});
});

class Bot {
	constructor(id, server) {
		this.server = server;
		this.id = id;
		this.ws = null;
		this.closed = false;
		this.loginKey = '';
		this.connect();
	}

	connect() {
		if (this.server == 'none' || !this.server) return;
		this.ws = new WebSocket(this.server, {
			headers: {
				'Accept-Encoding': 'gzip, deflate',
				'Accept-Language': 'en-US,en;q=0.9',
				'Cache-Control': 'no-cache',
				Cookie: '__cfduid=d5cbe3d31a8e3114c0b71bbf9ba3bdc1c1513714723; _ga=GA1.2.621178013.1520737994; __qca=P0-1095941373-1520900229131',
				Origin: origin,
				Pragma: 'no-cache',
				'Sec-WebSocket-Extensions': 'permessage-deflate; client_max_window_bits',
				'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.181 Safari/537.36'
			},
			agent: proxyAgents[this.id]
		});
		this.binaryType = 'nodebuffer';
		this.ws.onopen = this.onopen.bind(this);
		this.ws.onclose = this.onclose.bind(this);
		this.ws.onerror = this.onerror.bind(this);
	}
	onopen() {
		switch (origin) {
			case 'http://togarcell.gq':
			case 'http://agarmin.co.nf':
				this.send(new Uint8Array([254, 6, 0, 0, 0]));
				this.send(new Uint8Array([255, 1, 0, 0, 0]));
				break;
			case 'http://oldagar.pro':
			case 'http://agar.red':
				this.send(new Uint8Array([254, 5, 0, 0, 0]));
				this.send(new Uint8Array([255, 0, 0, 0, 0]));
				break;
			case 'http://cellcraft.io':
				this.send(new Buffer([254, 5, 0, 0, 0]));
				this.send(new Buffer([255, 50, 137, 112, 79]));
				this.send(new Buffer([42]));
				break;
			case 'http://agar.bio':
			case 'http://play.agario0.com':
			case 'http://agariohub.net':
				this.send(new Buffer([254, 1, 0, 0, 0]));
				var msg = new DataView(new ArrayBuffer(5));
				msg.setUint8(0, 255);
				msg.setUint32(1, 1332175218, true);
				this.send(msg);
				if (origin == 'http://agariohub.net' && token) {
					var msg = new DataView(new ArrayBuffer(1 + 2 * token.length));
					msg.setUint8(0, 30);
					for (var i = 0; i < token.length; ++i) msg.setUint16(1 + 2 * i, token.charCodeAt(i), true);
					this.send(msg);
				}
				break;
			default:
				this.send(new Uint8Array(pkt254));
				this.send(new Uint8Array(pkt255));
		}
		this.spawn('CloneSmasher.ml');
		setInterval(() => {
			this.spawn('CloneSmasher.ml');
		}, 3000);
	}
	spawn(name) {
		switch (origin) {
			case 'http://togarcell.gq':
			case 'http://agarmin.co.nf':
				var writer = new Writer(true);
				writer.setUint8(0);
				writer.setStringUTF8(name);
				this.send(writer.build());
				break;
			case 'http://agar.red':
				var skins = [
					'fly',
					'spider',
					'wasp',
					'lizard',
					'bat',
					'snake',
					'fox',
					'coyote',
					'hunter',
					'sumo',
					'bear',
					'cougar',
					'panther',
					'lion',
					'crocodile',
					'shark',
					'mammoth',
					'raptor',
					't-rex',
					'kraken'
				];
				var userNickName = '{' + skins[Math.floor(Math.random() * skins.length)] + '}' + name;
				var msg = new DataView(new ArrayBuffer(1 + 2 * userNickName.length));
				msg.setUint8(0, 0);
				for (var i = 0; i < userNickName.length; ++i) msg.setUint16(1 + 2 * i, userNickName.charCodeAt(i), true);
				this.send(msg);
				break;
			case 'http://cellcraft.io':
				this.send(new Buffer([42]));
				var bytes = [];
				bytes.push(0);
				bytes.push(59); //59 for cellcraft and galx
				for (var i = 0; i < name.length; i++) {
					bytes.push(0);
					bytes.push(name.charCodeAt(i));
				}
				bytes.push(0);
				this.send(new Uint8Array(bytes));
				break;
			case 'http://agariohub.net':
				var _0x57c882 = ~~(Math["random"]() * 900000);
				_0x57c882 += 100000;
				_0x57c882 *= 1019;
				_0x57c882 += 73;
				_0x57c882 = _0x57c882["toString"](36);
				name = _0x57c882 + "&" + name;
				var msg = new Buffer(1 + 2 * name.length);
				msg.writeUInt8(0, 0);
				for (var i = 0; i < name.length; ++i) msg.writeUInt16LE(name.charCodeAt(i), 1 + 2 * i);
				this.send(msg);
				break;
			case 'http://oldagar.pro':
			case 'http://germs.io':
			case 'http://agar.bio':
			case 'http://play.agario0.com':
				var msg = new Buffer(1 + 2 * name.length);
				msg.writeUInt8(0, 0);
				for (var i = 0; i < name.length; ++i) msg.writeUInt16LE(name.charCodeAt(i), 1 + 2 * i);
				this.send(msg);
				break;
			default:
				var msg = new Buffer(1 + 2 * name.length);
				msg.writeUInt8(0, 0);
				for (var i = 0; i < name.length; ++i) msg.writeUInt16LE(name.charCodeAt(i), 1 + 2 * i);
				this.send(msg);
		}
	}
	close() {
		this.closed = true;
		this.ws.close();
	}
	onclose(e) {
		this.ws = null;
		if (!this.closed) this.connect();
	}
	onerror() {
		this.ws = null;
	}
	send(buf) {
		if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
		this.ws.send(buf);
	}
	eject() {
		if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
			return;
		}
		var buf = new Buffer([21]);
		this.ws.send(buf);
		var buf2 = new Buffer([36]);
		this.ws.send(buf2);
	}
	split() {
		if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
		var buf = new Buffer([17]);
		this.send(buf);
		var buf2 = new Buffer([56]);
		this.send(buf2);
	}
}

function startBots() {
	var intervalid = 0;
	var startInterval = setInterval(() => {
		if (intervalid >= proxyAgents.length) {
			clearInterval(startInterval);
			startInterval = null;
		} else {
			bots.push(new Bot(intervalid, serverIp));
			intervalid++;
		}
	}, 300);
	setInterval(() => {
		connectedCount1 = 0;
		for (var bot of bots) {
			if (!bot.ws) continue;
			if (bot.ws.readyState == WebSocket.OPEN) {
				connectedCount1++;
			}
			botCount = connectedCount1;
		}
		transferData({
			"type": "botsInfo",
			'data': botCount
		});
	}, 500);
}

process.on('message', message => {
	let msg = JSON.parse(message);
	switch (msg.type) {
		case 'init':
			serverIp = msg.server;
			origin = msg.origin;
			pkt254 = msg.pkt254;
			pkt255 = msg.pkt255;
			setTimeout(() => {
				startBots();
			}, 1000);
			break;
		case 'send':
		//console.log(msg.data);
			for (const bot of bots) bot.send(new Uint8Array(msg.data));
			break;
		case 'action':
			for (const bot of bots) bot[msg.data]();
			break;
		case '254':
			pkt254 = msg.data;
			break;
		case '255':
			pkt255 = msg.data;
			break;
	}
});

function transferData(data) {
	if (process.connected)
		process.send(JSON.stringify(data));
}
