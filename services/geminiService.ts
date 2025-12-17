
import { GoogleGenAI } from "@google/genai";
import { RouteInfo } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getRouteData = async (origin: string, destination: string, intermediate?: string): Promise<RouteInfo> => {
  try {
    const routeDescription = intermediate 
      ? `desde "${origin}" pasando por "${intermediate}" hasta "${destination}"`
      : `desde "${origin}" hasta "${destination}"`;

    const prompt = `
      Calcula la ruta de conducción completa ${routeDescription}.
      
      IMPORTANTE: Tu respuesta debe incluir el siguiente bloque exacto al final, donde X es el número total de kilómetros de todo el recorrido:
      
      [[DISTANCIA_KM:X]]
      
      Reglas para X:
      - Solo números y punto decimal.
      - NO uses comas para miles (ejemplo incorrecto: 1,200).
      - Ejemplo correcto: 1250.5
      
      Además, proporciona antes un breve resumen de la ruta mencionando los puntos clave.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleMaps: {} }],
      },
    });

    const text = response.text || "";
    console.log("Respuesta Gemini:", text);
    
    // Extract map grounding info
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    let mapUrl = undefined;
    let sourceTitle = undefined;

    if (groundingChunks) {
      const mapChunk = groundingChunks.find((c: any) => c.maps?.uri);
      if (mapChunk && mapChunk.maps) {
        mapUrl = mapChunk.maps.uri;
        sourceTitle = mapChunk.maps.title;
      }
    }

    // Parsing Strategy
    let distanceKm = 0;
    
    // 1. Strict Tag Match from Prompt Instruction
    const tagRegex = /\[\[DISTANCIA_KM:([\d\.]+)\]\]/i;
    const tagMatch = text.match(tagRegex);

    if (tagMatch && tagMatch[1]) {
         distanceKm = parseFloat(tagMatch[1]);
    } else {
        // 2. Fallback Heuristic
        console.warn("Tag distance format not found, using fallback search.");
        const kmRegex = /([\d,.]+)\s*(?:km|kilómetros|kilometros)/gi;
        const matches = [...text.matchAll(kmRegex)];
        
        for (const match of matches) {
            let rawNum = match[1];
            let cleanNum = rawNum.replace(/,/g, '');
            let val = parseFloat(cleanNum);

            if (!isNaN(val)) {
                if (val > distanceKm && val < 10000) {
                    distanceKm = val;
                }
            }
        }
    }

    // Extract duration
    const durationMatch = text.match(/(\d+\s*(?:horas?|h)\s*(?:\d+\s*(?:minutos?|min))?)|(\d+\s*(?:minutos?|min))/i);
    const duration = durationMatch ? durationMatch[0] : "Tiempo no disponible";

    return {
      distanceKm,
      duration,
      summary: text,
      mapUrl,
      sourceTitle
    };

  } catch (error) {
    console.error("Error fetching route data:", error);
    throw new Error("No se pudo calcular la ruta. Verifique su conexión o intente nuevamente.");
  }
};
