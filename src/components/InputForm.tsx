import ConnectCalendar from "./ConnectCalendar";
import DatePicker from "./DatePicker";
import Dropdown from "./Dropdown";

const InputForm: React.FC = () => {
  return (
    <div className="flex flex-col gap-2 border border-black custom-bg p-6 rounded-lg">
      <h2 className="text-white my-4">Generate Calendar Wrapped</h2>
      <ConnectCalendar />
      <Dropdown
        value={undefined}
        onSelect={() => {}}
        options={[]}
        placeholder="Select Calendar"
        disabled={false}
      />
      <div className="flex flex-row gap-2">
        <DatePicker
          className="flex-grow"
          id="start-date"
          label="Start Date"
        />
        <DatePicker
          className="flex-grow"
          id="end-date"
          label="End Date"
        />
      </div>
      <button
        className="bg-white text-primary font-semibold p-2 rounded-lg"
        onClick={() => {}}
      >
        Generate
      </button>
    </div>
  );
};

export default InputForm; 