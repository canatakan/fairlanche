import React from "react";

const Radio = ({ name, options, onChange, isInline,title,value}) => {
  return (
    <div className="w-full flex flex-col justify-start items-start">
        <label className="block mx-0 pd-0">{title}</label>
        <div>

      {options.map((option,idx) => (
        <div key={idx} className={`form-check ${isInline ? "form-check-inline" : ""}`}>
          <input
            className="form-check-input appearance-none rounded-full h-4 w-4 border border-gray-300 bg-white checked:bg-blue-600 checked:border-blue-600 focus:outline-none transition duration-200 mt-1 align-top bg-no-repeat bg-center bg-contain float-left mr-2 cursor-pointer"
            type="radio"
            name={name}
            id={option.id}
            value={option.value}
            checked={option.value===value?"checked":""}
            onChange={(e) => onChange(e.target.value)}
          />
          <label
            className="form-check-label inline-block text-gray-800"
            htmlFor={option.id}
          >
            {option.title}
          </label>
        </div>
      ))}
        </div>
    </div>
  );
};

export default Radio;
