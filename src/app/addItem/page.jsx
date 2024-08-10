"use client";
import React, { useEffect, useState, useRef } from 'react';
import styles from './addItem.module.css';
import QRCode from 'qrcode.react';
import { collection, addDoc } from "firebase/firestore";
import { db } from '@/firebase';

const Page = () => {
  const colors = ["احمر", "ازرق", "اخضر", "اصفر", "وردي", "بنفسجي", "برتقالي", "رصاصي", "بيجي", 'اسود', 'ابيض'];
  const sizes = ["S", "M", "L", "XL", "2XL", "3XL", "4XL", "5XL", "6XL", "7XL", "8XL"];
  const numericSizes = ["28", "29", "30", "31", "32", "33", "34", "36", "38", "40", "42", "44", "46"];
  const categories = ['قميص','تي-شيرت ياخه','تي-شيرت حلقه','تي-شيرت رياضي','بجامه','بنطرون','شورت','حذاء','معدات رياضيه', 'اخرئ'];

  const [sizeType, setSizeType] = useState(true); // true for sizes, false for numericSizes
  const [notification, setNotification] = useState(false);
  const [selectedColors, setSelectedColors] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState({});
  const [currentSize, setCurrentSize] = useState({color: null, size: null});
  const [formData, setFormData] = useState({});
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [name, setName] = useState();
  const qrRef = useRef();

  const handleColorChange = (color) => {
    if (selectedColors.includes(color)) {
      setSelectedColors(selectedColors.filter(c => c !== color));
      setSelectedSizes(prevState => {
        delete prevState[color];
        return { ...prevState };
      });
    } else {
      setSelectedColors([...selectedColors, color]);
      setSelectedSizes(prevState => ({ ...prevState, [color]: [] }));
    }
  };

  const handleSizeChange = (color, size) => {
    setCurrentSize({ color, size });
    if (selectedSizes[color]?.includes(size)) {
      setSelectedSizes(prevState => ({
        ...prevState,
        [color]: prevState[color].filter(s => s !== size)
      }));
    } else {
      setSelectedSizes(prevState => ({
        ...prevState,
        [color]: [...(prevState[color] || []), size]
      }));
    }
  };

  const handleQuantityChange = (color, size, quantity) => {
    setSelectedSizes(prevState => ({
      ...prevState,
      [`${color}_${size}_quantity`]: quantity
    }));
  };

  const calculateTotalQuantity = () => {
    let totalQuantity = 0;
    selectedColors.forEach(color => {
      const colorSizes = selectedSizes[color] || [];
      colorSizes.forEach(size => {
        const quantity = selectedSizes[`${color}_${size}_quantity`] || 1;
        totalQuantity += parseInt(quantity, 10);
      });
    });
    return totalQuantity;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormSubmitted(true);

    const itemName = document.getElementById('name').value;
    const itemCategory = document.getElementById('category').value;
    const itemDescription = document.getElementById('description').value;
    const totalQuantity = calculateTotalQuantity();
    const itemPrice = document.getElementById('price').value;

    const itemColors = {};
    selectedColors.forEach(color => {
      const quantities = {};
      const colorSizes = selectedSizes[color] || [];
      colorSizes.forEach(size => {
        const quantity = selectedSizes[`${color}_${size}_quantity`] || 1;
        quantities[size] = quantity;
      });
      itemColors[color] = quantities;
    });

    const newFormData = {
      itemName,
      itemCategory,
      itemDescription,
      itemColors,
      totalQuantity,
      itemPrice
    };
    setFormData(newFormData);
    await addDoc(collection(db, 'AddItem'), {
      newFormData
    });
    setName(itemName);
    setNotification(true);
  };

  useEffect(() => {
    if (formSubmitted) {
      const timeoutId = setTimeout(() => {
        setNotification(false);
        setSizeType(true);
        setFormData({});
        setSelectedColors([]);
        setSelectedSizes({});
        document.getElementById('name').value = '';
        document.getElementById('price').value = '';
        document.getElementById('category').selectedIndex = 0;
        document.getElementById('description').value = '';
        setFormSubmitted(false);
      }, 3000);
      return () => clearTimeout(timeoutId);
    }
  }, [formSubmitted]);

  const renderTotalQuantity = () => {
    const totalQuantity = calculateTotalQuantity();
    return (
      <span>اجمالي وحدات العنصر : {totalQuantity}</span>
    );
  };

  const handleDownload = () => {
    const canvas = qrRef.current.querySelector('canvas');
    const pngUrl = canvas
      .toDataURL('image/png')
      .replace('image/png', 'image/octet-stream');
    const downloadLink = document.createElement('a');
    downloadLink.href = pngUrl;
    downloadLink.download = `${name}.png`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  return (
    <div className={styles.container}>
      {notification && (
        <span className={styles.notification}>&#10004; Item added successfully</span>
      )}
      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.addItem}>
          <div className={styles.addItemLeft}>
            <div className={styles.checkboxGroup}>
              <label>Colors:</label>
              {colors.map((item, index) => (
                <div key={index}>
                  <input
                    type="checkbox"
                    id={`color_${item}`}
                    checked={selectedColors.includes(item)}
                    onChange={() => handleColorChange(item)}
                  />
                  <label htmlFor={`color_${item}`}>{item}</label>
                </div>
              ))}
            </div>
            {selectedColors.map((selectedColor, index) => (
              <div key={index} className={styles.checkboxGroup}>
                <label>{selectedColor} :</label>
                {sizeType ?
                  sizes.map((item, index) => (
                    <div key={index}>
                      <input
                        type="checkbox"
                        id={`size_${selectedColor}_${item}`}
                        checked={selectedSizes[selectedColor]?.includes(item) || false}
                        onChange={() => handleSizeChange(selectedColor, item)}
                      />
                      <label htmlFor={`size_${selectedColor}_${item}`}>{item}</label>
                      {currentSize.color === selectedColor && currentSize.size === item && (
                        <input
                          type="number"
                          min="1"
                          defaultValue="1"
                          onChange={(e) => handleQuantityChange(selectedColor, item, e.target.value)}
                        />
                      )}
                    </div>
                  ))
                  :
                  numericSizes.map((item, index) => (
                    <div key={index}>
                      <input
                        type="checkbox"
                        id={`size_${selectedColor}_${item}`}
                        checked={selectedSizes[selectedColor]?.includes(item) || false}
                        onChange={() => handleSizeChange(selectedColor, item)}
                      />
                      <label htmlFor={`size_${selectedColor}_${item}`}>{item}</label>
                      {currentSize.color === selectedColor && currentSize.size === item && (
                        <input
                          type="number"
                          min="1"
                          defaultValue="1"
                          onChange={(e) => handleQuantityChange(selectedColor, item, e.target.value)}
                        />
                      )}
                    </div>
                  ))
                }
              </div>
            ))}
          </div>
          <div className={styles.addItemRight}>
            <div className={styles.inputGroup}>
              <label htmlFor='name'>Item Name</label>
              <input id='name' type='text' placeholder='اسم المنتج' required />
            </div>
            <div className={styles.inputGroup}>
              <label htmlFor='category'>Category</label>
              <select id='category'>
                {categories.map((item, index) => (
                  <option key={index} value={item}>{item}</option>
                ))}
              </select>
            </div>
            <div className={styles.inputGroup}>
              <label htmlFor='price'>Price</label>
              <input type='number' id='price' placeholder='سعر المنتج' min="0" step="1000" />
            </div>
            <div className={styles.inputGroup}>
              <label htmlFor='description'>Description</label>
              <textarea rows={5} placeholder='وصف المنتج' id='description' />
            </div>
            <div className={styles.barcode}>
              {name &&
              <div className={styles.code} ref={qrRef}>
                <QRCode value={name} onClick={handleDownload} />
              </div>}
            </div>
            {renderTotalQuantity()}
          </div>
        </div>
        <div className={styles.changeSizes} onClick={() => setSizeType(!sizeType)}> تغيير القياسات</div>
        <button className={styles.button}>اضافه العنصر </button>
      </form>
    </div>
  );
};

export default Page;
