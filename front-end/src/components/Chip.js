import React from 'react';

export default function Chip({ value, selectedValue,handleSelectedValue }) {
  return (
    <div
      onClick={() => handleSelectedValue(value)}
      className={
        selectedValue === value
          ? "text-white p-2 rounded-full mx-1 text-sm bg-yellow-500 border-2 border-blue-400 cursor-pointer"
          : "text-black border-2  cursor-pointer border-blue-400 p-2 rounded-full mx-1 text-sm bg-white"
      }
    >
      {value}
    </div>
  );
}
