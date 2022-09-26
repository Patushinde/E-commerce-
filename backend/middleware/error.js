const ErrorHandler = require("../utils/errorhander");



module.exports = (err,req,res,next)=>{

    err.statusCode = err.statusCode || 500;
    err.message = err.message ||"Internal server Error";


    // Wrong mongo db id error
    if(err.name === "CastError") {

        const message = `Resource not found.Invailde: ${err.path}`;

        err = new ErrorHandler(message,400);
    }

    // mongoose duplicatekey err
    if(err.code ===11000){
        const message = `Duplicate ${Object.keys(err.keyValue)} Entered`
        err = new ErrorHandler(message,400);
    }

    // wrong jwt error
    if(err.name === "jsonwebTokenError") {

        const message = `json web token is Invailde, try again `;

        err = new ErrorHandler(message,400);
    }

    // jwt expire error
    if(err.name === "TokenExpiredError") {

        const message = `json web token is Expired, try again `;

        err = new ErrorHandler(message,400);
    }
    res.status(err.statusCode).json({
        sucess:false,
        message:err.message,
    });
};