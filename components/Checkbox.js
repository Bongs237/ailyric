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
      <label className="form-check-label" htmlFor="autocomplete-check">Autocomplete</label>
    </div>
  );
}
