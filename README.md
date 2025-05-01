# Profile Page with GraphQL #

## Objective
The objective of this project is to learn GraphQL by creating a personalized profile page that fetches data from the Gritlab's GraphQL API and displays it. This profile includes user data and generates statistic graphs using SVG.

## Live version
You can check out the hosted version here: https://ruboma.github.io/graphql-git/

## Features
- **Login Page**: Allows users to authenticate using a JWT (JSON Web Token) via Basic Authentication (username/password or email/password).
- **Profile Page**: Displays user data fetched from a GraphQL API, including optional sections such as:
  - Basic user information (username, email, etc.)
  - XP amount
  - Audit ratio
  - Skills

## Technologies
- **GraphQL**: Queries user data and other related information from the API.
- **JWT Authentication**: Used to authenticate the user and securely access data.
- **SVG**: Creates interactive graphs to represent user statistics visually.
- **HTML/CSS**: For building the profile page and login form.
- **JavaScript**: For handling form submissions, GraphQL requests, and rendering the profile page.

## Setup

1. **Login Page**:
   - Allows users to log in using either `username:password` or `email:password`.
   - On successful login, the user is authenticated, and a JWT is returned.
   - Invalid credentials trigger an error message.

2. **Fetching Data**:
   - Once authenticated, the JWT is used in the `Authorization` header to make authenticated GraphQL queries.

3. **Profile UI**:
   - Displays data retrieved via GraphQL.
   - Includes user stats and two types of graphs, such as:
     - XP progression over time
     - Skills

4. **Logout**:
   - Logs the user out and clears the JWT from local storage.

