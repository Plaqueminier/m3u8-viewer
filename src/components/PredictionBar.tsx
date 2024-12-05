interface PredictionBarProps {
  prediction: string;
}

const PredictionBar: React.FC<PredictionBarProps> = ({ prediction }) => {
  return (
    <div className="flex w-full h-1 mt-1">
      {prediction.split("").map((value, index) => (
        <div
          key={index}
          className={`flex-1 ${value === "1" ? "bg-green-500" : "bg-red-500"}`}
        />
      ))}
    </div>
  );
};

export default PredictionBar;
