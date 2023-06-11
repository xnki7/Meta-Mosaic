import React from "react";
import "./NFTcard.css";

function NFTcard({id, title, description, img, price, seller}) {
  return (
    <div className="NFTcard">
      <div className="image">
        {/* eslint-disable-next-line */}
        <img src={img} />
      </div>
      <div className="details">
        <div className="left">
            <p className="title">{title}</p>
            <p className="address">{seller.slice(0, 6) + "..." + seller.slice(38, 42)}</p>
        </div>
        <div className="right">
            <p className="id">#{id}</p>
            <p className="price">{price/1000000000000000000} MATIC</p>
        </div>
      </div>
    </div>
  );
}

export default NFTcard;
