import http from 'http';
import express from 'express';
import cors from 'cors';
import compression from 'compression';
import bodyParser from 'body-parser';
import Peach from 'peach-client';
import request from 'request-promise';

let app = express();
app.server = http.createServer(app);

app.use(compression());

app.use(cors());

app.use(bodyParser.json({ limit :'100kb' }));

let peach = new Peach({
	email: process.env.PEACH_EMAIL,
	password: process.env.PEACH_PASSWORD
});

peach.request = (...args) => request(peach.getOptions(...args));

function login(callback) {
	let now = Date.now();
	if ( (now - peach.lastLogin) < 60 * 1000 ) return callback();
	peach.lastLogin = now;
	if (peach.currentLogin && peach.currentLogin.then) return peach.currentLogin.then(callback);
	peach.currentLogin = peach.login();
	peach.currentLogin.then( () => {
		peach.currentLogin = null;
		callback();
	});
}

function addFriend(friend, callback) {
	peach.request(`/friend-request/${encodeURIComponent(friend.id)}/accept`, 'POST').then( () => callback(null, 'Accepted') );
}

peach.cachedReqs = [];

function follow({ id, name }, callback) {
	let cached = peach.cachedReqs && peach.cachedReqs.filter( r => (r.stream.id===id || r.stream.name===name) )[0];
	if (cached) return addFriend(cached, callback);

	try {
		login( () => {
			peach.getConnections().then( c => {
				let reqs = c && c.data && c.data.inboundFriendRequests || [],
					toFriend = reqs.filter( r => (r.stream.id===id || r.stream.name===name) )[0];
				peach.cachedReqs = reqs;
				if (!toFriend) return callback('Not found');
				addFriend(toFriend, callback);
			});
		});
	} catch(e) {
		callback('Unknown error');
		throw e;
	}
}

app.post('/follow', (req, res) => {
	follow(req.body, (err, message) => {
		if (err) res.status(500).send(err);
		else res.json({ message });
	});
});

app.server.listen(process.env.PORT || 8080);

console.log(`Started on port ${app.server.address().port}`);
