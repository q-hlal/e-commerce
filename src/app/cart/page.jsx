"use client";
import { useEffect, useState } from 'react';
import styles from './cart.module.css';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '@/firebase';

const Cart = () => {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'SellingInfo'), (snapshot) => {
      const newItems = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      newItems.sort((a, b) => {
        const dateA = new Date(`${a.time?.date} ${a.time?.time}`);
        const dateB = new Date(`${b.time?.date} ${b.time?.time}`);
        return dateB - dateA;
      });

      setItems(newItems);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className={styles.cart}>
      <div className={styles.container}>
        {items.length > 0 ? items.map(item => (
          <div key={item.id} className={styles.card}>
            <div className={styles.date}>
              <span>التاريخ : {item.time?.date || "لا يوجد بيانات"}</span>
              <span>الوقت : {item.time?.time || "لا يوجد بيانات"}</span>
            </div>
            <div className={styles.main}>
              <h1>اسم العميل : {item.customerName || "مستطرق"}</h1>
              <div className={styles.amount}>
                <h3>اجمالي النقد : {item.netTotal?.toLocaleString() || 0}</h3>
                <p>مبلغ الدين : {item.totalDebit?.toLocaleString() || 0}</p>
                <p>مبلغ الخصم : {item.discount?.toLocaleString() || 0}</p>
                <p>اجمالي الوحدات: {item.totalQuntety || 0}</p>
              </div>
            </div>
            <div className={styles.info}>
              <span>رقم عمليه البيع : {item.transtionNumber || "لا يوجد بيانات"}</span>
              <span className={item.transtionType === 'نقد' ? `${styles.green}` : `${styles.red}`}>
                نوع عمليه البيع : {item.transtionType || "لا يوجد بيانات"}
              </span>
            </div>
          </div>
        )) : <p className={styles.noDataMessage}>لا يوجد بيانات حاليا</p>}
      </div>
    </div>
  );
};

export default Cart;
