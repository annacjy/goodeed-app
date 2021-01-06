import styles from './styles.module.scss';

const ErrorMessage = ({ message }) => {
  return (
    <div className={styles.errorMessage}>
      <img src="/exclamation.svg" alt="Error" width="20" />
      {message}
    </div>
  );
};

export default ErrorMessage;
