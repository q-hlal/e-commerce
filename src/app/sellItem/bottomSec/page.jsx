import React, { useEffect, useState } from 'react';
import styles from './bottom.module.css';
import { collection, query, where, getDocs, updateDoc, addDoc } from "firebase/firestore"; 
import { db } from '@/firebase';

const BottomSec = ({ transtion, totalPrice, totalQuntety, time, transtionType, transtionNumber }) => {
  const [customerName, setCustomerName] = useState('');
  const [customerNumber, setCustomerNumber] = useState('');
  const [discount, setDiscount] = useState('');
  const [debit, setDebit] = useState('');
  const [netTotal, setNetTotal] = useState(totalPrice);

  const debitCollection = collection(db, 'Debit');
  const adminPanelCollection = collection(db, 'AdminPanel');
  const sellingInfoCollection = collection(db, 'SellingInfo');

  useEffect(() => {
    const updateDatabase = async () => {
      if (transtion && time) {
        const calculatedNetTotal = totalPrice - (Number(discount) + Number(debit));
        setNetTotal(calculatedNetTotal);

        const q = query(debitCollection, where('customerName', '==', customerName));
        const querySnapshot = await getDocs(q);

        const newTransaction = {
          debit: Number(debit),
          fullTime: time
        };

        if (debit > 0) {
          if (!querySnapshot.empty) {
            const docRef = querySnapshot.docs[0].ref;
            const docData = querySnapshot.docs[0].data();
            const oldTransactions = docData.transactions || [];
            const newTransactions = [...oldTransactions, newTransaction];
            const totalDebit = oldTransactions.reduce((acc, t) => acc + Number(t.debit), 0) + Number(debit);

            await updateDoc(docRef, {
              fullTime: time,
              customerName,
              customerNumber: customerNumber || docData.customerNumber,
              transactions: newTransactions,
              totalDebit
            });
          } else {
            await addDoc(debitCollection, {
              fullTime: time,
              customerName,
              customerNumber,
              transactions: [newTransaction],
              totalDebit: newTransaction.debit
            });
          }
        }

        const adminPanelQuery = query(adminPanelCollection);
        const adminPanelSnapshot = await getDocs(adminPanelQuery);

        if (!adminPanelSnapshot.empty) {
          const adminDocRef = adminPanelSnapshot.docs[0].ref;
          const adminData = adminPanelSnapshot.docs[0].data();

          const oldTotalNetTotal = adminData.netTotal || 0;
          const oldTotalQuantity = adminData.totalQuantity || 0;
          const oldTotalDebit = adminData.totalDebit || 0;

          const newTotalNetTotal = oldTotalNetTotal + calculatedNetTotal;
          const newTotalQuantity = oldTotalQuantity + totalQuntety;
          const newTotalDebit = oldTotalDebit + Number(debit);

          await updateDoc(adminDocRef, {
            netTotal: newTotalNetTotal,
            totalQuantity: newTotalQuantity,
            totalDebit: newTotalDebit,
          });
        } else {
          await addDoc(adminPanelCollection, {
            netTotal: calculatedNetTotal,
            totalQuantity: totalQuntety,
            totalDebit: Number(debit),
          });
        }
        if (transtionNumber && transtionType) {
          await addDoc(sellingInfoCollection, {
            time,
            transtionType,
            transtionNumber,
            netTotal: calculatedNetTotal,
            totalQuntety,
            customerName,
            totalDebit: Number(debit),
            discount: Number(discount)
          });
        }
      }
    };

    updateDatabase();
  }, [transtion, time]);

  const formatNumberWithCommas = (number) => {
    return number.toLocaleString('en-US');
  };

  return (
    <div className={styles.bottomContainer}>
      <div className={styles.left}>
        <span>اجمالي الوحدات: {formatNumberWithCommas(totalQuntety || 0)}</span>
        <span>اجمالي الخصم: {formatNumberWithCommas(discount || 0)}</span>
        <span>اجمالي الدين: {formatNumberWithCommas(debit || 0)}</span>
        <h2>صافي المبلغ: {formatNumberWithCommas(netTotal)}</h2>
      </div>
      <div className={styles.middle}>
        <input
          placeholder='اسم العميل'
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
        />
        <input
          placeholder='رقم العميل'
          value={customerNumber}
          onChange={(e) => setCustomerNumber(e.target.value)}
        />
        <input
          placeholder='مبلغ الدين'
          type='number'
          value={debit}
          onChange={(e) => setDebit(e.target.value)}
        />
      </div>
      <div className={styles.right}>
        <h3>اجمالي المبلغ: {formatNumberWithCommas(totalPrice)}</h3>
        <input
          placeholder='نسبه الخصم'
          type='number'
          value={discount}
          onChange={(e) => setDiscount(e.target.value)}
        />
      </div>
    </div>
  );
};

export default BottomSec;
