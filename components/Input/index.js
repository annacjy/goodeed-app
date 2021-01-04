import styles from './styles.module.scss';

const Input = ({ name, value, type, placeholder, onInputChange, onEnter, showLabel }) => {
  return (
    <div className={`${styles.input} ${showLabel && styles['input--withLabel']}`}>
      {showLabel && <label>{name}</label>}
      <input
        name={name}
        value={value}
        placeholder={placeholder}
        type={type}
        autoComplete="off"
        className={`${styles[`input--${!showLabel && 'noLabel'}`]}`}
        onChange={e => onInputChange(e.target.value)}
        onKeyDown={e => {
          if (e.keyCode == 13 && onEnter) {
            onEnter(e.target.value);
          }
        }}
      ></input>
    </div>
  );
};

export default Input;
