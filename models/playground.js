const mongoose  = require("mongoose");
const Review = require("./review");
const Schema = mongoose.Schema;

const opts = { toJSON: {virtuals: true } };

const PlaygroundSchema = new Schema({
    title: String,
    images: [
        {
        url: String,
        filename: String
        }
    ],
    geometry: {
        type: {
            type: String,
            enum: ["Point"],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    price: Number,
    description: String,
    location: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: "Review"
        }
    ]
}, opts);

PlaygroundSchema.virtual("properties.popUpMarkup").get(function () {
    return `<strong><a href="/playgrounds/${this._id}">${this.title}</a></strong>
    <p>${this.description.substring(0,20)}...</p>`
})

PlaygroundSchema.post("findOneAndDelete", async function (doc) {
    if (doc){
        await Review.deleteMany({
            _id: {
                $in: doc.reviews
            }
        })
    }
})

module.exports = mongoose.model("Playground", PlaygroundSchema)