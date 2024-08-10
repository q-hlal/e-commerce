import styles from './credit.module.css';

export const DeleteConfirmation = ({ onDelete, onCancel }) => {
  return (
    <div className={styles.deleteConfirmation}>
      <p>هل انت متاكد بعمليه حذف العميل؟</p>
      <div>
        <button onClick={onDelete}>نعم</button>
        <button onClick={onCancel}>لا</button>
      </div>
    </div>
  );
};
