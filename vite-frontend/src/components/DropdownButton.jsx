import React from "react";

export default function DropdownButton({
  Logo,
  name,
  buttonLink = undefined,
  func = undefined,
  navigate,
}) {
  return (
    <div className="hover:bg-gray-100 transition duration-200 rounded-lg">
      <button
        onClick={() => {
          if (func) {
            func();
          }
          navigate(buttonLink);
        }}
        className="flex flex-row my-1 py-1 px-3 mx-1 place-items-center"
      >
        <div className="mr-2">
          <Logo />
        </div>
        <div>{name}</div>
      </button>
    </div>
  );
};