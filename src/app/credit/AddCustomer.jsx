import React, { useState } from 'react';
import { collection, addDoc, query, where, getDocs, updateDoc } from 'firebase/firestore';
import { db } from '@/firebase';
import styles from './credit.module.css';

const AddCustomer = ({ setShowAddCustomer }) => {
  const [customerName, setCustomerName] = useState('');
  const [customerNumber, setCustomerNumber] = useState('');
  const [totalDebit, setTotalDebit] = useState('');

  const debitCollection = collection(db, 'Debit');
  const adminPanelCollection = collection(db, 'AdminPanel');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const currentTime = new Date();
    const date = currentTime.toLocaleDateString('en-GB');
    const time = currentTime.toLocaleTimeString('en-GB');

    const q = query(debitCollection, where('customerName', '==', customerName));
    const querySnapshot = await getDocs(q);

    const newTransaction = {
      fullTime: { time, date },
      description: `تم اضافه المبلغ بدون عمليه بيع `,
      debit: Number(totalDebit)
    };

    if (Number(totalDebit) > 0) {
      if (!querySnapshot.empty) {
        const docRef = querySnapshot.docs[0].ref;
        const docData = querySnapshot.docs[0].data();
        const oldTransactions = docData.transactions || [];
        const newTransactions = [...oldTransactions, newTransaction];
        const totalDebitAmount = oldTransactions.reduce((acc, t) => acc + Number(t.debit), 0) + Number(totalDebit);

        await updateDoc(docRef, {
          fullTime: { time, date },
          customerName,
          customerNumber: customerNumber || docData.customerNumber,
          transactions: newTransactions,
          totalDebit: totalDebitAmount
        });
      } else {
        await addDoc(debitCollection, {
          fullTime: { time, date },
          customerName,
          customerNumber,
          transactions: [newTransaction],
          totalDebit: Number(totalDebit)
        });
      }
    }

    const adminPanelQuery = query(adminPanelCollection);
    const adminPanelSnapshot = await getDocs(adminPanelQuery);

    if (!adminPanelSnapshot.empty) {
      const adminDocRef = adminPanelSnapshot.docs[0].ref;
      const adminData = adminPanelSnapshot.docs[0].data();

      const oldTotalDebit = adminData.totalDebit || 0;
      const newTotalDebit = oldTotalDebit + Number(totalDebit);

      await updateDoc(adminDocRef, {
        totalDebit: newTotalDebit,
      });
    } else {
      await addDoc(adminPanelCollection, {
        totalDebit: Number(totalDebit),
      });
    }
    setShowAddCustomer(false);
  }

  return (
    <div className={styles.addForm}>
      <div className={styles.addCustomer}>
        <form onSubmit={handleSubmit}>
          <input
            placeholder='اسم العميل'
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            required
          />
          <input
            placeholder='رقم العميل'
            value={customerNumber}
            onChange={(e) => setCustomerNumber(e.target.value)}
          />
          <input
            placeholder='قيمه المبلغ'
            value={totalDebit}
            onChange={(e) => setTotalDebit(e.target.value)}
            type="number"
            required
          />
          <div className={styles.addCustomerButtons}>
            <button type="submit">حفظ</button>
            <button type="button" onClick={() => setShowAddCustomer(false)}>الغاء</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCustomer;
