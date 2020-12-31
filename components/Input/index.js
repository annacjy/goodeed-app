const Input = ({ name, value, type, onInputChange, onEnter, showLabel }) => {
  return (
    <>
      {showLabel && <label>{name}</label>}
      <input
        name={name}
        value={value}
        type={type}
        onChange={e => onInputChange(e.target.value)}
        onKeyDown={e => {
          if (e.keyCode == 13) {
            onEnter(e.target.value);
          }
        }}
      ></input>
    </>
  );
};

export default Input;
