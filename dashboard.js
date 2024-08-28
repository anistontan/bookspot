<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>BookSpot Dashboard</title>
    <link rel="stylesheet" href="/css/styles.css">
    <!-- Importing Google Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Bree+Serif&family=EB+Garamond:ital,wght@1,700&family=Kodemono&family=Lalezar&family=Neuton&display=swap" rel="stylesheet">
</head>
<body>
    <div class="container">
        <header class="main-header">
            <h1 class="title">BOOK<span class="spot">spot</span></h1>
            <p class="subtitle">by book & music lovers,<br> for book & music lovers</p>
        </header>
        <main>
            <p class="example-text">
                <% //example:<br> %>
                hmmm... <span class="highlight"><%= topArtists.join(', ') %></span>...<br>
                you listen to <span class="highlight"><%= topThreeGenres.join(', ') %></span>...<br>
                i think i got the perfect thing for you!
            </p>
            <div class="buttons">
                <a href="/your-book">
                    <button class="action-button">YOUR BOOK</button>
                </a>
            <% /*</div>
                <a href="/themed-playlist">
                    <button class="action-button">THEMED-PLAYLIST</button>
                </a>
            </div>
            */ %>
        </main>
    </div>
</body>
</html>
