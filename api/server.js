const express = require("express");
const helmet = require("helmet");
// const cors = require("cors");
const bcrypt = require("bcryptjs");
const session = require("express-session");
const KnexSessionStore = require("connect-session-knex")(session);

const usersRouter = require("../users/users-router.js");
const authRouter = require("../auth/auth-router.js")
const dbConnection = require("../database/connection");
const authenticate = require("../auth/auth-middleware.js");

const server = express();


const sessionConfiguration = {
    name: "cookie monster",
    secret: process.env.SESSION_SECRET || "Shhh, secrets safe with me",
    cookies: {
        maxAge: 1000 * 60 * 10,
        secure: process.env.USE_SECURE_COOKIES || false,
        httpOnly: true,
    },
    resave: false,
    saveUnitialized: true,
    store: new KnexSessionStore({
        knex: dbConnection,
        tablename: "sessions",
        sidfieldname: "sid",
        createtable: true,
        clearInterval: 1000 * 60 * 20,
    })
}

server.use(session(sessionConfiguration)); //enables session support
server.use(helmet());
server.use(express.json());
// server.use(cors());

server.use("/api/users", authenticate, usersRouter);
server.use("/api/auth", authRouter)

server.get("/", (req, res) => {
    res.json({ api: "up" });
});

server.get("/hash", (req, res) => {
    const password = req.headers.authorization;
    const secret = req.headers.secret;

    const hash = hashString(secret)

    if (password === "Stamp") {
        res.json({ welcome: "friend", secret, hash })
    } else {
        res.status(401).json({ you: "shall not pass!" })
    }
})

function hashString(str) {
    const rounds = process.env.HASH_ROUNDS || 6;
    const hash = bcryptjs.hashsync(str, rounds);

    return hash;
}

module.exports = server;