import type { SVGProps } from "react";

function Icon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 48 24"
      fill="currentColor"
      aria-hidden="true"
      width="48"
      height="24"
      {...props}
    />
  );
}

export function PistolIcon() {
  return (
    <Icon>
      <path d="M8 5h30v6H24l-3 10h-8l3-10H8z" />
      <path d="M24 11v3a2 2 0 0 1-2 2h-1" fill="none" stroke="currentColor" strokeWidth="1.5" />
    </Icon>
  );
}

export function RifleIcon() {
  return (
    <Icon>
      <path d="M2 10l8-2h14V6h6v2h16v3H30v2h-4l-2 7h-5l2-7h-9l-8 4H2z" />
    </Icon>
  );
}

export function ShotgunIcon() {
  return (
    <Icon>
      <path d="M2 11l9-3h35v3H24v1h-6l-6 4H2z" />
      <rect x="26" y="12" width="10" height="3" rx="1" />
    </Icon>
  );
}

export function SniperIcon() {
  return (
    <Icon>
      <path d="M2 13l8-2h38v2H28v2h-4l-2 6h-4l2-6h-8l-8 4H2z" />
      <rect x="15" y="5" width="13" height="3" rx="1.5" />
      <path d="M18 8v3M25 8v3" stroke="currentColor" strokeWidth="1.5" />
    </Icon>
  );
}

export function KnifeIcon() {
  return (
    <Icon>
      <rect x="4" y="10" width="14" height="5" rx="2" />
      <rect x="18" y="7" width="2.5" height="11" rx="1" />
      <path d="M20.5 10H37l9 2.5-6 3.5H20.5z" />
    </Icon>
  );
}

export function GrenadeIcon() {
  return (
    <Icon>
      <circle cx="24" cy="15" r="7" />
      <rect x="21" y="5" width="6" height="4" rx="1" />
      <path d="M27 6l6-2.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="18.5" cy="6" r="2.2" fill="none" stroke="currentColor" strokeWidth="1.5" />
    </Icon>
  );
}

export function SmokeIcon() {
  return (
    <Icon>
      <rect x="18" y="2" width="12" height="3" rx="1" />
      <path
        fillRule="evenodd"
        d="M17 7a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H19a2 2 0 0 1-2-2zm2 4h10v1.5H19zm0 4h10v1.5H19z"
      />
    </Icon>
  );
}

export function MedkitIcon() {
  return (
    <Icon>
      <path d="M19 6V4h10v2" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path
        fillRule="evenodd"
        d="M12 8a2 2 0 0 1 2-2h20a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H14a2 2 0 0 1-2-2zm10 1v4h-4v2h4v4h4v-4h4v-2h-4V9z"
      />
    </Icon>
  );
}
