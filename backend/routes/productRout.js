const express = require("express");
// const {router} = require("../app");
const { getAllProducts,createProduct, updateproduct, deleteProduct, getProductDetails, createProductReview, deleteReview, getProductReviews, getAdminProducts } = require("../controllers/productControllers");
const { isAuthenticatedUser, authorizeRoles, } = require("../middleware/auth.js");


const router = express.Router();


router.route("/products").get( getAllProducts);
router
  .route("/admin/products")
  .get(isAuthenticatedUser, authorizeRoles("admin"), getAdminProducts);



router.route("/admin/product/new").post(isAuthenticatedUser,authorizeRoles("admin"), createProduct);

router
.route("/admin/product/:id")
.put(isAuthenticatedUser, authorizeRoles("admin"),updateproduct)
.delete(isAuthenticatedUser,authorizeRoles("admin"), deleteProduct);

router.route("/product/:id").get(getProductDetails);


router.route("/review").put(isAuthenticatedUser,createProductReview);

router.route("/reviews").get(getProductReviews).delete(isAuthenticatedUser,deleteReview);

module.exports = router;
