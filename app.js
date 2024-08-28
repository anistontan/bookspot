const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const dotenv = require('dotenv');
const SpotifyWebApi = require('spotify-web-api-node');
const session = require('express-session'); // Import express-session

// Load environment variables from .env file
dotenv.config();

// Initialize Express app
const app = express();
const port = process.env.PORT || 3000;

// Middleware to parse incoming request bodies
app.use(bodyParser.urlencoded({ extended: true }));

// Set up session middleware
app.use(session({
    secret: 'your_secret_key', // Replace with your own secret key
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set secure to true if using HTTPS
}));

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

// Set the view engine to EJS
app.set('view engine', 'ejs');

// Set up Spotify API client
const spotifyApi = new SpotifyWebApi({
    clientId: process.env.SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
    redirectUri: 'http://localhost:3000/callback'
});

// Function to refresh access token
async function refreshAccessToken(req, res, next) {
    if (!spotifyApi.getRefreshToken()) {
        console.log('No refresh token available');
        return next();
    }

    try {
        const data = await spotifyApi.refreshAccessToken();
        const accessToken = data.body['access_token'];

        // Store the new access token in the Spotify API client and session
        spotifyApi.setAccessToken(accessToken);
        req.session.accessToken = accessToken;

        console.log('Access token refreshed');
    } catch (error) {
        console.error('Could not refresh access token', error);
    }

    // Move to next middleware or route
    next();
}

// Middleware to check and refresh the token automatically
// Middleware to check and refresh the token automatically
app.use(async (req, res, next) => {
    if (req.session.accessToken && req.session.refreshToken) {
        spotifyApi.setAccessToken(req.session.accessToken);
        spotifyApi.setRefreshToken(req.session.refreshToken);
        
        try {
            await refreshAccessToken(req, res, next);
        } catch (error) {
            console.error('Error refreshing access token:', error);
            res.redirect('/'); // Redirect to the home page if refreshing fails
        }
    } else {
        next();
    }
});

// Routes
app.use('/', require('./routes/index')(spotifyApi));

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
