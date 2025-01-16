const TextInput = ({ value, onChange, onBlur, placeholder, backgroundColor }) => {
  return (
    <input
      className="border border-gray-300 p-3 my-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-lightgray"
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onBlur={onBlur}
      placeholder={placeholder}
      style={{ backgroundColor }}
    />
  );
};

export default TextInput;