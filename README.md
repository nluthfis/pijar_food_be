## PijarFood Backend

## Backend API for the PijarFood recipe website built with Express.js.

This repository contains the backend API for the PijarFood recipe website and app.
Pijar food is a platform to view food recipes that provides users with a wide range of recipes for various dishes and cuisines.
It is built with Express.js and provides RESTful API endpoints.

## Table of Contents

- [Features](#features)
- [Technologies Used](#technologies-used)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [API Endpoints](#api-endpoints)
- [Postman Documentation](#postman-documentation)
- [Related Projects](#related-projects)
- [Authors](#authors)

## Features:

- Login/Register: Users can create accounts or log in to existing accounts.
- View Recipes: Users can browse and view various food recipes.
- View Recipes by Category: Recipes can be filtered by categories for easier navigation.
- Add Recipes: Registered users can add new recipes to the app.
- Like Recipes: Users can like their favorite recipes.
- Review Recipes: Users can rate and comment on recipes.
- Message between Users: Users can send messages to each other.
- View My Created Recipes: Registered users can see the recipes they have added.
- View My Liked Recipes: Users can see the recipes they have liked.
- Edit User's Photo and Info: Users can update their profile photo and information.

## Technologies Used:

- [Express](https://expressjs.com/)
- [Node.js](https://nodejs.org/en)
- [PostgreSQL](https://www.postgresql.org/)
- [JWT](https://jwt.io/)
- [Bcrypt](https://www.npmjs.com/package/bcrypt)
- [Cloudinary](https://cloudinary.com)

## Getting Started:

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites:

- Node.js
- Postgresql

### Installation:

1. Clone the repository:

   ```bash
   git clone https://github.com/nluthfis/pijar_food_be.git

   ```

2. Add the following environment variables to your .env file:

   ```bash
   *PostgreSQL database
   DB_HOST=
   DB_PORT=
   DB_DATABASE=
   DB_USERNAME=
   DB_PASSWORD=
   *JWT
   PRIVATE_KEY=
   *CLOUDINARY
   CLOUDINARY_NAME=
   CLODUNARY_KEY=
   CLOUDINARY_SECRET=
   ```

## Install dependencies:

- npm install
- Start the server
- npm start
- The API will be running on port 8000.

## The API endpoints are:

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

## Postman Documentation

Link Api :
https://odd-plum-cougar-cuff.cyclic.app

[![Run in Postman](https://run.pstmn.io/button.svg)](https://documenter.getpostman.com/view/26602283/2s9XxzuD5B)

## Related Project

- [Food Recipe Website](https://github.com/nluthfis/pijar_food_web)
- [Food Recipe Mobile](https://github.com/nluthfis/pijar_food_mobile)
- [Food Recipe Webiste Demo](https://pijar-food-web.vercel.app)

## Authors

Contributors names and contact info:

1. Naufal Luthfi Saputra

- [Linkedin](https://www.linkedin.com/in/naufal-luthfi-saputra/)

Feel free to check out the related projects and the provided Postman documentation for the API endpoints. If you have any questions or feedback, please don't hesitate to reach out to the author. Happy coding!
