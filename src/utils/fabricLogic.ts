
// Fabric types with properties
export interface FabricProperties {
  name: string;
  breathability: number; // 1-10 scale
  warmth: number; // 1-10 scale
  stretchiness: number; // 1-10 scale
  durability: number; // 1-10 scale
  formalness: number; // 1-10 scale
  seasonalAppropriate: string[]; // ['winter', 'spring', 'summer', 'fall']
  bestFor: string[]; // ['casual', 'formal', 'sport', etc]
}

// Fabric database
export const fabricTypes: Record<string, FabricProperties> = {
  cotton: {
    name: "Cotton",
    breathability: 8,
    warmth: 5, 
    stretchiness: 3,
    durability: 7,
    formalness: 5,
    seasonalAppropriate: ["spring", "summer", "fall"],
    bestFor: ["casual", "everyday", "work"]
  },
  linen: {
    name: "Linen",
    breathability: 10,
    warmth: 3,
    stretchiness: 2,
    durability: 6,
    formalness: 7,
    seasonalAppropriate: ["spring", "summer"],
    bestFor: ["casual", "beach", "hot weather"]
  },
  wool: {
    name: "Wool",
    breathability: 6,
    warmth: 9,
    stretchiness: 4,
    durability: 8,
    formalness: 8,
    seasonalAppropriate: ["fall", "winter"],
    bestFor: ["formal", "cold weather", "outerwear"]
  },
  silk: {
    name: "Silk",
    breathability: 7,
    warmth: 4,
    stretchiness: 2,
    durability: 4,
    formalness: 10,
    seasonalAppropriate: ["spring", "summer", "fall"],
    bestFor: ["formal", "elegant", "special occasions"]
  },
  polyester: {
    name: "Polyester",
    breathability: 3,
    warmth: 6,
    stretchiness: 5,
    durability: 9,
    formalness: 5,
    seasonalAppropriate: ["winter", "fall"],
    bestFor: ["activewear", "outdoor", "durable"]
  },
  denim: {
    name: "Denim",
    breathability: 4,
    warmth: 6,
    stretchiness: 3,
    durability: 10,
    formalness: 3,
    seasonalAppropriate: ["spring", "fall", "winter"],
    bestFor: ["casual", "everyday", "durable"]
  },
  leather: {
    name: "Leather",
    breathability: 2,
    warmth: 8,
    stretchiness: 2,
    durability: 9,
    formalness: 7,
    seasonalAppropriate: ["fall", "winter"],
    bestFor: ["outerwear", "shoes", "accessories"]
  },
  cashmere: {
    name: "Cashmere",
    breathability: 7,
    warmth: 9,
    stretchiness: 3,
    durability: 6,
    formalness: 9,
    seasonalAppropriate: ["fall", "winter"],
    bestFor: ["luxury", "cold weather", "formal"]
  },
  spandex: {
    name: "Spandex",
    breathability: 5,
    warmth: 4,
    stretchiness: 10,
    durability: 7,
    formalness: 2,
    seasonalAppropriate: ["all"],
    bestFor: ["activewear", "workout", "stretch"]
  },
  nylon: {
    name: "Nylon",
    breathability: 4,
    warmth: 5,
    stretchiness: 6,
    durability: 8,
    formalness: 4,
    seasonalAppropriate: ["all"],
    bestFor: ["activewear", "outerwear", "swimwear"]
  },
};

export interface WeatherCondition {
  temperature: number; // in celsius
  humidity: number; // percentage
  precipitation: number; // percentage chance
  windSpeed: number; // km/h
}

// Get fabric recommendations based on weather
export const getFabricRecommendations = (
  weather: WeatherCondition,
  occasion: string = "casual"
): string[] => {
  // For hot weather (> 25°C)
  if (weather.temperature > 25) {
    if (weather.humidity > 70) {
      // Hot and humid
      return ["linen", "cotton", "rayon"];
    } else {
      // Hot and dry
      return ["cotton", "linen", "silk"];
    }
  }
  
  // For cold weather (< 10°C)
  if (weather.temperature < 10) {
    if (weather.windSpeed > 20) {
      // Cold and windy
      return ["wool", "leather", "nylon", "polyester"];
    } else {
      // Cold but not windy
      return ["wool", "cashmere", "cotton"];
    }
  }
  
  // For mild weather
  if (occasion === "formal") {
    return ["wool", "silk", "cashmere"];
  } else if (occasion === "sport" || occasion === "workout") {
    return ["spandex", "nylon", "polyester"];
  } else {
    // Casual
    return ["cotton", "denim", "polyester"];
  }
};

// Get fabric suitability score for a specific weather condition
export const getFabricWeatherSuitability = (
  fabricType: string,
  weather: WeatherCondition
): number => {
  const fabric = fabricTypes[fabricType.toLowerCase()];
  if (!fabric) return 50; // Default middle score for unknown fabrics
  
  let score = 50;
  
  // Temperature logic
  if (weather.temperature > 25) {
    // Hot weather - breathability is important
    score += fabric.breathability * 3;
    score -= fabric.warmth * 2;
  } else if (weather.temperature < 10) {
    // Cold weather - warmth is important
    score += fabric.warmth * 3;
    score -= (10 - fabric.warmth) * 2;
  } else {
    // Moderate weather
    score += fabric.breathability * 1.5;
    score += fabric.warmth * 1.5;
  }
  
  // Humidity logic
  if (weather.humidity > 70) {
    // High humidity - breathability is critical
    score += fabric.breathability * 2;
  }
  
  // Wind logic
  if (weather.windSpeed > 20) {
    // Windy conditions - materials that block wind are better
    score -= fabric.breathability;
    score += (10 - fabric.breathability);
  }
  
  // Precipitation logic
  if (weather.precipitation > 50) {
    // Rainy conditions - water-resistant fabrics are better
    if (fabricType === "nylon" || fabricType === "polyester" || fabricType === "leather") {
      score += 20;
    } else {
      score -= 10;
    }
  }
  
  // Normalize score between 0-100
  return Math.max(0, Math.min(100, score));
};
