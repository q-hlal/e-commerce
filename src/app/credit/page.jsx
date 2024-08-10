"use client";
import styles from './credit.module.css';
import { RiDeleteBin5Line } from "react-icons/ri";
import { CiEdit } from "react-icons/ci";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";
import { useEffect, useState } from 'react';
import {
  collection,
  onSnapshot,
  updateDoc,
  deleteDoc,
  doc,
  getDoc
} from "firebase/firestore";
import { db } from '@/firebase';
import { DeleteConfirmation } from './DeletePopup';
import Image from 'next/image';
import { FaPlus } from "react-icons/fa";
import AddCustomer from './AddCustomer';

const Page = () => {
  const [activeEditItem, setActiveEditItem] = useState(null);
  const [activeDetailItem, setActiveDetailItem] = useState(null);
  const [items, setItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [editValue, setEditValue] = useState('');
  const [deletePopup, setDeletePopup] = useState(false);
  const [deleteItemId, setDeleteItemId] = useState(null);
  const [showAddCustomer, setShowAddCustomer] = useState(false);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'Debit'), (snapshot) => {
      const newItems = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));
      setItems(newItems);
    });
    return () => unsubscribe();
  }, []);

  const deleteCustomer = async (id) => {
    await deleteDoc(doc(db, 'Debit', id));
    setDeletePopup(false);
  };

  const updateDebit = async (item) => {
    if (editValue === '') return;
    const editValueNumber = parseFloat(editValue);
    const newDebit = parseFloat(item.totalDebit) - editValueNumber;

    const currentTime = new Date();
    const date = currentTime.toLocaleDateString('en-GB');
    const time = currentTime.toLocaleTimeString('en-GB');

    try {
      // Update the Debit collection
      await updateDoc(doc(db, 'Debit', item.id), {
        totalDebit: newDebit,
        'fullTime.date': date,
        'fullTime.time': time
      });

      // Update the adminpanel collection
      const adminPanelDoc = doc(db, 'AdminPanel', 'WmVeBDvuJZvybdwoMMj0');
      const adminPanelSnapshot = await getDoc(adminPanelDoc);
      if (adminPanelSnapshot.exists()) {
        const adminData = adminPanelSnapshot.data();
        const newTotalDebit = adminData.totalDebit - editValueNumber;
        const newNetTotal = adminData.netTotal + editValueNumber;
        await updateDoc(adminPanelDoc, {
          totalDebit: newTotalDebit,
          netTotal: newNetTotal
        });
      } else {
        console.error("Admin panel document does not exist!");
      }
    } catch (error) {
      console.error("Error updating document: ", error);
    }

    setEditValue('');
    setActiveEditItem(null);
  };

  const filteredItems = items.filter(item =>
    item.id.includes(searchQuery) ||
    item.customerName.includes(searchQuery) ||
    item.customerNumber.includes(searchQuery)
  );

  const handleDeleteClick = (id) => {
    setDeleteItemId(id);
    setDeletePopup(true);
  };

  const handleConfirmDelete = () => {
    if (deleteItemId) {
      deleteCustomer(deleteItemId);
      setDeleteItemId(null);
    }
  };

  const handleCancelDelete = () => {
    setDeleteItemId(null);
    setDeletePopup(false);
  };

  return (
    <div className={styles.credit}>
      {deletePopup && (
        <div className={styles.popupOverlay}>
          <DeleteConfirmation 
            onDelete={handleConfirmDelete}
            onCancel={handleCancelDelete}
          />
        </div>
      )}
      {showAddCustomer && (
        <div className={styles.popupOverlay}>
          <AddCustomer setShowAddCustomer={setShowAddCustomer}/>
        </div>
      )}
      <div className={styles.container}>
        <div className={styles.input}>
          <button className={styles.addButton} onClick={() => setShowAddCustomer(true)}><FaPlus/></button> 
          <input 
            placeholder='search'
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
        {filteredItems.length > 0 ? (
          filteredItems.map((item, index) => (
            <div className={styles.card} key={item.id}>
              <div className={styles.details}>
                <div className={styles.top}>
                  {item.totalDebit === 0 && <Image src="/imges/ok.png" width={400} height={400}/>}
                  <div className={styles.leftDetails}>
                    <div className={styles.buttons}>
                      <button onClick={() => handleDeleteClick(item.id)}><RiDeleteBin5Line /></button>
                      <button onClick={() => setActiveEditItem(activeEditItem === item.id ? null : item.id)}><CiEdit /></button>
                    </div>
                    <div className={styles.time}>
                      <span>التاريخ {item.fullTime.date}</span>
                      <span>الوقت {item.fullTime.time}</span>
                    </div>
                  </div>
                  <div className={styles.middleDetails}>
                    <h2 className={item.totalDebit === 0 ? styles.empty : ''}>{parseFloat(item.totalDebit).toLocaleString() || 0} IQD : اجمالي الدين</h2>
                    {activeEditItem === item.id && 
                      <div>
                        <input 
                          placeholder='اضف مبلغ'
                          value={editValue}
                          onChange={e => setEditValue(e.target.value)}
                        />
                        <button onClick={() => updateDebit(item)}>حفظ التعديل</button>
                      </div>
                    }
                    <span onClick={() => setActiveDetailItem(activeDetailItem === item.id ? null : item.id)}>
                      {activeDetailItem === item.id ? <IoIosArrowUp /> : <IoIosArrowDown />}
                    </span>
                  </div>
                  <div className={styles.rightDetails}>
                    <h3>رمز العميل : {index + 1}</h3>
                    <h3>اسم العميل : {item.customerName ? item.customerName : " ----"}</h3>
                    <h3> رقم العميل : {item.customerNumber ? item.customerNumber : "----"}</h3>
                  </div>
                </div>
                {activeDetailItem === item.id && item.transactions && (
                  <div className={styles.bottom}>
                  {item.transactions && Array.isArray(item.transactions) && item.transactions.length > 0 && (
                      item.transactions.map((transaction, tIndex) => (
                        <div key={tIndex} className={styles.transaction}>
                          <div className={styles.transactionTime}>
                            <span>{transaction.fullTime.date}</span>
                            <span>{transaction.fullTime.time}</span>
                          </div>
                          <div className={styles.transactionAmount}>
                            <p>{transaction.description && transaction.description}</p>
                            <h2>مبلغ الدين: {(transaction.debit).toLocaleString()}</h2>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <p className={styles.nothing}>لا يوجد عناصر حاليا!!</p>
        )}
      </div>
    </div>
  );
}

export default Page;
