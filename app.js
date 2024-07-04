const express=require("express");
const app=express();
const mongoose=require("mongoose");
const Listing=require("./models/listing.js");
const path=require("path");
const port=8080;
const methodOverride=require("method-override");
const ejsMate=require("ejs-mate");//used to create template like setting same template for every page
//err handling imports
const wrapAsync=require("./utils/wrapAsync.js")
const ExpressError=require("./utils/ExpressError.js");
const {listingSchema,reviewSchema} =require("./schema.js");
const Review=require("./models/review.js");
const review = require("./models/review.js");


app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.engine("ejs",ejsMate);
app.use(express.static(path.join(__dirname,"/public")))

app.listen(port,()=>{
    console.log("server is listning to port:8080");
})


// ****database****
const MONGO_URL="mongodb://127.0.0.1:27017/wanderlust";

main().then(()=>{
    console.log("connected to db");
}).catch(err=>{
    console.log(err);
})

async function main(){
    await mongoose.connect(MONGO_URL);
}

app.get("/",(req,res)=>{
    res.send("hii this is root");
})

const validateListing =(req,res,next)=>{
    let {error}=listingSchema.validate(req.body);
    
    if(error){
        throw new ExpressError(400,error);
    }else{
        next();
    }

}

const validateReview =(req,res,next)=>{
    let {error}=reviewSchema.validate(req.body);
    
    if(error){
        throw new ExpressError(400,error);
    }else{
        next();
    }

}

//index rout
app.get("/listings",wrapAsync(async (req,res)=>{
   const allListings=await Listing.find({});
    res.render("./listings/index.ejs",{allListings});
}));

//new rout
app.get("/listings/new",(req,res)=>{
    res.render("listings/new.ejs");
})

//show rout

app.get("/listings/:id",wrapAsync(async (req,res)=>{
    let {id}= req.params;
    const listing=await Listing.findById(id).populate("reviews")

    res.render("listings/show.ejs",{listing});
}));

//create rout
app.post("/listings",validateListing,wrapAsync(async (req,res,next)=>{  //we are using middleware
    const newListing=new Listing(req.body.listing);
        await newListing.save();
        res.redirect("/listings")
    
   
}));

//edit rout
app.get("/listings/:id/edit", wrapAsync(async (req,res)=>{
    let {id}= req.params;
    const listing=await Listing.findById(id);
    res.render("listings/edit.ejs",{listing})
}));

//update rout
app.put("/listings/:id",validateListing,wrapAsync(async (req,res)=>{
    let {id}= req.params;
    await Listing.findByIdAndUpdate(id,{...req.body.listing})
    res.redirect(`/listings/${id}`);
}));

//delete rout
app.delete("/listings/:id", wrapAsync(async(req,res)=>{
    let {id}= req.params;
    let deletedListing=await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    res.redirect("/listings")
}));


// reviews 
//post review rout

app.post("/listings/:id/reviews",validateReview, wrapAsync(async(req,res)=>{ //we use async because its opearion will be affect db
    let listing= await Listing.findById(req.params.id)
    let newReview =new Review(req.body.review);

    listing.reviews.push(newReview);
    await newReview.save()
    await listing.save();
    res.redirect(`/listings/${listing._id}`)
}));

//delete review rout
app.delete("/listings/:id/reviews/:reviewId",wrapAsync(async(req,res)=>{
    let {id,reviewId}= req.params;
    await Listing.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});
    await Review.findByIdAndDelete(reviewId);

    res.redirect(`/listings/${id}`);
}))



// if req dont match to any path then 
app.all("*",(req,res,next)=>{
    next(new ExpressError(404,"Page Not Found!"))
})



//error handling 
app.use((err,req,res,next)=>{
    let{statusCode=500,message="Something went wrong"}=err;    //{}  ->this means we are deconstructing err /500 means err at server and 400 means at client
    //res.status(statusCode).send(message); status code means what is status and msg means what msg to show
    res.status(statusCode).render("error.ejs",{message});
})