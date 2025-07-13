import type { SVGProps } from 'react';

export function FeedIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M5 22V9.5C5 7.015 7.015 5 9.5 5h5C16.985 5 19 7.015 19 9.5V22" />
      <path d="M9 5V3c0-1.105.895-2 2-2h2c1.105 0 2 .895 2 2v2" />
      <path d="M19 15H5" />
      <path d="M10 11l-1.5 6" />
      <path d="M14 11l1.5 6" />
    </svg>
  );
}
