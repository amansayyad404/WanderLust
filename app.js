const express=require("express");
const app=express();
const mongoose=require("mongoose");

const path=require("path");
const port=8080;
const methodOverride=require("method-override");
const ejsMate=require("ejs-mate");//used to create template like setting same template for every page
//err handling imports

const ExpressError=require("./utils/ExpressError.js");

const listings =require("./routes/listing.js");
const reviews  =require("./routes/review.js");

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

app.use("/listings",listings);
app.use("/listings/:id/reviews",reviews);



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