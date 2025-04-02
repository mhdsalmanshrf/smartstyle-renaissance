
import { Sun } from "lucide-react";

const WeatherBadge = () => {
  return (
    <div className="flex items-center gap-2 mb-4 text-gray-600">
      <div className="bg-blue-100 text-blue-600 rounded-full p-1.5">
        <Sun size={16} />
      </div>
      <span className="text-sm">72°F - Sunny - Perfect for this look</span>
    </div>
  );
};

export default WeatherBadge;
