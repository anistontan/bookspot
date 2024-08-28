const OpenAI = require("openai");
const express = require('express');
require('dotenv').config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

async function getBookRecommendations(topArtists, topGenres) {
    const prompt = `
    My top artists are ${topArtists.join(', ')} and my top genres are ${topGenres.join(', ')}.
    Recommend five books for me, and for each book, provide:
    1. The title of the book.
    2. The author of the book.
    3. A brief description (under 50 words, no spoilers).
    Format your response as a JSON array with objects containing "title", "author", and "description" fields.
    Please be classics or popular/decent booktok books. 
    `;

    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [
                { role: "user", content: prompt }
            ]
        });

        // Parse the response as JSON
        const recommendations = JSON.parse(completion.choices[0].message.content.trim());

        // Ensure the response contains the correct structure
        if (!Array.isArray(recommendations) || !recommendations.length) {
            throw new Error('Invalid response format');
        }

        // Check that each recommendation has the necessary fields
        recommendations.forEach(rec => {
            if (!rec.title || !rec.author || !rec.description) {
                throw new Error('Missing fields in recommendations');
            }
        });

        return recommendations;
    } catch (error) {
        console.error("Error fetching recommendations from OpenAI:", error);
        return []; // Return an empty array if there was an error
    }
}





module.exports = function(spotifyApi) {
    const router = express.Router();

    // Route to log in with Spotify
    router.get('/login', (req, res) => {
        const scopes = ['user-read-private', 'user-read-email', 'user-top-read'];
        const authorizeURL = spotifyApi.createAuthorizeURL(scopes);
        res.redirect(authorizeURL);
    });

    // Route to handle GET requests to the root URL
    router.get('/', (req, res) => {
        res.render('index', { title: 'bookspot' });
    });

    
    // Callback route after Spotify login
    router.get('/callback', async (req, res) => {
        const code = req.query.code;
        
        try {
            const data = await spotifyApi.authorizationCodeGrant(code);
        
            // Log the authorization response to check what's being returned
            console.log('Authorization response:', data.body);
    
            // Set the access token and refresh token
            const accessToken = data.body['access_token'];
            const refreshToken = data.body['refresh_token'];
    
            console.log('Access Token:', accessToken);
            console.log('Refresh Token:', refreshToken);
        
            spotifyApi.setAccessToken(accessToken);
            spotifyApi.setRefreshToken(refreshToken);
        
            // Store tokens in the session
            req.session.accessToken = accessToken;
            req.session.refreshToken = refreshToken;
        
            // Redirect to a page that fetches and displays user data
            res.redirect('/dashboard');
        } catch (err) {
            console.error('Error retrieving access token:', err);
            res.redirect('/');
        }
    });
    

    // Route to display user data
    router.get('/dashboard', async (req, res) => {
        if (!req.session.accessToken) {
            // If no access token is available, redirect to the login page
            return res.redirect('/login');
        }
    
        spotifyApi.setAccessToken(req.session.accessToken);
    
        try {
            // Fetch the user's top artists (limit to 5)
            const data = await spotifyApi.getMyTopArtists({ limit: 5 });
            const topArtists = data.body.items.map(artist => artist.name); // Extract artist names
            const topGenres = data.body.items.flatMap(artist => artist.genres); // Extract and flatten genres
        
            // Count and sort the top 3 genres
            const genreCounts = {};
            topGenres.forEach(genre => {
                genreCounts[genre] = (genreCounts[genre] || 0) + 1;
            });
            const sortedGenres = Object.keys(genreCounts).sort((a, b) => genreCounts[b] - genreCounts[a]);
            const topThreeGenres = sortedGenres.slice(0, 3);
        
            // Store these values in the session
            req.session.topArtists = topArtists;
            req.session.topThreeGenres = topThreeGenres;
        
            // Pass these values to your view
            res.render('dashboard', { topArtists, topThreeGenres });
        } catch (err) {
            console.error('Error fetching top artists or genres:', err.response ? err.response.body : err);
            res.redirect('/');
        }
    });
    
  // Route to render the "Your Book" page
router.get('/your-book', (req, res) => {
    res.render('your-book');
});

// Separate API route to fetch recommendations as JSON
router.get('/api/recommendations', async (req, res) => {
    const topArtists = req.session.topArtists;
    const topThreeGenres = req.session.topThreeGenres;

    if (!topArtists || !topThreeGenres) {
        return res.status(400).json({ message: 'Missing topArtists or topGenres query parameters.' });
    }

    try {
        const recommendations = await getBookRecommendations(topArtists, topThreeGenres);
        res.json({ recommendations });
    } catch (error) {
        console.error('Error generating book recommendations:', error);
        res.status(500).json({ message: 'Failed to generate recommendations. Please try again.' });
    }
});


    module.exports = router;
    
    return router;
};

