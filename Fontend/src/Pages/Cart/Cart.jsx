import React from "react";
import { useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const Cart = () => {
    const user = useSelector((state) => state.auth.login?.currentUser);
    const navigate = useNavigate();
    useEffect(() => {
        if (!user) {
          navigate("/login");
        }
      },[user]);
    return <div>Cart</div>
};

export default Cart;