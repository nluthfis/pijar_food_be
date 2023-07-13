PijarFood Backend

Backend API for the PijarFood recipe website built with Express.js.
This repository contains the backend API for the PijarFood recipe website. It is built with Express.js and provides RESTful API endpoints.
Features : 
API endpoints for:
- Recipes
- Users
- Authentication using JWT
- Database using Postgresql

Getting Started
These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.
Prerequisites
- Node.js
- Postgresql

Installing:
- Clone the repository
- git clone https://github.com/nluthfis/PijarFood

Install dependencies:
- npm install
- Start the server
- npm start
- The API will be running on port 8000.


The API endpoints are:
- post /auth/login
- get /profile' getProfile
- get /profile getProfileById
- post /profile insertUsers
- patch /profile editUsers
- patch /profile/photo editPhoto
- router.delete /profile deleteUsers
- get /recipes getRecipes
- get /recipes/:id getRecipesById
- get /recipes/profile/me getRecipesByUserId
- post /recipes" insertRecipeData
- patch /recipes/:id editRecipesData
- delete /recipes/:id deleteRecipesData
- patch /recipes/photo/:id editPhoto
- patch /likes addLiked
- patch /unlikes removeLike
- post /comment addComment
- get /comment getComment
