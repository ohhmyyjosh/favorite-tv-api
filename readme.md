# Favorite TV Shows App

*by Joshua Patterson*

## Description
This project utilizes the TV Maze API to allow users to search for TV shows and add them as favorites. This data will persist in a database and be available to each user each time the application is run.

## How to install the app

1. Clone the repository: https://github.com/ohhmyyjosh/favorite-tv-api.git

2. Install Node.js onto your system: https://nodejs.org/en

3. Options:
    1. Download MongoDB Community Server: https://www.mongodb.com/try/download/community to host the database locally on your system.
    2. Create an online MongoDB Atlas account. Create a new cluster, create a new database.

4. Update the connection string in "credentials.js" to connect to your database, whether local or remote.

5. With a terminal open in the project directory, execute this command:
`npm install`

## How to run the app

1. With a terminal open in the project directory, execute this command:
`node app.js`

## How to use the app

Main Pages:
- /: This page is only accessible to logged in users. The page displays a search bar for searching TV show names, as well as a list of shows the user has favorited.
- /login: This page allows users to login if they are not already logged in.
- /register: This page allows users to register an account if they are not already logged in or registered.
