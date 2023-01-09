import React, { useState } from "react";

const FileInput = ({ onChange,id,label }) => {
  const [file, setFile] = useState(null);
  return (
    <div className="flex justify-center">
      <div className=" w-full">
        <label
          htmlFor={id}
          className="form-control
                block
                w-full
                px-3
                py-1
                text-base
                font-normal
                text-gray-700
                bg-gray-100 bg-clip-padding
                border border-solid border-gray-300
                rounded
                transition
                ease-in-out
                m-0
            focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none"
        >
          {file?.name ?? label}
        </label>
        <input
          className="hidden"
          type="file"
          id={id}
          onChange={(e) => {
            onChange(e.target.files[0]);
            setFile(()=>e.target.files[0]);
            console.log(e.target.files[0].name)
          }}
        />
      </div>
    </div>
  );
};

export default FileInput;
