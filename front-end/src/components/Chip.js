import React from 'react';

export default function Chip({ value, selectedValue,handleSelectedValue }) {
  return (
    <div
      onClick={() => handleSelectedValue(value)}
      className={
        selectedValue === value
          ? `bg-black text-white p-2 rounded-full mx-1 text-sm`
          : `bg-white text-black border-2  cursor-pointer border-black p-2 rounded-full mx-1 text-sm`
      }
    >
      {value}
    </div>
  );
}
