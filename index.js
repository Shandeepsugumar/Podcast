const express = require('express');
const request = require('request');
const querystring = require('querystring');
const cors = require('cors');

const client_id = '6c9927a8d48e46939be2500427c89b0a';
const client_secret = '67f67b2a43494665be2055a98e76f7b4';
const redirect_uri = 'http://127.0.0.1:8888/callback';

function generateRandomString(length) {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

const app = express();
app.use(cors());

let spotifyAccessToken = "BQAjFZYiCXnDjuaPE_DGFSXUpHrzMvpnXVAqcO-Rb9XgLpZpv29ljaBkTH0h0IzJlsZDlklnc3gnN9JiFbM3bdYV_dKJz07jlbh7iqYoDJ8IR1SBYhl7oYZ1es07bd8REiHK-c50wNP9ZYy1D_U0nIXYVgewmPHArF--jLO1jC3y2FTzYANdjQlo-53qsZaWtq7AwL8lC9tPdIoSzfx6nSUKKuO1IoS18CrGxSWtqT5iUAQ4dKd5aKF_p1iGFw";

app.get('/login', function(req, res) {
  const state = generateRandomString(16);
  const scope = 'user-read-private user-read-email';

  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: client_id,
      scope: scope,
      redirect_uri: redirect_uri,
      state: state
    }));
});

app.get('/callback', function(req, res) {
  const code = req.query.code || null;
  const authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    form: {
      code: code,
      redirect_uri: redirect_uri,
      grant_type: 'authorization_code'
    },
    headers: {
      'Authorization': 'Basic ' + Buffer.from(client_id + ':' + client_secret).toString('base64')
    },
    json: true
  };

  request.post(authOptions, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      const access_token = body.access_token;
      spotifyAccessToken = access_token; // Save for later API calls
      res.send({ access_token });
    } else {
      res.send({ error: 'Failed to get access token', details: body });
    }
  });
});

// Add this endpoint to search for podcasts (shows) by query
app.get('/api/search', function(req, res) {
  const query = req.query.query;
  if (!spotifyAccessToken) {
    return res.status(401).json({ error: 'Spotify access token not available. Please authenticate first.' });
  }
  if (!query) {
    return res.status(400).json({ error: 'Missing query parameter.' });
  }
  const searchUrl = `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=show&limit=10`;
  request.get({
    url: searchUrl,
    headers: { 'Authorization': 'Bearer ' + spotifyAccessToken },
    json: true
  }, (error, response, body) => {
    if (!error && response.statusCode === 200) {
      res.json(body.shows.items);
    } else {
      res.status(response ? response.statusCode : 500).json({ error: 'Failed to fetch podcasts', details: body });
    }
  });
});

// Endpoint to fetch show details and episodes from Spotify
app.get('/api/show', function(req, res) {
  const showId = req.query.id;
  if (!spotifyAccessToken) {
    return res.status(401).json({ error: 'Spotify access token not available. Please authenticate first.' });
  }
  if (!showId) {
    return res.status(400).json({ error: 'Missing show id.' });
  }
  const showUrl = `https://api.spotify.com/v1/shows/${showId}?market=US`;
  request.get({
    url: showUrl,
    headers: { 'Authorization': 'Bearer ' + spotifyAccessToken },
    json: true
  }, (error, response, body) => {
    if (!error && response.statusCode === 200) {
      res.json(body);
    } else {
      res.status(response ? response.statusCode : 500).json({ error: 'Failed to fetch show', details: body });
    }
  });
});

app.listen(8888, () => {
  console.log('Server running on http://127.0.0.1:8888');
}); 