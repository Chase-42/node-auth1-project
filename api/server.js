const express = require("express");
const session = require("express-session");
const KnexSessionStore = require("connect-session-knex")(session);
const apiRouter = require("./apiRouter.js");
const configureMiddleware = require("./configureMiddleware");
const server = express();
const dbConfig = require("../database/config");

configureMiddleware(server);

server.use(
  session({
    name: "token", // overwrites the default cookie name, hides our stack better
    resave: false, // avoid recreating sessions tha thave not changed
    saveUninitialized: false, // GDPR laws against setting cookies automatically
    secret: process.env.COOKIE_SECRET || "secret",
    cookie: {
      maxAge: 15 * 1000 // expire the cookie after 15 seconds
    },
    store: new KnexSessionStore({
      knex: dbConfig, // configured instance of knex
      createtable: true // if the session table doesn't exist, create it automatically
    })
  })
);
server.use("/api", apiRouter);

server.get("/", (req, res, next) => {
  res.json({
    message: "Welcome to our API"
  });
});

server.use((err, req, res, next) => {
  console.log(err);
  res.status(500).json({
    message: "Something went wrong"
  });
});

module.exports = server;
