import React from "react";

const Input = ({ id, title, placeholder, onChange,value }) => {
  return (
    <div className="flex flex-col items-start">
      <label
        htmlFor={id}
        className="form-label inline-block  text-gray-700"
      >
        {title}
      </label>
      <input
        type="text"
        className="
        form-control
        block
        w-full
        px-3
        py-1
        text-base
        font-normal
        text-gray-700
        bg-white bg-clip-padding
        border border-solid border-gray-300
        rounded
        transition
        ease-in-out
        m-0
        focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none
      "
        onChange={(e) => onChange(e.target.value)}
        
        id={id}
        placeholder={placeholder}
        value={value}
      />
    </div>
  );
};

export default Input;
