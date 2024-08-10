import Image from 'next/image'
import styles from './page.module.css'
import Link from 'next/link';

import { FaLongArrowAltRight , FaSocks } from "react-icons/fa";
import { IoIosFlower } from "react-icons/io";
import { IoShirtSharp } from "react-icons/io5";
import { PiShirtFoldedFill  , PiArrowCircleUpRightFill} from "react-icons/pi";
import { GiWinterHat , GiConverseShoe , GiTrousers} from "react-icons/gi";


export default function Home() {

  const data = [
    {
      title: 'T-shirt',
      img: <IoShirtSharp/>
    },
    {
      title: 'qames',
      img: <PiShirtFoldedFill/>
    },
    {
      title: 'jeans',
      img: <GiTrousers/>
    },
    {
      title: 'shoe',
      img: <GiConverseShoe/>
    },
    {
      title: 'hat',
      img: <GiWinterHat/>
    },
    {
      title: 'else',
      img: <FaSocks/>
    },
  ]


  return (
    <main className={styles.main}>
      <section className={styles.hero}>
        <div className={styles.topSec}>
          <h1>Dive into a w<IoIosFlower/>rld of endless fashion possibilities and more.</h1>
          <p>Explore the latest trends and styles to elevate your fashion game. From chic dresses to trendy accessories, indulge in a world of glamour and sophistication.</p>
        </div>
        <div 
        className={styles.buttomSec}>
          <div className={styles.leftSec}>
            <Image src="/imges/fashion3.jpg" fill />
          </div>
          <div className={styles.middleSec}>
            <div>
              <button><Link href='/sellItem'>get more </Link><FaLongArrowAltRight/></button>
              <button><Link href='/sellItem'>explore</Link> </button>
            </div>
              <Image src="/imges/fashion2.jpg" fill />
          </div>
          <div className={styles.rightSec}>
            <div>
            <span>Get Enjoy </span>
            <span>--</span>
            <span>----</span>
            <span>The</span>
            <span>New Style & Modren Fashion</span>
            </div>
            <Image src="/imges/fashion4.jpg" fill/>
          </div>
        </div>
      </section>
     
      <section className={styles.content}>
        <div className={styles.uberText}>
          <h1>Discover the latest in fashion trends and elevate your wardrobe with our selection.</h1>
          <p> Elevate your style with our curated collection of chic, trend-setting fashion pieces. Explore a fusion of luxury, innovation, and sophistication at your fingertips.</p>
        </div>
        <div className={styles.footerImg}>
          <span><PiArrowCircleUpRightFill/></span>
          <Image src="/imges/fashion5.jpg" fill/>
        </div>
      </section>
    </main>
  )
}

