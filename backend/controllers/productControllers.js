const Product = require("../models/productModel");
const ErrorHander = require("../utils/errorhander");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const ApiFeatures = require("../utils/apifeatures");
const cloudinary = require("cloudinary");


// create product-- admin

exports.createProduct =catchAsyncErrors(async(req,res,next)=>{
    let images = [];

    if (typeof req.body.images === "string") {
      images.push(req.body.images);
    } else {
      images = req.body.images;
    }
  
    const imagesLinks = [];
  
    for (let i = 0; i < images.length; i++) {
      const result = await cloudinary.v2.uploader.upload(images[i], {
        folder: "products",
      });
  
      imagesLinks.push({
        public_id: result.public_id,
        url: result.secure_url,
      });
    }
  
    req.body.images = imagesLinks;
    req.body.user = req.user.id
    const product = await Product.create(req.body);
    res.status(201).json({
       success:true,
       product,
    });
});
// GETall product

exports.getAllProducts = catchAsyncErrors(async(req,res,next)=>{


    const resultPerPage = 8;
    const productsCount = await Product.countDocuments();

    const apiFeature = new ApiFeatures(Product.find(),req.query)
    .search()
    .filter()
    let products = await apiFeature.query;

    let filteredProductsCount = products.length;
  
    apiFeature.pagination(resultPerPage);
  
    products = await apiFeature.query.clone();
 
res.status(200).json({
    success:true,
    products,
    productsCount,
    resultPerPage,
    filteredProductsCount,
    
 });

});


// Get All Product (Admin)
exports.getAdminProducts = catchAsyncErrors(async (req, res, next) => {
    const products = await Product.find();
  
    res.status(200).json({
      success: true,
      products,
    });
  });
  

// GET PRODUCT DETAIL
exports.getProductDetails = catchAsyncErrors(async(req,res,next)=>{
    const product = await Product.findById(req.params.id);
    if(!product){
        return next(new ErrorHander("product not found",404));

        
    }

    res.status(200).json({
        success:true,
        product,
    
      });



});






// update product---admin
exports.updateproduct =catchAsyncErrors(async (req,res,next)=>{

    let product = await Product.findById(req.params.id);
    if(!product){
        return next(new ErrorHander("product not found",404));
    }

    let images = [];

    if (typeof req.body.images === "string") {
      images.push(req.body.images);
    } else {
      images = req.body.images;
    }
  
    if (images !== undefined) {

        // Deleting Images From Cloudinary
    for (let i = 0; i < product.images.length; i++) {
        await cloudinary.v2.uploader.destroy(product.images[i].public_id);
      }
  
      const imagesLinks = [];
  
      for (let i = 0; i < images.length; i++) {
        const result = await cloudinary.v2.uploader.upload(images[i], {
          folder: "products",
        });
  
        imagesLinks.push({
          public_id: result.public_id,
          url: result.secure_url,
        });
      }
  
      req.body.images = imagesLinks;
    }
  

    product = await Product.findByIdAndUpdate(req.params.id,req.body,{
        new:true,
        runValidatoros:true,
        useFindAndModify:false
    });

    res.status(200).json({
        sucess:true,
        product,
        
    });
});
// Delete product
 
exports.deleteProduct = catchAsyncErrors(async(req,res,next)=>{
    const product = await Product.findById(req.params.id);

    if(!product){
        return next(new ErrorHander("product not found",404));
    }

    for (let i = 0; i < product.images.length; i++) {
        await cloudinary.v2.uploader.destroy(product.images[i].public_id);
      }

  await product.remove();

  res.status(200).json({
    success:true,
    message:"Product delete sucessfully",

  });
});

// create new review or update the review

exports.createProductReview = catchAsyncErrors(async(req,res,next)=>{


    const{ rating,comment,productId}=req.body;

    const review = {
        user: req.user._id,
        name: req.user.name,
        rating : Number(rating),
        comment,

    };
const product = await Product.findById(productId);

const isReviewed = product.reviews.find((rev)=> rev.user.toString()===req.user._id.toString()
);

if(isReviewed){

    product.reviews.forEach((rev)=>{
        if(rev.user.toString() === req.user._id.toString());
        (rev.rating=rating),
        (rev.comment=comment)

    });


}
else{
    product.reviews.push(review);
    product.numofReviews = product.reviews.length
}


let avg=0;

product.reviews.forEach((rev)=>{
    avg+=rev.rating;

})

product.ratings =avg

/ product.reviews.length;
// Number(product.ratings)




await product.save({validateBeforeSave:false});

res.status(200).json({
    success:true,

});
});

// get all revews of a product
exports.getProductReviews = catchAsyncErrors(async(req,res,next)=>{
    const product = await Product.findById(req.query.id);
    if(!product){
        return next(new ErrorHander("product not found",404));

    }
    res.status(200).json({
        success:true,
        reviews:product.reviews,
    });
});
// delete review

exports.deleteReview = catchAsyncErrors(async(req,res,next)=>{
    const product = await Product.findById(req.query.productId);
    if(!product){
        return next(new ErrorHander("product not found",404));

    }

const reviews = product.reviews.filter((rev)=> rev._id.toString() !==req.query.id.toString())
let avg=0;

reviews.forEach((rev)=>{
    avg+=rev.rating;

})

const rating =avg/reviews.length;

const numofReviews = reviews.length;

await Product.findByIdAndUpdate(req.query.productId,{
    reviews,
    rating,
    numofReviews,

},{ 
    new:true,
    runValidators:true,
    useFindAndModify:false,
}
)


    res.status(200).json({
        success:true,
    });
});
