import styles from './styles.module.scss';

const Spinner = ({ color }) => {
  return (
    <div className={`${styles.spinner} ${styles[`spinner--${color}`]}`}>
      {[...Array(4).keys()].map(n => (
        <div key={n}></div>
      ))}
    </div>
  );
};

export default Spinner;
