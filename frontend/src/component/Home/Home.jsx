import React, { Fragment, useEffect ,useState} from "react";
import "./Home.css"
import Product from "./ProductCard.js"
import MetaData from "../layout/MetaData ";
import { clearErrors, getProduct } from "../../actions/productAction";
import {useSelector,useDispatch} from "react-redux"
import { useAlert } from "react-alert";
import Loader from "../layout/Loader/Loader";
import v from "../asset/vidio.mp4";
import "./Search.css";


 
const Home = ({history}) => {
 
const [keyword, setKeyword] = useState("");

const searchSubmitHandler = (e) => {
  e.preventDefault();
  if (keyword.trim()) {
    history.push(`/products/${keyword}`);
  } else {
    history.push("/products");
  }
};


  const alert =useAlert()
const dispatch = useDispatch();
const {loading,error,products} = useSelector((state)=>state.products);

useEffect(() =>{
  if(error){
   alert.error(error)
   dispatch(clearErrors());
  }

  dispatch(getProduct());

}, [dispatch,error,alert]);








return(
 <Fragment>
  {loading ? 
    (<Loader/>)
     :(
  <Fragment>
    <MetaData title ="ECOMMERCE"/>
    

<div className="banner">
      <form className="searchBox" onSubmit={searchSubmitHandler}>
        <input
          type="text"
          placeholder="Search a Product ..."
          onChange={(e) => setKeyword(e.target.value)}
        />
        <input type="submit" value="Search" />
      </form>
  <video src={v}  autoPlay loop muted />
    <p>Welcomw to Ecommerce</p>
    <h1> FIND AMAZING PRODUCTS BELOW</h1>
</div>
<h2 className="homeHeading">Featured Product</h2>
<div className="container" id="container">
 {products && products.map((product) => <Product product={product}/>)}
</div>
  </Fragment>
    )}; 
 </Fragment>
  );
};

export default Home;