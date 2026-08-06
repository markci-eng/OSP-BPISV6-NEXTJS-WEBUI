import type React from "react";

export interface SVGIconProps extends React.SVGProps<SVGSVGElement> {
  size?: string | number;
  color?: string;
}
