export default function Icon({ name, size = 20, ...props }) {
  const paths = {
    arrow: <><path d="M5 12h14M13 6l6 6-6 6" /></>,
    trophy: <><path d="M8 3h8v7a4 4 0 0 1-8 0V3ZM8 5H4v3a4 4 0 0 0 4 4m8-7h4v3a4 4 0 0 1-4 4M12 14v5m-4 2h8" /></>,
    users: <><circle cx="8" cy="8" r="3" /><path d="M2 21v-3a6 6 0 0 1 12 0v3M16 5a3 3 0 0 1 0 6m1 4a5 5 0 0 1 5 5" /></>,
    expand: <path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5" />,
    share: <><path d="M12 16V3m-5 5 5-5 5 5M5 13v8h14v-8" /></>,
    help: <><circle cx="12" cy="12" r="9" /><path d="M9.5 9a2.5 2.5 0 1 1 4.2 1.8c-1.2.7-1.7 1.2-1.7 2.7M12 17h.01" /></>,
    ball: <><circle cx="12" cy="12" r="9" /><path d="m12 7 5 4-2 6H9l-2-6 5-4ZM12 7V3m5 8 4-2m-6 8 2 3m-8-3-2 3m0-9L3 9" /></>,
    close: <path d="m6 6 12 12M6 18 18 6" />,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>{paths[name] || paths.ball}</svg>;
}
