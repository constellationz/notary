// Port for the web app
const port = 8080;

const bodyParser = require("body-parser");
const cors = require("cors");
const crypto = require('crypto');
const express = require('express');
const favicon = require('serve-favicon');
const fs = require('fs');
const path = require('path');

// make sure we can decode posts
const jsonParser = bodyParser.json();
const urlParser = bodyParser.urlencoded({ extended: false });

// start express
const app = express();

// use cors
app.use(cors());

// Notes are stored in a global hash map
let numposts = 0;
let allposts = {};

// Get an unused hash
function getNewHash() {
	var id = '0';
	while (allposts[id] != null)
		id = id = crypto.randomBytes(20).toString('hex');
	return id;
}

// Respond to get request
function getPosts(req, res) {
	let postlist = [];
	for (const posthash in allposts) 
		postlist.push(allposts[posthash])
	console.log("returning list", postlist);
	res.json(postlist);
}
app.get('/getposts/', jsonParser, getPosts);
app.get('/getposts/', urlParser, getPosts);

// Use favicon
app.use(favicon(path.join(__dirname, '../frontend/favicon.ico')));

// Show the client hello world on the website
app.get('/', (req, res) => {
	res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Print when listening
app.listen(port, () => {
	console.log(`Example app listening on port ${port}`);
});

// Respond to move posts 
function move(req, res) {
	console.log("Moved note", req.body);

	// get request body
	const hash = req.body.hash;
	const x = req.body.x;
	const y = req.body.y;

	// Let users move the note if the hash exists
	if (allposts[hash]) {
		const note = allposts[hash];
		note.x = x;
		note.y = y;
	}

}
app.post('/move', jsonParser, move);
app.post('/move', urlParser, move);

// Respond to message posts
function post(req, res) {
	console.log("got request for", req.body);

	// make our note
	const hash = getNewHash();
	const note = {
		message: req.body.message,
		x: req.body.x,
		y: req.body.y,
		colorindex: Math.floor(Math.random() * 100),
		zindex: numposts,
		hash: hash,
	}

	// insert & save
	numposts++;
	allposts[hash] = note;
	res.json(note);
}
app.post('/post', jsonParser, post);
app.post('/post', urlParser, post);

