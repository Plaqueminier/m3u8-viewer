interface PredictionBarProps {
  prediction: string;
}

const PredictionBar: React.FC<PredictionBarProps> = ({ prediction }) => {
  const goodPercentage = Math.round(
    (prediction.split("").filter((v) => v === "1").length / prediction.length) *
      100
  );

  return (
    <div className="flex flex-col w-full">
      <div className="flex justify-between text-xs text-gray-500 mb-1">
        <span>Prediction quality</span>
        <span>{goodPercentage}% good</span>
      </div>
      <div className="flex w-full h-1">
        {prediction.split("").map((value, index) => (
          <div
            key={index}
            className={`flex-1 ${value === "1" ? "bg-green-500" : "bg-red-500"}`}
          />
        ))}
      </div>
    </div>
  );
};

export default PredictionBar;
