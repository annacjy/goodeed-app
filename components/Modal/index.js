import { useRef, useState, useEffect } from 'react';
import useOutsideClick from 'hooks/useOutsideClick';
import Button from 'components/Button';
import styles from './styles.module.scss';

const Modal = ({ header, isModalVisible, onModalClose, hasSaveButton, onSave, children }) => {
  const [isVisible, setIsVisible] = useState(true);
  const ref = useRef();

  useOutsideClick(ref, () => {
    close();
  });

  const close = () => {
    setIsVisible(false);
    onModalClose(false);
  };

  useEffect(() => {
    setIsVisible(isModalVisible);
  }, [isModalVisible]);

  return (
    isVisible && (
      <div className={styles.modal}>
        <div ref={ref} className={styles.modal__content}>
          <div>
            <img src="/close.svg" alt="close" onClick={close} />
            <h2>{header}</h2>
            {hasSaveButton && <Button name="Save" onButtonClick={onSave} />}
          </div>
          {children}
        </div>
      </div>
    )
  );
};
export default Modal;
