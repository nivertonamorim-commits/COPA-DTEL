import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { AppData } from '../App';
import { GoogleGenerativeAI } from "@google/generative-ai";

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

        // Puxa a chave da Vercel (Certifique-se que o nome lá é VITE_GEMINI_KEY)
        const apiKey = import.meta.env.VITE_GEMINI_KEY;
        if (!apiKey) throw new Error('API Key missing');

        // Inicializa a biblioteca correta
        const genAI = new GoogleGenerativeAI(apiKey);
        
        // Separação correta do base64 para a API
        const base64Data = appData.userImage.split(',')[1];
        const mimeType = appData.userImage.split(';')[0].split(':')[1];

        const prompt = "Crie uma imagem ultra-realista de um torcedor no estádio com a camisa da seleção brasileira segurando a taça da copa. Preserve o rosto da foto enviada.";

        // Modelo 1.5-flash (Nano Fast)
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const result = await model.generateContent([
          {
            inlineData: {
              data: base64Data,
              mimeType: mimeType,
            },
          },
          { text: prompt },
        ]);

        const response = await result.response;
        const generatedImageBase64 = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

        if (generatedImageBase64) {
          onComplete(`data:image/png;base64,${generatedImageBase64}`);
        } else {
          throw new Error('IA não retornou os dados da imagem');
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
      
      <motion.p
        key={msgIndex}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-gray-400 text-lg font-medium h-8"
      >
        {MESSAGES[msgIndex]}
      </motion.p>
    </div>
  );
}
