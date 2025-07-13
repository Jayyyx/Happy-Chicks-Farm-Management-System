import type { SVGProps } from 'react';

export function EggIcon(props: SVGProps<SVGSVGElement>) {
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
      <path d="M12 2C8.686 2 6 6.477 6 11c0 4.97 2.539 8.261 6 9.5 3.461-1.239 6-4.53 6-9.5C18 6.477 15.314 2 12 2z" />
    </svg>
  );
}
