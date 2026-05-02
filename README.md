# Campus Comm Notification App

Hey there! This is my responsive React application built with Vite and Material UI. The goal of this app is to display and manage campus notifications. It has a few main features: pulling generic notifications from an API, sorting a special "Priority Inbox" based on custom weights, filtering by notification types, and keeping track of what you've already read.

## How the Code is Organized

Instead of a giant block of code, I broke things down into a clean `notification_app_fe` folder so it's easy to navigate:

Inside the `src` folder, you'll find the core React stuff. I split the main views into a `pages` directory. The `AllNotifications.jsx` file handles the main inbox view, complete with pagination and category filtering. Right next to it is `PriorityInbox.jsx`, which is responsible for fetching a larger batch of notifications and then running my custom sorting logic to bubble the most urgent stuff to the top.

The `App.jsx` file ties it all together—it handles the global routing, the navigation bar, and wraps the whole app in a custom Material UI theme. I also created a `utils.js` file to store shared business logic, like the priority ranking math and the local storage functions that remember if you've read a notification or not.

You'll also notice a `config.js` file. This is super important because it dynamically pulls my API token from the environment variables, keeping hardcoded secrets out of the React components. 

Outside of the React `src` folder, I kept `priorityInbox.js` as an isolated Node script. This was built for the Stage 1 terminal-based execution requirement and runs completely independently of the frontend web app.

## Managing the API Token (`.env`)

To follow best security practices, I decided not to hardcode the API token anywhere in the codebase. Instead, I'm using a single `.env` file to manage it.

**How to set it up:**
Make sure you create a `.env` file right in the root of the `notification_app_fe` folder and paste your active token in like this:
`VITE_JWT_AUTH="your_token_here"`

**Why I did this:**
I wanted a "single source of truth". Vite automatically loads any variable starting with `VITE_` into the React app, so `config.js` can grab it securely. At the same time, the backend `priorityInbox.js` script uses the `dotenv` package to read from that exact same file. 

This means whenever the token expires (which happens a lot!), you only have to update it in one single spot, and both the frontend web app and the backend terminal script will instantly pick up the fresh token. No hunting through files needed!

## How to Run It

1. Make sure your `.env` file has a fresh token.
2. Run `npm install` to grab all the dependencies (like Material UI and react-router).
3. Fire up the server with `npm run dev`.
4. The Vite config is strictly locked to run on **http://localhost:3000**, so just head there in your browser!
