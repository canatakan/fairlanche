import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronUp,
  faChevronDown,
} from "@fortawesome/fontawesome-free-solid";

const Collapsible = ({ open, children, title, item }) => {
  const [isOpen, setIsOpen] = useState(open);

  const handleFilterOpening = () => {
    setIsOpen((prev) => !prev);
  };

  return (
    <>
      <div className="card">
        <div className="p-2 flex flex-row justify-between text-left w-wrap rounded-xl">
          <h6 className="font-weight-bold p-2">{title}</h6>
          <div className="flex">
          {item}
          <div className="btn p-2 hover:bg-gray-200 rounded font-weight-bold text-center"
            onClick={handleFilterOpening}>
            {!isOpen ? (
              <FontAwesomeIcon icon={faChevronDown} />
            ) : (
              <FontAwesomeIcon icon={faChevronUp} />
            )}
          </div>
          </div>
        </div>
      </div>
      <div className="border-bottom">
        <div>{isOpen && <div className="">{children}</div>}</div>
      </div>
    </>
  );
};

export default Collapsible;