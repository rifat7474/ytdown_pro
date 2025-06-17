
export const Loader = ({ message = "Loading..." }) => {
  return (
    <div className="flex items-center justify-center gap-3 p-6">
      <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      <span className="text-blue-600 font-medium">{message}</span>
    </div>
  );
};
