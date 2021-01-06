import styles from './styles.module.scss';

const ErrorPage = ({ errorMessage }) => {
  return (
    <div className={styles.errorPage}>
      <img src="/error.svg" alt="error" />
      <h1>There seems to be an error.</h1>
      <p>Error message: {errorMessage}</p>
    </div>
  );
};

export default ErrorPage;
