import * as React from "react";
import { SVGProps, memo } from "react";

const SvgComponent = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width="1em"
    height="1em"
    {...props}
  >
    <path d="m12.59 13-2.3 2.29a1 1 0 0 0 0 1.42 1 1 0 0 0 1.42 0l4-4a1 1 0 0 0 .21-.33 1 1 0 0 0 0-.76 1 1 0 0 0-.21-.33l-4-4a1 1 0 1 0-1.42 1.42l2.3 2.29H3a1 1 0 0 0 0 2ZM12 2a10 10 0 0 0-9 5.55 1 1 0 0 0 1.8.9A8 8 0 1 1 12 20a7.93 7.93 0 0 1-7.16-4.45 1 1 0 0 0-1.8.9A10 10 0 1 0 12 2Z" />
  </svg>
);
const Memo = memo(SvgComponent);
export default Memo;