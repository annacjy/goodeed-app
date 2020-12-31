import styles from './styles.module.scss';

const Avatar = ({ src, alt, size, isModifiable }) => {
  return (
    <div className={`${styles.avatar} ${styles[`avatar--${size}`]}`}>
      {isModifiable && (
        <input type="file" id="avatar" name="avatar" accept="image/png, image/jpeg" className={styles.avatar__upload} />
      )}
      <img src={src || '/user.svg'} alt={alt} />
    </div>
  );
};

export default Avatar;
