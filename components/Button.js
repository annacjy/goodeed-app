const Button = ({ name, disabled, onButtonClick }) => {
  return (
    <button type="button" disabled={disabled} onClick={onButtonClick}>
      {name}
    </button>
  );
};

export default Button;
