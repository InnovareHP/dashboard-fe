import { Spinner } from "./ui/spinner";

type Props = {
  isLoading: boolean;
};

const Loader = ({ isLoading }: Props) => {
  if (isLoading) {
    return (
      <div className="absolute inset-0 z-50 bg-background/40 backdrop-blur-sm flex items-center justify-center">
        <Spinner />
      </div>
    );
  }
  return <></>;
};

export default Loader;
