import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getOrderById } from '../utils/api';

const OrderSuccessPage = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  useEffect(() => { getOrderById(id).then(res => setOrder(res.data.order)).catch(console.error); }, [id]);
  return (
    <div className="pt-[72px] min-h-screen bg-cream flex items-center justify-center px-4">
      <div className="text-center max-w-md animate-slide-up">
        <div className="w-20 h-20 bg-sage/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-sage" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="font-display text-4xl text-deep-brown mb-3">Order Placed!</h1>
        <p className="font-sans text-warm-gray mb-2">Thank you for your purchase. Your order has been confirmed.</p>
        {order && <p className="text-sm text-taupe font-sans mb-6">Order ID: <span className="font-medium text-deep-brown">{order._id?.slice(-8).toUpperCase()}</span></p>}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to={`/orders/${id}`} className="btn-outline">View Order</Link>
          <Link to="/products" className="btn-primary">Continue Shopping</Link>
        </div>
      </div>
    </div>
  );
};
export default OrderSuccessPage;
