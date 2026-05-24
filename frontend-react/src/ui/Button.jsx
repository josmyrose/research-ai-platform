export default function Button({ className = "", type = "button", ...props }) {
  return (
    <button
      type={type}
      className={`transition disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none ${className}`}
      {...props}
    />
  );
}

