const Input = ({ name, value, type, onInputChange }) => {
  return <input name={name} value={value} type={type} onChange={e => onInputChange(e.target.value)}></input>;
};

export default Input;
