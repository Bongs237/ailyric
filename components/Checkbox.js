export default function Checkbox(props) {
  return (
    <div className="mb-3">
      <input 
        type="checkbox"
        role="switch"
        id="autocomplete-check"
        checked={props.checked}
        onChange={props.changeFunc}
      />
      <label className="form-check-label pl-1" htmlFor="autocomplete-check">Autocomplete</label>
    </div>
  );
}
