module.exports = (req, res, next) => {
    if (req.sesssion && req.session.loggedIn) {
        next();
    } else {
        res.status(401).json({ you: "cannot pass!" })
    }
}