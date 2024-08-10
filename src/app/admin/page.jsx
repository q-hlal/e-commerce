"use client";
import { useState } from 'react';
import styles from './admin.module.css';
import { FcComboChart , FcFlowChart  , FcLineChart } from "react-icons/fc";
import Dashbord from './dashbord/page';
import Withdrow from './withdrow/page';
import SellingInfo from './singleItem/page';

const Page = () => {
  const [activeComponent, setActiveComponent] = useState('dashboard');

  const renderComponent = () => {
    switch (activeComponent) {
      case 'dashboard':
        return <Dashbord />;
      case 'withdrow':
        return <Withdrow />;
      case 'sellingInfo':
        return <SellingInfo />;
      default:
        return <Dashbord />;
    }
  };

  return (
    <div className={styles.adminPanel}>
      <div className={styles.sidebar}>
        <h2>4K Panel</h2>
        <ul>
          <li onClick={() => setActiveComponent('dashboard')}>
          لوحه الادمن <span><FcComboChart /></span>
          </li>
          <li onClick={() => setActiveComponent('withdrow')}>
            الاضافات والمسحوبات  <span><FcLineChart /></span>
          </li>
          <li onClick={() => setActiveComponent('sellingInfo')}>
            تفاصيل الوحدات المباعه<span><FcFlowChart /></span>
          </li>
        </ul>
      </div>
      <div className={styles.admin}>
        {renderComponent()}
      </div>
    </div>
  );
};

export default Page;
