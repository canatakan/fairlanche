import React from 'react';

export default function Chip({ value, selectedValue,handleSelectedValue }) {
  return (
    <div
      onClick={() => handleSelectedValue(value)}
      className={
        selectedValue === value
          ? "text-white p-2 rounded-full mx-1 text-sm bg-yellow-500 border-2 border-gray-500 cursor-pointer"
          : "text-black border-2  cursor-pointer border-gray-500 p-2 rounded-full mx-1 text-sm bg-white"
      }
    >
      {value}
    </div>
  );
}
