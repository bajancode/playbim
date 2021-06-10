const {playgroundSchema, reviewSchema } = require("./schemas.js");
const ExpressError = require("./utils/ExpressError"); 
const Playground = require("./models/playground");
const Review = require("./models/review")

module.exports.isLoggedIn = (req, res, next) => {
    if(!req.isAuthenticated()){
        req.session.returnTo = req.originalUrl;
        req.flash("error", "you must be signed in");
        return res.redirect("/login");
    }
    next()
} 

module.exports.validatePlayground = (req, res, next) => {
    const {error} = playgroundSchema.validate(req.body);
    if(error){
        const msg = error.detailsmap(el => el.message).join(",")
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}

module.exports.isAuthor = async(req, res, next) => {
    const {id} = req.params;
    const playground =  await Playground.findById(id);
    if(!playground.author.equals(req.user._id)){
        req.flash("error", "You don't have permission to do that, sorry!")
        return res.redirect(`/playgrounds/${id}`)
    } 
    next();
}

module.exports.isReviewAuthor = async(req, res, next) => {
    const {id, reviewId} = req.params;
    const review =  await Review.findById(reviewId);
    if(!review.author.equals(req.user._id)){
        req.flash("error", "You don't have permission to do that, sorry!")
        return res.redirect(`/playgrounds/${id}`)
    } 
    next();
}

module.exports.validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}