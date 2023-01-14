import React from 'react';

export default function Chip({ value, selectedValue,handleSelectedValue }) {
  return (
    <div
      onClick={() => handleSelectedValue(value)}
      className={
        selectedValue === value
          ? "text-white p-2 rounded-full mx-1 text-sm bg-blue-900 border-2 border-blue-900 cursor-pointer"
          : "text-black border-2  cursor-pointer border-blue-900 p-2 rounded-full mx-1 text-sm bg-white"
      }
    >
      {value}
    </div>
  );
}
