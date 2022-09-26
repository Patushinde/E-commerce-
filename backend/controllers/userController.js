const ErrorHander = require("../utils/errorhander");
const User = require("../models/userModel");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const sendToken = require("../utils/jwtToken");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");
const cloudinary = require("cloudinary")




// Rejester a User
exports.registerUser = catchAsyncErrors(async(req,res,next)=>{
   const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar, {
      folder: "avatars",
      width: 150,
      crop: "scale",
    });

    const{name,email,password} = req.body;
     const user = await User.create({
        name,
        email,
        password,
        avatar:{
         public_id:myCloud.public_id,
         url:myCloud.secure_url,

        },
     });

sendToken(user,201,res);

});

// login user
exports.loginUser = catchAsyncErrors(async(req,res,next)=>{



const {email,password} = req.body;
// checking if user has given password and emain both
if(!email || !password){
   return next(new ErrorHander("please Enter Email & Password",400));

      }
const user = await User.findOne({email}).select("+password");
if(!user){
   return next(new ErrorHander("Invalide email or password",401));

}

const isPasswordMatched =  await user.comparePassword(password);

if(!isPasswordMatched){
   return next(new ErrorHander("Invalide email or password",401));


}
 sendToken(user,200,res);
});


// Logout User
exports.logout = catchAsyncErrors(async(req,res,next)=>{


   res.cookie("token",null,{
      expires: new Date(Date.now()),
      httpOnly:true,
   });

res.status(200).json({
   success:true,
   message:"Logged out",
});

});

// Forgot Password
exports.forgotPassword = catchAsyncErrors(async(req,res,next)=>{

   const user = await User.findOne({email:req.body.email});
   if(!user){
      return next(new ErrorHander("User not found",404))
   }

   // Get reset password Token
   const resetToken = user.getResetPasswordToken();
   await user.save({validateBeforeSave: false});

   const resetPasswordUrl = `${req.protocol}://${req.get(
      "host"
    )}/password/reset/${resetToken}`;
   

   const message = `Your password reset token is :-\n\n ${resetPasswordUrl}\n\nIf you have not requested this email then, please ignore it.`;


   try{

      await sendEmail({
         email:user.email,
         subject:`Ecommerce Password recovery`,
         message,

      });

      res.status(200).json({
         success:true ,
         message:`Email sent to ${user.email}  successfully`,

      });

   }catch (error){
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save ({  validateBeforeSave: false});
      return next(new ErrorHander(error.message,500));

   }

});
// reset Password
exports.resetPassword = catchAsyncErrors(async(req,res,next)=>{
   // creating token hash
   const resetPasswordToken =crypto
   .createHash("sha256").update(req.params.token).digest("hex");

   const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire:
      {$gt :Date.now()},

   });
   if(!user){
      return next(new ErrorHander("Reset password token is invalid or has been expired",400));

   }
   if(req.body.password !== req.body.confirmPassword){
      return next(new ErrorHander("password does not password",400));
      
   }
   user.password = req.body.password;
   user.resetPasswordToken = undefined;
   user.resetPasswordExpire = undefined;
   
   await user.save();

   sendToken(user,200,res);

});

// get user detail
exports.getUserDetails = catchAsyncErrors(async(req,res,next)=>{
   const user= await User.findById(req.user.id);
   res.status(200).json({
      success:true,
      user,
   });
});


// update user password user detail
exports.updatePassword = catchAsyncErrors(async(req,res,next)=>{
   const user= await User.findById(req.user.id).select("+password");
   const isPasswordMatched = await user.comparePassword(req.body.oldPassword);

   if(!isPasswordMatched){
      return next(new ErrorHander("old password is incorrect",400));
   }

   if(req.body.newPassword !== req.body.confirmPassword){
     return next(new ErrorHander("password Does not match",400));
}
user.password = req.body.newPassword;
await user.save();

   sendToken(user,200,res);
});


// update user profile
exports.updateProfile = catchAsyncErrors(async(req,res,next)=>{
  const newUserData={
   name:req.body.name,
   email:req.body.email,
  };
  
  if (req.body.avatar !== "") {
   const user = await User.findById(req.user.id);

   const imageId = user.avatar.public_id;

   await cloudinary.v2.uploader.destroy(imageId);

   const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar, {
     folder: "avatars",
     width: 150,
     crop: "scale",
   });

   newUserData.avatar = {
     public_id: myCloud.public_id,
     url: myCloud.secure_url,
   };
 }

// we will add cloudinairy later


const user= await User.findByIdAndUpdate(req.user.id,newUserData,{
   new:true,
   runValidators:true,
   useFindAndModify:false,
});
   res.status(200).json({
      success:true,
   });
});

// get all user --(admin)
exports.getAllUser =catchAsyncErrors(async(req,res,next)=>{
   const users = await User.find();

   res.status(200).json({

      success: true,
      users,

   });
});


// get single user --(admin)
exports.getsingleUser =catchAsyncErrors(async(req,res,next)=>{
   const user = await User.findById(req.params.id);

   if(!user){
      return next(new ErrorHander(`User does not exist with id:${req.params.id}`)
      );
   }

   res.status(200).json({

      success: true,
      user,

   });
});


// update user role--admin
exports.updateUserRole = catchAsyncErrors(async(req,res,next)=>{
  const newUserData={
   name:req.body.name,
   email:req.body.email,
   role:req.body.role,
  };




const user= await User.findByIdAndUpdate(req.params.id,newUserData,{
   new:true,
   runValidators:true,
   useFindAndModify:false,
});
   res.status(200).json({
      success:true,
   });
});


// Delete user --admin
exports.deleteUser = catchAsyncErrors(async(req,res,next)=>{
   const user = await User.findByIdAndUpdate(req.params.id)
 // we will remove cloudinairy later
 
 if(!user){
   return next(new ErrorHander(`User does not exist with Id: ${req.params.id}`))
 }
 await user.remove();
 
 

    res.status(200).json({
       success:true,
       message:"user deleted successfuly"
    });
 });