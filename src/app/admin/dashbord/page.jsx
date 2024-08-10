"use client";
import React, { useEffect, useState } from 'react';
import { AreaChart, Area, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import styles from './dashbord.module.css';
import { FaMoneyBillTrendUp, FaMoneyBillTransfer, FaMoneyCheckDollar } from "react-icons/fa6";
import { BsFillArchiveFill } from 'react-icons/bs';
import { collection, doc, getDoc, getDocs } from 'firebase/firestore';
import { db } from '@/firebase';

const Dashboard = () => {
    const [panelData, setPanelData] = useState({
        totalQuantity: 0,
        withdrawnAmount: 0,
        netTotal: 0,
        totalDebit: 0
    });

    const [categories, setCategories] = useState({
        'قميص': 0,
        'تي-شيرت ياخه': 0,
        'تي-شيرت حلقه': 0,
        'تي-شيرت رياضي': 0,
        'بجامه': 0,
        'اخرئ': 0,
        'بنطرون': 0,
        'شورت': 0,
        'حذاء': 0,
        'معدات رياضيه': 0
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const colRef = collection(db, "SingelItem");
                const querySnapshot = await getDocs(colRef);
                const newCategories = { ...categories };

                querySnapshot.forEach((doc) => {
                    const data = doc.data();
                    const items = data.items;

                    for (const itemKey in items) {
                        if (items.hasOwnProperty(itemKey)) {
                            const item = items[itemKey];
                            const itemCategory = item.itemCategory;

                            if (itemCategory in newCategories) {
                                newCategories[itemCategory] += 1;
                            } else {
                                newCategories[itemCategory] = 1;
                            }
                        }
                    }
                });

                setCategories(newCategories);

                const adminPanelDocRef = doc(db, 'AdminPanel', 'WmVeBDvuJZvybdwoMMj0');
                const adminPanelDoc = await getDoc(adminPanelDocRef);
                setPanelData(adminPanelDoc.data());

            } catch (error) {
                console.error("Error fetching document: ", error);
            }
        };
        fetchData();
    }, []);

    
    const data1 = [
        { name: 'السبت', نقد: panelData.netTotal, دين: panelData.totalDebit, مسحوبات: panelData.withdrawnAmount },
        { name: 'الاحد', نقد: panelData.netTotal, دين: panelData.totalDebit, مسحوبات: panelData.withdrawnAmount },
        { name: 'الاثنين', نقد: panelData.netTotal, دين: panelData.totalDebit, مسحوبات: panelData.withdrawnAmount },
        { name: 'الثلاثاء', نقد: panelData.netTotal, دين: panelData.totalDebit, مسحوبات: panelData.withdrawnAmount },
        { name: 'الاربعاء', نقد: panelData.netTotal, دين: panelData.totalDebit, مسحوبات: panelData.withdrawnAmount },
        { name: 'الخميس', نقد: panelData.netTotal, دين: panelData.totalDebit, مسحوبات: panelData.withdrawnAmount },
        { name: 'الجمعه', نقد: panelData.netTotal, دين: panelData.totalDebit, مسحوبات: panelData.withdrawnAmount },
    ];
    const data2 = Object.keys(categories).map(category => ({
        Category: category,
        A: categories[category]
    }));
    
    return (
        <div className={styles.dashbord}>
            <div className={styles.mainCards}>
                <div className={styles.card}>
                    <div className={styles.cardInner}>
                        <h3>اجمالي الوحدات</h3>
                        <BsFillArchiveFill className={styles.cardIcon} />
                    </div>
                    <h1>{panelData.totalQuantity || 0 }</h1>
                </div>
                <div className={styles.card}>
                    <div className={styles.cardInner}>
                        <h3>المسحوبات الشخصيه</h3>
                        <FaMoneyBillTransfer className={styles.cardIcon} />
                    </div>
                    <h1>{(panelData.withdrawnAmount || 0).toLocaleString()}</h1>
                </div>
                <div className={styles.card}>
                    <div className={styles.cardInner}>
                        <h3>اجمالي الايراد</h3>
                        <FaMoneyBillTrendUp className={styles.cardIcon} />
                    </div>
                    <h1>{(panelData.netTotal || 0).toLocaleString()}</h1>
                </div>
                <div className={styles.card}>
                    <div className={styles.cardInner}>
                        <h3>اجمالي الدين</h3>
                        <FaMoneyCheckDollar className={styles.cardIcon} />
                    </div>
                    <h1>{ (panelData.totalDebit || 0).toLocaleString()}</h1>
                </div>
            </div>

            <div className={styles.charts}>
                <ResponsiveContainer width="100%" height={400}>
                    <AreaChart data={data1} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name"  tick={{ fill: '#ffffff' }}/>
                        <YAxis  tick={{ fill: '#ffffff' }} />
                        <Tooltip />
                        <Area type="monotone" dataKey="نقد" stackId="1" stroke="#2e7d32" fill="#2e7d32" />
                        <Area type="monotone" dataKey="دين" stackId="1" stroke="#d50000" fill="#d50000" />
                        <Area type="monotone" dataKey="مسحوبات" stackId="1" stroke="#ff6d00" fill="#ff6d00" />
                    </AreaChart>
                </ResponsiveContainer>

                <ResponsiveContainer width="100%" height={400}>
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data2}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="Category" tick={{ fill: '#ffffff' }} />
                        <PolarRadiusAxis />
                        <Radar  dataKey="A" stroke="#2962ff" fill="#2962ff" fillOpacity={0.6} strokeWidth={2} />
                    </RadarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default Dashboard;
