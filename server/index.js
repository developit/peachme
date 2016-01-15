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

function follow({ id, name }, callback) {
	try {
		peach.login().then( () => {
			peach.getConnections().then( c => {
				let reqs = c && c.data && c.data.inboundFriendRequests || [],
					toFriend = reqs.filter( r => (r.stream.id===id || r.stream.name===name) )[0];
				if (!toFriend) return callback('Not found');
				peach.request(`/friend-request/${encodeURIComponent(toFriend.id)}/accept`, 'POST').then( () => callback(null, 'Accepted') );
			});
		});
	} catch(e) {}
}

app.post('/follow', (req, res) => {
	follow(req.body, (err, message) => {
		if (err) res.sendStatus(500);
		else res.json({ message });
	});
});

app.server.listen(process.env.PORT || 8080);

console.log(`Started on port ${app.server.address().port}`);
