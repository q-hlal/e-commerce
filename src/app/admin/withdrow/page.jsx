import React, { useState, useEffect } from 'react';
import styles from './withdrow.module.css';
import { collection, deleteDoc, doc, getDoc, getDocs, updateDoc } from 'firebase/firestore';
import { db } from '@/firebase';

const Withdrow = () => {
  const [addedAmount, setAddedAmount] = useState('');
  const [withdrawnAmount, setWithdrawnAmount] = useState('');
  const [note, setNote] = useState('');
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    const storedEntries = JSON.parse(localStorage.getItem('entries')) || [];
    setEntries(storedEntries);
  }, []);

  const handleSave = async () => {
    try {
      const adminPanelDoc = doc(db, 'AdminPanel', 'WmVeBDvuJZvybdwoMMj0');
      const docSnapshot = await getDoc(adminPanelDoc);

      if (docSnapshot.exists()) {
        const docData = docSnapshot.data();
        const netTotal = docData.netTotal || 0;
        const existingWithdrawnAmount = docData.withdrawnAmount || 0;

        const addedAmountNum = parseFloat(addedAmount) || 0;
        const withdrawnAmountNum = parseFloat(withdrawnAmount) || 0;
        const newNetTotal = netTotal + addedAmountNum - withdrawnAmountNum;
        const updatedWithdrawnAmount = existingWithdrawnAmount + withdrawnAmountNum;

        await updateDoc(adminPanelDoc, {
          netTotal: newNetTotal,
          withdrawnAmount: updatedWithdrawnAmount,
        });

        const newEntry = {};
        if (addedAmount) newEntry.addedAmount = addedAmount;
        if (withdrawnAmount) newEntry.withdrawnAmount = withdrawnAmount;
        if (note) newEntry.note = note;

        const updatedEntries = [...entries, newEntry];
        localStorage.setItem('entries', JSON.stringify(updatedEntries));

        setEntries(updatedEntries);
        setAddedAmount('');
        setWithdrawnAmount('');
        setNote('');
      } else {
        console.error('Document does not exist');
      }
    } catch (error) {
      console.error('Error updating document:', error);
    }
  };

  const handelClear = async () => {
    try {
      const adminPanelDoc = doc(db, 'AdminPanel', 'WmVeBDvuJZvybdwoMMj0');
      await updateDoc(adminPanelDoc, {
        withdrawnAmount: 0, 
        netTotal: 0, 
        totalQuantity: 0
      });

      // Delete all documents from SingelItem collection
      const singelItem = collection(db, 'SingelItem');
      const singelItemSnapshot = await getDocs(singelItem);
      const singelItemDeletePromises = singelItemSnapshot.docs.map(document => {
        return deleteDoc(doc(db, 'SingelItem', document.id));
      });
      await Promise.all(singelItemDeletePromises);

      // Delete all documents from SellingItem collection
      const SellingInfo = collection(db, 'SellingInfo');
      const SellingInfoSnapshot = await getDocs(SellingInfo);
      const SellingInfoDeletePromises = SellingInfoSnapshot.docs.map(document => {
        return deleteDoc(doc(db, 'SellingInfo', document.id));
      });
      await Promise.all(SellingInfoDeletePromises);

      // Clear local storage entries
      localStorage.removeItem('entries');
      setEntries([]);
    } catch (error) {
      console.error('Error clearing entries:', error);
    }
  };

  return (
    <div className={styles.withdrow}>
      <div className={styles.textArea}>
        {entries.length ? entries.map((entry, index) => (
          <div key={index} className={styles.entry}>
            {entry.addedAmount && <p style={{ backgroundColor: 'green' }}>تم اضافه مبلغ بقيمه: {parseFloat(entry.addedAmount).toLocaleString()}</p>}
            {entry.withdrawnAmount && <p style={{ backgroundColor: 'red' }}>تم سحب مبلغ بقيمه: {parseFloat(entry.withdrawnAmount).toLocaleString()}</p>}
            {entry.note && <p style={{ backgroundColor: 'grey' }}>ملاحظه: {entry.note}</p>}
          </div>
        )) : <span>لاتوجد تعديلات شخصيه حاليا !</span>}
      </div>
      <div className={styles.inputsArea}>
        <div className={styles.inputs}>
          <input
            placeholder='المبلغ المضاف'
            value={addedAmount}
            onChange={(e) => setAddedAmount(e.target.value)}
          />
          <input
            placeholder='المبلغ المسحوب'
            value={withdrawnAmount}
            onChange={(e) => setWithdrawnAmount(e.target.value)}
          />
          <textarea
            placeholder='اضافه ملاحظه'
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={5}
          />
        </div>
        <div className={styles.buttons}>
          <button className={styles.deleteButton} onClick={handelClear}>حذف السجل</button>
          <button className={styles.saveButton} onClick={handleSave}>حفظ التغير</button>
        </div>
      </div>
    </div>
  );
};

export default Withdrow;
