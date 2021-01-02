import styles from './styles.module.scss';

const Flag = ({ name }) => {
  return (
    <div className={`${styles.flag} ${styles[`flag--${name}`]}`}>
      <img src={`/${name}-marked.svg`} alt={name} />
    </div>
  );
};

export default Flag;
