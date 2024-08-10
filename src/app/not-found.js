import React from 'react'
import styles from './page.module.css'

const notFound = () => {
  return (
    <div className={styles.notFound}>
        <div className={styles.container}>
            <div>
                <p>404 |</p>
            </div>
            <div>
                <p>لايوجد صفحه بهذه الاسم؟؟</p>
                <p> تحقق من اسم الرابط ,او قم باستخدام صفحات التوجيه </p>
            </div>
        </div>
    </div>
  )
}

export default notFound