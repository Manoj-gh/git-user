import { AsyncLoader } from "@contentstack/venus-components";

interface LoadingProps {
  showProgressBar?: boolean;
  progress?: number;
  title?: string;
}
const DefaultLoading = ({ title, showProgressBar, progress }: LoadingProps) => {
  return (
    <div className="flex flex-col place-items-center justify-center">
      {title && (
        <div className="flex mb-1">
          <span className="text-base font-medium text-[#6C5CE7] dark:text-white p-2">
            {title}
          </span>
        </div>
      )}
      {progress || showProgressBar ? (
        <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
          <div
            className="bg-[#6C5CE7] h-2.5 rounded-full"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      ) : (
        <div className="flex place-items-center justify-center w-full h-2">
          <AsyncLoader color="#6C5CE7" />
        </div>
      )}
    </div>
  );
};

export const SimpleLoader = () => {
  return (
    <div className="flex place-items-center justify-center w-full">
      <AsyncLoader color="#6C5CE7" />
    </div>
  );
};

export default DefaultLoading;
