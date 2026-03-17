import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
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

        const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
        const ai = new GoogleGenAI({ apiKey });
        
        // Extract base64 data
        const base64Data = appData.userImage.split(',')[1];
        const mimeType = appData.userImage.split(';')[0].split(':')[1];

        const prompt = `Create an ultra-photorealistic, cinematic 8K image of a football fan transformed into a Brazilian national team champion player, celebrating victory in a packed stadium.

The person must be wearing an official-style Brazil national team jersey (yellow shirt with green details), perfectly fitted to their body, with realistic fabric behavior, micro-wrinkles, stitching, sweat absorption, and subtle dirt marks from a match.

The subject is holding a golden world championship trophy above chest level, with both hands, in a victorious pose. The trophy must have highly detailed metallic reflections, micro-scratches, fingerprints, and accurate light interaction.

---
## 📸 FACE & IDENTITY PRESERVATION
* Preserve the exact facial identity from the uploaded photo
* Maintain realistic skin texture: pores, fine lines, natural imperfections
* Keep facial proportions, asymmetry, and expression natural
* Apply subtle sweat on forehead and cheeks
* Add slight motion blur only if necessary for realism

---
## 💡 LIGHTING (CRITICAL)
* Use cinematic stadium lighting:
  * Strong top-down floodlights
  * Cool white highlights
  * Soft rim light separating subject from background
* Add realistic shadows on face and jersey
* Include light bounce from the grass field (green subtle reflection)
* Slight lens flare from stadium lights

---
## 🏟️ ENVIRONMENT
* Background: massive football stadium completely filled with crowd
* Night match atmosphere
* Bright stadium lights illuminating the scene
* Depth of field:
  * Subject in sharp focus
  * Background slightly blurred (professional sports photography look)

---
## 🎨 TEXTURE & DETAIL (EXTREME REALISM)
* Skin: ultra-detailed pores, subtle oiliness, natural variation
* Jersey: breathable sports fabric, visible stitching, stretch zones
* Trophy: polished gold with imperfections and reflections of environment
* Atmosphere:
  * Light particles in the air
  * Subtle mist or humidity
  * Confetti or small debris floating

---
## 📷 CAMERA SETTINGS (REALISTIC)
* Shot as if taken with a professional sports camera
* Lens: 85mm or 135mm
* Aperture: f/2.8
* ISO: 800–1600 (low noise, slight grain acceptable)
* Shutter speed: fast enough to freeze subject

---
## 🎬 COMPOSITION
* Medium close-up framing (waist to head)
* Subject centered, slightly angled
* Trophy clearly visible and highlighted
* Emotional intensity: pride, victory, exhaustion

---
## 🏆 FINAL LOOK
* Hyper-realistic
* Cinematic color grading
* High contrast but natural skin tones
* HDR quality
* 8K resolution
* Looks like an official World Cup victory photograph

---
## 🚫 IMPORTANT
* Do NOT make it look like CGI or 3D render
* Avoid artificial skin smoothing
* Avoid cartoonish or stylized output

---
## ✨ OPTIONAL OVERLAY (MARKETING)
Add a subtle watermark in the lower corner:
"Gerado com Dtel Fibra"

This image must feel like a real historic sports photograph of a World Champion moment.`;

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash-image-preview',
          contents: {
            parts: [
              {
                inlineData: {
                  data: base64Data,
                  mimeType: mimeType,
                },
              },
              {
                text: prompt,
              },
            ],
          },
          config: {
            imageConfig: {
              aspectRatio: "9:16"
            }
          }
        });

        let generatedUrl = null;
        for (const part of response.candidates?.[0]?.content?.parts || []) {
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
        if (error instanceof Error && error.message.includes("Requested entity was not found.")) {
          if (window.aistudio) {
            await window.aistudio.openSelectKey();
            onError();
            return;
          }
        }
        console.error('Generation error:', error);
        onError();
      }
    };

    generateImage();
  }, [appData, onComplete, onError]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-[#0a0a0a] p-6 text-center">
      <div className="relative w-48 h-48 mb-12">
        {/* Animated Rings */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 rounded-full border-t-4 border-[#00ff88] border-r-4 border-transparent opacity-80"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          className="absolute inset-4 rounded-full border-b-4 border-white border-l-4 border-transparent opacity-50"
        />
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-12 rounded-full bg-[#00ff88]/20 flex items-center justify-center"
        >
          <div className="w-12 h-12 bg-[#00ff88] rounded-full shadow-[0_0_30px_#00ff88] animate-pulse" />
        </motion.div>
      </div>

      <h2 className="text-3xl font-black uppercase tracking-tight mb-4">
        Gerando <span className="text-[#00ff88]">Magia</span>
      </h2>
      
      <motion.p
        key={msgIndex}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="text-gray-400 text-lg font-medium h-8"
      >
        {MESSAGES[msgIndex]}
      </motion.p>
    </div>
  );
}
