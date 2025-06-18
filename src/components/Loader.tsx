
interface LoaderProps {
  message?: string;
}

export const Loader = ({ message = "Loading..." }: LoaderProps) => {
  return (
    <div className="flex flex-col items-center justify-center gap-6 p-8" role="status" aria-live="polite">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-blue-200 rounded-full animate-spin border-t-blue-600" aria-hidden="true"></div>
        <div className="absolute inset-0 w-16 h-16 border-4 border-transparent rounded-full animate-ping border-t-blue-400" aria-hidden="true"></div>
      </div>
      <div className="text-center">
        <p className="text-blue-700 font-semibold text-lg mb-2">{message}</p>
        <div className="flex items-center justify-center gap-1" aria-hidden="true">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-75"></div>
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-150"></div>
        </div>
      </div>
      <span className="sr-only">{message}</span>
    </div>
  );
};
