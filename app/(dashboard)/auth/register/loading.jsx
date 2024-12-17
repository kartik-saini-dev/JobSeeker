import { PulseLoader } from "react-spinners";

export default function Loading() {
    // Or a custom loading skeleton component
    return (
        <div className="w-full min-h-screen flex justify-center items-center">
          <PulseLoader
            color={"#000000"}
            size={30}
            data-testid="loader"
          />
        </div>
      );
  }