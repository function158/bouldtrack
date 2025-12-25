export default function Input({ className = "", ...props }) {
    return (
      <input
        {...props}
        className="bg-red-600 text-white h-12 w-full"
      />
    )
  }
  