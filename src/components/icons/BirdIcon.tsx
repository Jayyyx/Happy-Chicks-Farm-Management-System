import type { SVGProps } from 'react';

export function BirdIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M18.55 10.26A4.29 4.29 0 0 0 17 4H8.5C6 4 4 6.48 4 9.5a6.5 6.5 0 0 0 4.5 6.2V21h3v-4h1v4h3v-5.25a6.54 6.54 0 0 0 2.55-1.5Z" />
      <path d="M6 15N5 21" />
      <path d="M19 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
      <path d="M14 11V8" />
    </svg>
  );
}
