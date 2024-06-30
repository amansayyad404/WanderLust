const express=require("express");
const app=express();
const mongoose=require("mongoose");
const Listing=require("./models/listing.js");
const path=require("path");
const port=8080;
const methodOverride=require("method-override");
const ejsMate=require("ejs-mate");//used to create template like setting same template for every page

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


app.get("/listings",async (req,res)=>{
   const allListings=await Listing.find({});
    res.render("./listings/index.ejs",{allListings});
});

//new rout
app.get("/listings/new",(req,res)=>{
    res.render("listings/new.ejs");
})

//show rout

app.get("/listings/:id",async (req,res)=>{
    let {id}= req.params;
    const listing=await Listing.findById(id);

    res.render("listings/show.ejs",{listing});
})

//create rout
app.post("/listings",async (req,res)=>{
    const newListing=new Listing(req.body.listing);
    await newListing.save();
    res.redirect("/listings")
})

//edit rout
app.get("/listings/:id/edit", async (req,res)=>{
    let {id}= req.params;
    const listing=await Listing.findById(id);
    res.render("listings/edit.ejs",{listing})
})

//update rout

app.put("/listings/:id",async (req,res)=>{
    let {id}= req.params;
    await Listing.findByIdAndUpdate(id,{...req.body.listing})
    res.redirect(`/listings/${id}`);
})

//delete rout
app.delete("/listings/:id", async(req,res)=>{
    let {id}= req.params;
    let deletedListing=await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    res.redirect("/listings")
})