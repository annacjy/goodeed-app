import styles from './styles.module.scss';
import { useState } from 'react';
import { convertBlobToBase64 } from 'utils/functions';

const Avatar = ({ src, alt, size, isModifiable, onFileConversion }) => {
  const [previewFile, setPreviewFile] = useState('');

  const handleFileUpload = e => {
    const fileObject = e.target.files[0];

    // set a preview of image
    const blobUrl = URL.createObjectURL(fileObject);
    setPreviewFile(blobUrl);

    // TODO: limit the size?
    // const base64String = convertBlobToBase64(fileObject);
    const blob = new Blob([fileObject], { type: fileObject.type });
    let reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onloadend = function() {
      let base64String = reader.result;
      onFileConversion(base64String);
    };
  };

  return (
    <>
      <div className={`${styles.avatar} ${styles[`avatar--${size}`]}`}>
        {isModifiable && (
          <label htmlFor="avatar" className={styles.avatar__upload}>
            <input
              type="file"
              id="avatar"
              name="avatar"
              accept="image/*"
              className={styles.avatar__upload}
              onChange={handleFileUpload}
            />
            <img src="/add.svg" alt="upload" />
          </label>
        )}
        {previewFile ? (
          <img src={previewFile} className={styles.avatar__image} />
        ) : src ? (
          <img src={src} alt={alt} className={styles.avatar__image} />
        ) : (
          <img src="/user.svg" alt={alt} />
        )}
      </div>
    </>
  );
};

export default Avatar;
