import { GoogleGenAI, Type } from "@google/genai";
import { Stall, FeaturedCollection } from '../types';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const stallSchema = {
  type: Type.OBJECT,
  properties: {
    name: { type: Type.STRING, description: 'The creative name of the food stall.' },
    description: { type: Type.STRING, description: 'A short, enticing description of the stall and its offerings.' },
    cuisine: { 
      type: Type.STRING, 
      description: 'The primary type of food served.',
      enum: ['South Indian', 'North Indian', 'Chaat', 'Biryani', 'Rolls', 'Indo-Chinese', 'Kebabs & Tikkas', 'Momos', 'Sweets & Desserts', 'Beverages', 'Vada Pav & Pav Bhaji']
    },
    rating: { type: Type.NUMBER, description: 'A rating from 3.0 to 5.0, in 0.1 increments.' },
    status: { type: Type.STRING, description: 'Current operating status.', enum: ['Open', 'Closed'] },
    location: {
      type: Type.OBJECT,
      properties: {
        latitude: { type: Type.NUMBER },
        longitude: { type: Type.NUMBER },
      },
      required: ['latitude', 'longitude']
    },
    menuHighlights: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'A list of 3-4 popular or signature menu items.'
    },
    reviews: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            author: { type: Type.STRING, description: "Reviewer's name" },
            rating: { type: Type.NUMBER, description: "Rating from 1-5" },
            comment: { type: Type.STRING, description: "Review text" },
          },
          required: ['author', 'rating', 'comment'],
        },
        description: 'An empty list to hold user reviews. Should always be an empty array.'
    },
    specialOfTheDay: { type: Type.STRING, description: 'A creative, enticing "special of the day" for the stall.' },
  },
  required: ['name', 'description', 'cuisine', 'rating', 'status', 'location', 'menuHighlights', 'reviews']
};

const generateStallImage = async (stall: Stall): Promise<string> => {
  try {
    const prompt = `A vibrant, appetizing photo of ${stall.cuisine} from a street food stall named '${stall.name}' in Bangalore, India. High quality, food photography style, realistic, delicious looking.`;
    const response = await ai.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt: prompt,
      config: {
        numberOfImages: 1,
        outputMimeType: 'image/jpeg',
        aspectRatio: '4:3',
      },
    });

    if (response.generatedImages && response.generatedImages.length > 0) {
      const base64ImageBytes = response.generatedImages[0].image.imageBytes;
      return `data:image/jpeg;base64,${base64ImageBytes}`;
    }
  } catch (error) {
    console.error(`Failed to generate image for ${stall.name}:`, error);
  }
  return '';
};


export const fetchFoodStalls = async (): Promise<Stall[]> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "Generate a list of 16 diverse, fictional food stalls located in Bangalore, Karnataka, India. Include a variety of cuisines popular in the area such as South Indian, North Indian, Chaat, Indo-Chinese, Kebabs and local favorites like Vada Pav. For each stall, also generate a creative 'special of the day'. For location, generate coordinates within the Bangalore city area (latitude between 12.8 and 13.1, longitude between 77.5 and 77.7). Ensure the data is creative, appealing, and reflects the vibrant street food culture of Bangalore. The 'reviews' field must be an empty array.",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: stallSchema,
        },
      },
    });

    const jsonText = response.text.trim();
    const stalls: Stall[] = JSON.parse(jsonText);

    // Generate images sequentially to avoid rate limiting issues.
    const stallsWithImages: Stall[] = [];
    for (const stall of stalls) {
      const imageUrl = await generateStallImage(stall);
      stallsWithImages.push({ ...stall, imageUrl });
      // Add a 2-second delay between each image generation request to stay within API limits.
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    return stallsWithImages;
  } catch (error) {
    console.error("Error fetching food stalls from Gemini API:", error);
    throw new Error("Failed to generate food stall data.");
  }
};


const collectionSchema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: "A catchy title for the collection." },
    description: { type: Type.STRING, description: "A short, appealing description (1-2 sentences) of the collection theme." },
    stallNames: {
      type: Type.ARRAY,
      description: "A list of 3-5 stall names from the provided list that fit the theme.",
      items: { type: Type.STRING }
    }
  },
  required: ['title', 'description', 'stallNames']
};

export const fetchFeaturedCollections = async (stalls: Stall[]): Promise<FeaturedCollection[]> => {
  const stallNames = stalls.map(s => s.name).join(', ');
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Based on this list of food stalls: ${stallNames}. Generate 3 creative, themed collections. For example: "Spicy Delights", "Late Night Cravings", or "Best South Indian Bites". Each collection must have a catchy title, a short, appealing description (1-2 sentences), and include between 3 to 5 stall names from the provided list that fit the theme. Ensure the stall names you use are spelled exactly as in the list.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: collectionSchema
        }
      }
    });
    const jsonText = response.text.trim();
    const collections = JSON.parse(jsonText) as FeaturedCollection[];
    return collections;
  } catch (error) {
    console.error("Error fetching featured collections from Gemini API:", error);
    return [];
  }
};