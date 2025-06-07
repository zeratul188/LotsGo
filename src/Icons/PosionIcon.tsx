import React from "react";

const PotionIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    version="1.1"
    id="레이어_1"
    xmlns="http://www.w3.org/2000/svg"
    x="0px"
    y="0px"
    viewBox="0 0 500 500"
    xmlSpace="preserve"
    fill="none"
    {...props}
  >
    <style>
      {`.st0{fill:none;stroke:#56ce24;stroke-width:30;stroke-miterlimit:10;}
        .st1{fill:none;stroke:#56ce24;stroke-width:30;stroke-linecap:round;stroke-miterlimit:10;}`}
    </style>
    <g>
      <path className="st0" d="M255,468c-81.74,0-148-66.26-148-148c0-58.14,33.53-108.46,82.31-132.66" />
      <path className="st0" d="M255,468c81.74,0,148-66.26,148-148c0-58.14-33.53-108.46-82.31-132.66" />
    </g>
    <path className="st1" d="M159,321c0,0,35.5,60.5,96,0s102.71,0,102.71,0" />
    <polyline className="st1" points="320,187 320,105 190,105 190,187 " />
    <path
      className="st1"
      d="M342.5,105h-176c-14.64,0-26.5-11.86-26.5-26.5v-17c0-14.64,11.86-26.5,26.5-26.5h176
        c14.64,0,26.5,11.86,26.5,26.5v17C369,93.14,357.14,105,342.5,105z"
    />
  </svg>
);

export default PotionIcon;