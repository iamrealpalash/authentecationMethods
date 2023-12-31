import 'dotenv/config';
import express from "express";
import bodyParser from "body-parser";
import ejs from "ejs";
import mongoose, { Schema } from "mongoose";
import session from "express-session";
import passport from "passport";
import passportLocalMongoose from "passport-local-mongoose";

const app = express();

app.set('view engine', 'ejs');
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    secret: process.env.KEY,
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://127.0.0.1:27017/userDB", { useNewUrlParser: true });
const userSchema = new mongoose.Schema({
    email: String,
    password: String
});

userSchema.plugin(passportLocalMongoose);

const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/", (req, res) => {
    res.render("home")
});
app.get("/login", (req, res) => {
    res.render("login")
});
app.get("/register", (req, res) => {
    res.render("register")
});
app.get("/logout", (req, res) => {
    req.logOut();
    res.redirect("/");
});
app.get("/secrets", (req, res) => {
    if (req.isAuthenticated()) {
        res.render("secrets");
    } else {
        res.redirect("/");
    };
});

app.post("/register", async (req, res) => {
    User.register({ username: req.body.username }, req.body.password, (err, user) => {
        if (err) {
            console.log(err);
            res.redirect("/register");
        } else {
            passport.authenticate("local")(req, res, () => {
                res.redirect("/secrets");
            });
        };
    });
});
app.post("/login", async (req, res) => {
    const user = new User({
        username: req.body.username,
        password: req.body.password
    });
    req.login(user, (error) => {
        if (error) {
            console.log(error);
        } else {
            passport.authenticate("local")(req, res, () => {
                res.redirect("/secrets");
            });
        };
    });
});

app.listen(3000, () => {
    console.log("Server in online on port 3000.");
});