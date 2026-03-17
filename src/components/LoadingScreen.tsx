import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { AppData } from '../App';
import { GoogleGenAI } from '@google/genai';

interface Props {
  appData: AppData;
  onComplete: (generatedImage: string) => void;
  onError: () => void;
}

const MESSAGES = [
  'Conectando com o estádio...',
  'Ajustando a iluminação...',
  'Chamando o craque...',
  'Processando na velocidade da Dtel...',
  'Quase lá...',
];

export default function LoadingScreen({ appData, onComplete, onError }: Props) {
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % MESSAGES.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const generateImage = async () => {
      try {
        if (!appData.userImage) throw new Error('No image provided');

        // Puxa a chave configurada na Vercel
        const apiKey = import.meta.env.VITE_GEMINI_KEY;
        if (!apiKey) throw new Error('API Key missing');

        const ai = new GoogleGenAI({ apiKey });
        
        // Separação correta do base64 para processamento da imagem
        const base64Parts = appData.userImage.split(',');
        const base64Data = base64Parts[1];
        const mimeType = base64Parts[0].split(';')[0].split(':')[1];

        const prompt = `Create an ultra-photorealistic, cinematic 8K image of a football fan transformed into a Brazilian national team champion player, celebrating victory in a packed stadium. Wearing official-style Brazil jersey, holding golden world championship trophy. Preserve exact facial identity from the photo. Cinematic stadium lighting.`;

        // Chamada única ao modelo Gemini 3.1
        const result = await ai.models.generateContent({
          model: 'gemini-3.1-flash-image-preview', 
          contents: {
            parts: [
              { inlineData: { data: base64Data, mimeType: mimeType } },
              { text: prompt }
            ],
          },
          config: { 
            imageConfig: { 
              aspectRatio: "9:16",
              imageSize: "1K" 
            } 
          }
        });

        let generatedUrl = null;
        // Extração segura da imagem da resposta
        const parts = result.candidates?.[0]?.content?.parts || [];
        for (const part of parts) {
          if (part.inlineData) {
            generatedUrl = `data:image/png;base64,${part.inlineData.data}`;
            break;
          }
        }

        if (generatedUrl) {
          onComplete(generatedUrl);
        } else {
          throw new Error('No image generated');
        }
      } catch (error) {
        console.error('Generation error:', error);
        onError();
      }
    };

    generateImage();
  }, [appData, onComplete, onError]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-[#0a0a0a] p-6 text-center">
      <div className="relative w-48 h-48 mb-12">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 rounded-full border-t-4 border-[#00ff88] border-r-4 border-transparent opacity-80"
        />
        <div className="absolute inset-12 rounded-full bg-[#00ff88]/20 flex items-center justify-center">
          <div className="w-12 h-12 bg-[#00ff88] rounded-full shadow-[0_0_30px_#00ff88] animate-pulse" />
        </div>
      </div>
      <h2 className="text-3xl font-black uppercase tracking-tight mb-4">
        Gerando <span className="text-[#00ff88]">Magia</span>
      </h2>
      <p className="text-gray-400 text-lg font-medium">{MESSAGES[msgIndex]}</p>
    </div>
  );
}
