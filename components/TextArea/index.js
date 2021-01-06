import { useRef, useState, useEffect } from 'react';
import styles from './styles.module.scss';

const TextArea = ({ value, placeholder, hasBorder, onContentChange, onEnter }) => {
  const [text, setText] = useState('');
  const [rows, setRows] = useState(0);
  const textArea = useRef(null);

  useEffect(() => {
    if (textArea.current) {
      const textRowCount = textArea.current.value.split('\n').length;
      setRows(textRowCount + 1);
    }
  }, [textArea, text]);

  const handleOnKeyPress = e => {
    if (e.charCode === 13 && onEnter) onEnter();
  };

  return (
    <textarea
      ref={textArea}
      rows={rows}
      className={styles.textArea}
      style={{ border: hasBorder && '1px solid #e9e9e9' }}
      placeholder={placeholder}
      value={value}
      onChange={e => {
        const value = e.target.value;
        setText(value);
        onContentChange(value);
      }}
      onKeyPress={e => handleOnKeyPress(e)}
    />
  );
};

export default TextArea;
