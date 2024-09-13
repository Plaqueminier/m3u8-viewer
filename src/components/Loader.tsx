import React from "react";
import type {} from "ldrs";

interface LoaderProps {
  size?: string;
  bgOpacity?: string;
  speed?: string;
  color?: string;
}

const Loader: React.FC<LoaderProps> = ({
  size = "50",
  bgOpacity = "0.15",
  speed = "1.75",
  color = "rgb(184, 0, 0)",
}) => {
  return (
    <div className="flex justify-center items-center h-full w-full">
      <l-hourglass
        size={size}
        bg-opacity={bgOpacity}
        speed={speed}
        color={color}
      />
    </div>
  );
};

export default Loader;
