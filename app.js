if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const flash = require("connect-flash");
const ExpressError = require("./utils/ExpressError");
const methodOverride = require("method-override");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user")
const helmet = require("helmet")

const mongoSanitize = require("express-mongo-sanitize");

const userRoutes = require("./routes/users");
const playgroundRoutes = require("./routes/playgrounds");
const reviewRoutes = require("./routes/reviews");

const MongoStore = require("connect-mongo");

//Below Playground was added just to try out if connecting to mongo database etc. 10 june
// const Playground = require("./models/playground");

const dbUrl = process.env.DB_URL || "mongodb://localhost:27017/yelp-camp";
//I tried to change this to yelp camp, made a new entry, and it still didn't show up.

mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
})

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const app = express();

app.engine("ejs", ejsMate)
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"))

app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public" )));
app.use(mongoSanitize({
    replaceWith: '_'
}));

const secret = process.env.SECRET || "thisshouldbeabettersecret";

const store  = MongoStore.create({
    mongoUrl: dbUrl,
    touchAfter: 24 * 60 * 60,
    crypto: {
        secret
        // : "thisshouldbeabettersecret"
    }
})

store.on("error", function(e) {
    console.log("Session store error", e)
})

const sessionConfig = {
    store,
    name: "session",
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        // secure: true, //uncomment this for deployment
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig));
app.use(flash());
app.use(helmet());


const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
    "https://cdn.jsdelivr.net",
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const fontSrcUrls = [];

app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/bugsy/", 
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()))

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    next();
})

app.use("/", userRoutes);
app.use("/playgrounds", playgroundRoutes)
app.use("/playgrounds/:id/reviews", reviewRoutes)

// app.use("/about", (req, res) => {
//     res.render("about")
// })

app.get("/", (req, res) => {
    res.render("home")
})

//the below makeplayground using as an example to try to get db to work 10 june
// app.get("/makeplayground", async (req, res) => {
//     const play = new Playground({ 
//         title: "boba beach", 
//         geometry: { type: 'Point', coordinates: [ -40.5824, -19.5248 ] },
//         location: 'Wildey, Barbados',
//         price: 2,
//         description: 'boba test',
//         images: [
//           {
//             url: 'https://res.cloudinary.com/bugsy/image/upload/v1623348796/PlayBim/epvqbf6fliyad6axdv2l.jpg',
//             filename: 'PlayBim/epvqbf6fliyad6axdv2l'
//           }
//         ],
             
    
//     });
//     await play.save();
//     res.send(play)
// })

app.all("*", (req, res, next) => {
    next(new ExpressError("Page NOT fOUND", 404))
})

app.use((err, req, res, next) => {
    const {statusCode = 500} = err;
    if(!err.message) err.message = "Oh noes, Something Went Wrong!"
    res.status(statusCode).render("error", {err})
})

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`Serving pun port ${port}`)
})
