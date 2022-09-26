import { Rating } from '@material-ui/lab';
import React from 'react'
import profilePng from  "../../images/Profile.png"

const ReviewCard = ({review}) => {


  


      const options = {
        size:"small",
        readOnly: true,
        value: review.rating,
        percision:0.5,
        
      };
  return  <div className="reviewCard">
    <img src={profilePng} alt ="User" />
    <p>{review.name}</p>
    <Rating {...options}/>
    <span>{review.comment}</span>
  </div>

  
}

export default ReviewCard;