import { useState, useEffect } from 'react';
import styles from './singleItem.module.css';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/firebase';
import { IoIosColorPalette, IoMdPricetag, IoIosClock } from "react-icons/io";
import { GiClothes } from "react-icons/gi";
import { LuArrowUpWideNarrow } from "react-icons/lu";
import { MdDriveFileRenameOutline } from "react-icons/md";

const SingleItem = () => {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const colRef = collection(db, "SingelItem");
        const querySnapshot = await getDocs(colRef);
        const fetchedDocuments = querySnapshot.docs.map(doc => doc.data());

        const allItems = fetchedDocuments.flatMap(doc => 
          doc.items.map(item => ({
            ...item,
            dateTime: new Date(`${item.fullTime?.date} ${item.fullTime?.time}`)
          }))
        );

        allItems.sort((a, b) => b.dateTime - a.dateTime);

        setItems(allItems);
      } catch (error) {
        console.error("Error getting documents:", error);
      }
    };
    fetchData();
  }, []);

  const renderItemData = (data) => {
    return data || "لا يوجد بيانات لعرضها";
  };

  return (
    <div className={styles.singleItem}>
      <div className={styles.headers}>
        <div className={styles.coloum}>
          <h2 className={styles.itemTitle}>اسم المنتج<MdDriveFileRenameOutline /></h2>
          <h2 className={styles.itemTitle}>نوع المنتج<GiClothes /></h2>
          <h2 className={styles.itemTitle}>لون المنتج<IoIosColorPalette /></h2>
          <h2 className={styles.itemTitle}>حجم المنتج<LuArrowUpWideNarrow /></h2>
          <h2 className={styles.itemTitle}>سعر المنتج<IoMdPricetag /></h2>
          <h2 className={styles.itemTitle}>الوقت والتاريخ<IoIosClock /></h2>
        </div>
      </div>
      {items.length === 0 ? (
        <p className={styles.noDataMessage}>لا يوجد بيانات حاليا!!</p>
      ) : (
        items.map((item, index) => (
          <div className={styles.row} key={index}>
            <div className={styles.coloum}>
              <p className={styles.itemData}>{renderItemData(item.itemName)}</p>
              <p className={styles.itemData}>{renderItemData(item.itemCategory)}</p>
              <p className={styles.itemData}>{renderItemData(item.selectedColor)}</p>
              <p className={styles.itemData}>{renderItemData(item.selectedSize)}</p>
              <p className={styles.itemData}>{item.price ? Number(item.price).toLocaleString() : "لا يوجد بيانات لعرضها"}</p>
              <p className={styles.itemData}>
                <span>{renderItemData(item.fullTime?.time)}</span>
                <span>{renderItemData(item.fullTime?.date)}</span>
              </p>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default SingleItem;
