import React, { useEffect, useState } from 'react';
import styles from './middle.module.css';
import { addDoc, collection, onSnapshot, updateDoc, doc, deleteDoc } from "firebase/firestore";
import { db } from '@/firebase';
import { MdOutlineAdd, MdDelete } from "react-icons/md";
import { FaCartPlus } from "react-icons/fa";
import { BsQrCodeScan } from "react-icons/bs";
import { v4 as uuidv4 } from 'uuid';
import { Html5QrcodeScanner } from "html5-qrcode";

const MiddleSec = ({ setTranstion, setTotelPrice, setTotelQuntety, search, time }) => {
  const [items, setItems] = useState([]);
  const [newForms, setNewForms] = useState([{ id: uuidv4(), selectedItem: '', selectedColor: '', selectedSize: '', price: 0 }]);
  const [scrollToIndex, setScrollToIndex] = useState(null);
  const [sellItemData, setSellItemData] = useState(false);
  const [showScanner, setShowScanner] = useState(false);

  const handleAddItem = () => {
    const newItemCard = { id: uuidv4(), selectedItem: '', selectedColor: '', selectedSize: '', price: 0 };
    setNewForms(prevForms => [...prevForms, newItemCard]);
    setScrollToIndex(newForms.length);
  };

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'AddItem'), (snapshot) => {
      const newItems = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));
      setItems(newItems);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (scrollToIndex !== null) {
      const newFormElement = document.getElementById(`form-${scrollToIndex}`);
      if (newFormElement) {
        newFormElement.scrollIntoView({ behavior: "smooth" });
      }
      setScrollToIndex(null);
    }
  }, [scrollToIndex]);

  const handleItemChange = (itemId, index) => {
    const selectedItem = items.find(item => item.id === itemId);
    const updatedNewForms = [...newForms];
    updatedNewForms[index] = {
      ...updatedNewForms[index],
      selectedItem,
      selectedColor: '',
      selectedSize: '',
      price: selectedItem ? selectedItem.newFormData.itemPrice : 0
    };
    setNewForms(updatedNewForms);
  };

  const handleColorChange = (color, index) => {
    const updatedNewForms = [...newForms];
    updatedNewForms[index] = {
      ...updatedNewForms[index],
      selectedColor: color,
      selectedSize: '',
    };
    setNewForms(updatedNewForms);
  };

  const handleSizeChange = (size, index) => {
    const updatedNewForms = [...newForms];
    updatedNewForms[index] = {
      ...updatedNewForms[index],
      selectedSize: size
    };
    setNewForms(updatedNewForms);
  };

  const handleDelete = (id) => {
    const updatedForms = newForms.filter((form) => form.id !== id);
    setNewForms(updatedForms);
  };

  const updateItemQuantity = async (form) => {
    const itemRef = doc(db, 'AddItem', form.selectedItem.id);
    const updatedItem = { ...form.selectedItem };
    const currentColorSizes = updatedItem.newFormData.itemColors[form.selectedColor];

    // Decrement the quantity of the selected size
    currentColorSizes[form.selectedSize] -= 1;

    // Remove the size if the quantity is zero
    if (currentColorSizes[form.selectedSize] === 0) {
      delete currentColorSizes[form.selectedSize];
    }

    // Remove the color if no sizes are left
    if (Object.keys(currentColorSizes).length === 0) {
      delete updatedItem.newFormData.itemColors[form.selectedColor];
    }

    // Delete the document if no colors are left
    if (Object.keys(updatedItem.newFormData.itemColors).length === 0) {
      await deleteDoc(itemRef);
    } else {
      await updateDoc(itemRef, { newFormData: updatedItem.newFormData });
    }
  };

  const readCode = (index) => {
    setShowScanner(true);
    const scanner = new Html5QrcodeScanner('reader', {
      qrbox: {
        width: 250,
        height: 250,
      },
      fps: 5,
    });

    scanner.render(success, error);

    function success(result) {
      const scannedValue = result;
      const matchedItem = items.find(item => item.newFormData.itemName === scannedValue);
      
      if (matchedItem) {
        handleItemChange(matchedItem.id, index);
      }
      scanner.clear();
      setShowScanner(false); 
    }
    
    function error(err) {
      console.log(err);
    }
  };

  const handleSubmit = async () => {
    let totalPrice = 0;
    let totalQuantity = 0;

    newForms.forEach(form => {
      totalPrice += parseFloat(form.price);
      totalQuantity++;
    });

    setTotelPrice(totalPrice);
    setTotelQuntety(totalQuantity);
    setTranstion(true);
    setSellItemData(true);

    for (const form of newForms) {
      await updateItemQuantity(form);
    }
  };

  useEffect(() => {
    if (sellItemData && time) {
      const sendDataToFirestore = async () => {
        try {
          const sellItemDetails = newForms.map(form => ({
            itemName: form.selectedItem?.newFormData?.itemName,
            itemCategory: form.selectedItem?.newFormData?.itemCategory,
            selectedColor: form.selectedColor,
            selectedSize: form.selectedSize,
            price: form.price,
            itemDescription: form.selectedItem?.newFormData?.itemDescription,
            fullTime: time,
          }));

          await addDoc(collection(db, 'SingelItem'), {
            items: sellItemDetails
          });

          setNewForms([{ id: uuidv4(), selectedItem: '', selectedColor: '', selectedSize: '', price: 0 }]);
        } catch (error) {
          console.error("Error adding document: ", error);
        }
      };
      sendDataToFirestore();
      setSellItemData(false);
    }
  }, [sellItemData, newForms, time]);

  return (
    <div className={styles.middleContainer}>
       {showScanner && (
        <div className={styles.readerContainer}>
          <div id='reader'></div>
        </div>
      )}
      {newForms.map((form, index) => (
        <div key={form.id} id={`form-${index}`} className={styles.form}>
          <div>
            <select value={form.selectedItem ? form.selectedItem.id : ''} onChange={(e) => handleItemChange(e.target.value, index)}>
              <option value="">Select Item</option>
              {items
                .filter(item => item.newFormData.itemName.toLowerCase().includes(search.toLowerCase()))
                .map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.newFormData.itemName} ({item.newFormData.itemCategory})
                  </option>
                ))}
            </select>
            {form.selectedItem && (
              <>
                <select value={form.selectedColor} onChange={(e) => handleColorChange(e.target.value, index)}>
                  <option value="">Select Color</option>
                  {Object.keys(form.selectedItem.newFormData.itemColors).map((color) => (
                    <option key={color} value={color}>
                      {color}
                    </option>
                  ))}
                </select>
                {form.selectedColor && form.selectedItem.newFormData.itemColors[form.selectedColor] && (
                  <select value={form.selectedSize} onChange={(e) => handleSizeChange(e.target.value, index)}>
                    <option value="">Select Size</option>
                    {Object.entries(form.selectedItem.newFormData.itemColors[form.selectedColor]).map(([size, quantity]) => (
                      <option key={size} value={size}>{size} ({quantity})</option>
                    ))}
                  </select>
                )}
                <span className={styles.price}> {Number(form.price || 0).toLocaleString()} IQD</span>
                <p className={styles.nots}>{form.selectedItem?.newFormData?.itemDescription || "لا يوجد ملاحظات"}</p>
              </>
            )}
          </div>
          <div>
            <button onClick={() => readCode(index)}><BsQrCodeScan /></button>
            <button onClick={() => handleDelete(form.id)}><MdDelete /></button>
          </div>
        </div>
      ))}
      <div className={styles.buttons}>
        <button onClick={handleAddItem}><MdOutlineAdd /></button>
        <button onClick={handleSubmit}><FaCartPlus /></button>
      </div>
    </div>
  );
};

export default MiddleSec;
