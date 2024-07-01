// it sees error and export 
module.exports= (fn)=>{
    return (req,res,next)=>{
        fn(req,res,next).catch(next);
    };
};