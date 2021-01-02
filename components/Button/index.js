import styles from './styles.module.scss';

const Button = ({ name, theme, disabled, onButtonClick }) => {
  return (
    <button
      type="button"
      disabled={disabled}
      className={`${styles.button} ${styles[`button--${theme}`]}`}
      onClick={onButtonClick}
    >
      {name}
    </button>
  );
};

export default Button;
