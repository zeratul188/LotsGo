import * as React from "react";

type SvgProps = React.SVGProps<SVGSVGElement>;

export default function PersonIcon(props: SvgProps) {
  return (
    <svg
      id="_레이어_1"
      data-name="레이어_1"
      xmlns="http://www.w3.org/2000/svg"
      version="1.1"
      viewBox="0 0 300 500"
      {...props}
    >
      <circle cx="149.79" cy="66.97" r="59.25" />
      <rect
        x="39.54"
        y="126.21"
        width="220.49"
        height="206.94"
        rx="38.21"
        ry="38.21"
      />
      <rect
        x="88.33"
        y="255.29"
        width="122.92"
        height="237.67"
        rx="21.38"
        ry="21.38"
      />
    </svg>
  );
}
