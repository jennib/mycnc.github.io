import React from 'react';

interface SwitchProps {
  isOn: boolean;
  handleToggle: () => void;
  id?: string;
}

const Switch: React.FC<SwitchProps> = ({ isOn, handleToggle, id }) => {
  return (
    <>
      <input
        checked={isOn}
        onChange={handleToggle}
        className="react-switch-checkbox"
        id={id || `react-switch-new`}
        type="checkbox"
      />
      <label
        style={{ background: isOn ? '#06D6A0' : '#ccc' }}
        className="react-switch-label"
        htmlFor={id || `react-switch-new`}
      >
        <span className={`react-switch-button`} />
      </label>
    </>
  );
};

export default Switch;
