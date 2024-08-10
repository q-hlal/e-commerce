'use client'
import { useEffect, useState } from 'react';
import { FaCartShopping } from "react-icons/fa6";
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/firebase';
import './globals.css'


const CartLength = () => {
  const [length, setLength] = useState(0);

  useEffect(() => {
    const fetchDocsLength = async () => {
      try {
        const sellingInfoCollection = collection(db, 'SellingInfo');
        const querySnapshot = await getDocs(sellingInfoCollection);
        setLength(querySnapshot.size);
      } catch (error) {
        console.error("Error getting documents: ", error);
      }
    };

    fetchDocsLength();
  }, []);

  return (
    <>
      <FaCartShopping />
      <span>{length}</span>
    </>
  );
};

export default CartLength;
