import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Download, Share2, RefreshCw, Instagram } from 'lucide-react';
import { AppData } from '../App';

interface Props {
  appData: AppData;
  onRestart: () => void;
}

export default function ResultScreen({ appData, onRestart }: Props) {
  const [watermarkedImage, setWatermarkedImage] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (appData.generatedImage && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        
        if (ctx) {
          // Draw base image
          ctx.drawImage(img, 0, 0);
          
          // Add gradient overlay at bottom
          const gradient = ctx.createLinearGradient(0, canvas.height - 200, 0, canvas.height);
          gradient.addColorStop(0, 'rgba(0,0,0,0)');
          gradient.addColorStop(1, 'rgba(0,0,0,0.8)');
          ctx.fillStyle = gradient;
          ctx.fillRect(0, canvas.height - 200, canvas.width, 200);

          // Add Dtel watermark
          ctx.fillStyle = '#00ff88';
          ctx.font = 'bold 48px Inter, sans-serif';
          ctx.textAlign = 'right';
          ctx.fillText('DTEL FIBRA', canvas.width - 40, canvas.height - 60);
          
          ctx.fillStyle = '#ffffff';
          ctx.font = '24px Inter, sans-serif';
          ctx.fillText('A velocidade do hexa', canvas.width - 40, canvas.height - 30);

          // Add hidden coupon code overlay (small corner)
          ctx.fillStyle = 'rgba(255,255,255,0.5)';
          ctx.font = '16px monospace';
          ctx.textAlign = 'left';
          ctx.fillText('CUPOM: DTELCOPA26', 20, canvas.height - 20);

          setWatermarkedImage(canvas.toDataURL('image/jpeg', 0.9));
        }
      };
      img.src = appData.generatedImage;
    }
  }, [appData.generatedImage]);

  const handleDownload = () => {
    if (watermarkedImage) {
      const link = document.createElement('a');
      link.href = watermarkedImage;
      link.download = `dtel-copa-${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent('Olha eu comemorando com a seleção! 🇧🇷⚽ Feito com a IA da Dtel Fibra. Faça o seu também!');
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  return (
    <div className="flex-1 flex flex-col bg-[#0a0a0a] p-6">
      <div className="flex-1 flex flex-col items-center max-w-md mx-auto w-full">
        <h2 className="text-3xl font-black uppercase tracking-tight mb-6 text-center">
          Sua <span className="text-[#00ff88]">Convocação</span>
        </h2>

        <div className="w-full relative rounded-3xl overflow-hidden shadow-[0_0_40px_rgba(0,255,136,0.15)] border border-white/10 mb-8">
          {watermarkedImage ? (
            <img 
              src={watermarkedImage} 
              alt="Generated" 
              className="w-full h-auto object-cover"
            />
          ) : (
            <div className="w-full aspect-[9/16] bg-zinc-900 animate-pulse flex items-center justify-center">
              <p className="text-zinc-600">Finalizando imagem...</p>
            </div>
          )}
        </div>

        <div className="w-full space-y-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleDownload}
            disabled={!watermarkedImage}
            className="w-full py-4 px-6 bg-[#00ff88] text-black font-bold text-lg rounded-2xl shadow-[0_0_20px_rgba(0,255,136,0.3)] flex items-center justify-center gap-3 uppercase tracking-wide disabled:opacity-50"
          >
            <Download className="w-6 h-6" />
            Baixar Imagem
          </motion.button>

          <div className="grid grid-cols-2 gap-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleShareWhatsApp}
              className="py-4 px-4 bg-[#25D366] text-white font-bold text-sm rounded-2xl flex items-center justify-center gap-2 uppercase tracking-wide"
            >
              <Share2 className="w-5 h-5" />
              WhatsApp
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleDownload}
              className="py-4 px-4 bg-gradient-to-tr from-[#f09433] via-[#e6683c] to-[#bc1888] text-white font-bold text-sm rounded-2xl flex items-center justify-center gap-2 uppercase tracking-wide"
            >
              <Instagram className="w-5 h-5" />
              Instagram
            </motion.button>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onRestart}
            className="w-full py-4 px-6 bg-zinc-900 border border-zinc-800 text-white font-bold text-lg rounded-2xl flex items-center justify-center gap-3 uppercase tracking-wide mt-4"
          >
            <RefreshCw className="w-5 h-5" />
            Fazer Outra
          </motion.button>
        </div>

        <div className="mt-8 text-center p-4 bg-[#00ff88]/10 rounded-2xl border border-[#00ff88]/20 w-full">
          <p className="text-sm text-[#00ff88] font-bold uppercase tracking-wider mb-1">
            Dtel Fibra
          </p>
          <p className="text-xs text-gray-400">
            Se essa imagem carregou rápido, imagina sua internet com a Dtel.
          </p>
        </div>
      </div>

      {/* Hidden canvas for watermarking */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
