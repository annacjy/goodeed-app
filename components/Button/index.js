import styles from './styles.module.scss';

import Spinner from 'components/Spinner';

const Button = ({ name, theme, disabled, loading, onButtonClick }) => {
  return (
    <button
      type="button"
      disabled={disabled}
      className={`${styles.button} ${styles[`button--${theme}`]}`}
      onClick={onButtonClick}
    >
      {loading && <Spinner color="white" />}
      {name}
    </button>
  );
};

export default Button;
