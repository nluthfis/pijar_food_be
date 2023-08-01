## PijarFood Backend

## Backend API for the PijarFood recipe website built with Express.js.

This repository contains the backend API for the PijarFood recipe website. It is built with Express.js and provides RESTful API endpoints.

## Features :

API endpoints for:

- Recipes
- Users
- Authentication using JWT
- Database using Postgresql

## The PijarFood Backend is built using the following technologies:

- [Express](https://expressjs.com/)
- [Node.js](https://nodejs.org/en)
- [PostgreSQL](https://www.postgresql.org/)
- [JWT](https://jwt.io/)
- [Bcrypt](https://www.npmjs.com/package/bcrypt)
- [Cloudinary](https://cloudinary.com)

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.
Prerequisites

- Node.js
- Postgresql

## Installing:

- Clone the repository
- git clone https://github.com/nluthfis/PijarFood.git
- add .env

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

[![Run in Postman](https://run.pstmn.io/button.svg)](https://elements.getpostman.com/redirect?entityId=26602283-237ddb2d-dece-47b6-94ed-41fb97f58037&entityType=collection)

## Related Project

- [Food Recipe Website](https://github.com/nluthfis/fe-react_pijarfood)
- [Food Recipe Mobile](https://github.com/nluthfis/pijar_food_mobile)
- [Food Recipe Webiste Demo](https://fe-react-pijarfood.vercel.app)

## Authors

Contributors names and contact info:

1. Naufal Luthfi Saputra

- [Linkedin](https://www.linkedin.com/in/naufal-luthfi-saputra/)
