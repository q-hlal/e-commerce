"use client";
import React, { useState, useEffect } from 'react';
import styles from './top.module.css';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/firebase';

const TopSec = ({ transtion, setTime, setTranstionNumber, setTranstionType, setSearch }) => {
  const [dateTime, setDateTime] = useState({ date: '', time: '' });
  const [transactionType, setTransactionType] = useState('نقد');
  const [searchValue, setSearchValue] = useState('');
  const [itemLength, setItemLength] = useState(0);

  useEffect(() => {
    const fetchSellItemLength = async () => {
      const querySnapshot = await getDocs(collection(db, 'SingelItem'));
      setItemLength(querySnapshot.size);
    };
    fetchSellItemLength();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const date = now.toLocaleDateString();
      const time = now.toLocaleTimeString();
      setDateTime({ date, time });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (transtion) {
      setTime(dateTime);
      setTranstionNumber(itemLength + 1);
      setTranstionType(transactionType);
    }
  }, [transtion]);

  const handleTransactionTypeChange = (e) => {
    setTransactionType(e.target.value);
  };

  const handleSearchInputChange = (e) => {
    const value = e.target.value;
    setSearchValue(value);
    setSearch(value);
  };
  

  return (
    <div className={styles.topContainer}>
      <div className={styles.time}>
        <span>📅: {dateTime.date}</span>
        <span>🕒: {dateTime.time}</span>
      </div>
      <div className={styles.searchInput}>
        <input    
          placeholder=' 🔍 search'
          value={searchValue}
          onChange={handleSearchInputChange}/>
      </div>
      <div className={styles.mainInfo}>
        <span>عمليه البيع رقم : {itemLength + 1}</span>
        <select value={transactionType} onChange={handleTransactionTypeChange}>
          <option value="نقد">نقد</option>
          <option value="دائن">دائن</option>
        </select>
      </div>
    </div>
  );
};

export default TopSec;
