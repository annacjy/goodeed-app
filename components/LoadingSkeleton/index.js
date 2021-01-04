import styles from './styles.module.scss';

const LoadingSkeleton = ({ type, noPad }) => {
  return (
    <div className={styles.loading} style={{ padding: !noPad && '30px 50px' }}>
      {type === 'posts' && (
        <div className={styles.loading__posts}>
          {[...Array(5).keys()].map(n => (
            <div key={n} className={styles.loading__block}></div>
          ))}
        </div>
      )}

      {type === 'profile' && (
        <div className={styles.loading__profile}>
          {[...Array(3).keys()].map(n => (
            <div key={n} className={styles.loading__block}></div>
          ))}
        </div>
      )}

      {type === 'chat' && (
        <div className={styles.loading__chat}>
          {[...Array(2).keys()].map(n => (
            <div key={n} className={styles.loading__block}></div>
          ))}
        </div>
      )}

      {type === 'messages' && (
        <div className={styles.loading__messages}>
          {[...Array(7).keys()].map(n => (
            <div key={n} className={styles.loading__block}></div>
          ))}
        </div>
      )}

      {type === 'comment' && (
        <div className={styles.loading__comment}>
          {[...Array(4).keys()].map(n => (
            <div key={n} className={styles.loading__block}></div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LoadingSkeleton;
