"use client";
import React, { useState } from 'react'
import TopSec from './topSec/page'
import MiddleSec from './middleSec/page'
import BottomSec from './bottomSec/page'
import styles from './sellItem.module.css'

const page = () => {

  const [transtion , setTranstion] = useState('')
  const [totalPrice , setTotelPrice] = useState('')
  const [totalQuntety , setTotelQuntety] = useState('')
  const [time , setTime] = useState('')
  const [transtionNumber , setTranstionNumber] = useState('')
  const [transtionType , setTranstionType] = useState('')
  const [search , setSearch] = useState('')

  return (
    <div className={styles.sellItem}>
       <TopSec
        transtion={transtion}
        setTime={setTime}
        setTranstionNumber={setTranstionNumber}
        setTranstionType={setTranstionType}
        setSearch={setSearch}
      />
      <MiddleSec
        setTranstion={setTranstion}
        setTotelPrice={setTotelPrice}
        setTotelQuntety={setTotelQuntety}
        search={search}
        time={time}
      />
      
      <BottomSec 
      transtion={transtion}
      totalPrice={totalPrice} 
      totalQuntety={totalQuntety}
      time={time}
      transtionNumber={transtionNumber}
      transtionType={transtionType}
      />
    </div>
  )
}

export default page