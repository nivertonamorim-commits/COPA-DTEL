import { useState } from 'react';
import { motion } from 'motion/react';
import { Camera, Zap } from 'lucide-react';

declare global {
  interface Window {
    aistudio?: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}

interface Props {
  onNext: () => void;
}

export default function LandingScreen({ onNext }: Props) {
  const [isChecking, setIsChecking] = useState(false);

  const handleStart = async () => {
    if (window.aistudio) {
      setIsChecking(true);
      try {
        const hasKey = await window.aistudio.hasSelectedApiKey();
        if (!hasKey) {
          await window.aistudio.openSelectKey();
        }
        // Assume success after triggering openSelectKey due to race condition
        onNext();
      } catch (error) {
        console.error("Error checking API key:", error);
        onNext(); // Fallback
      } finally {
        setIsChecking(false);
      }
    } else {
      onNext();
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[120%] h-[120%] bg-[radial-gradient(circle_at_50%_50%,_rgba(0,255,136,0.15)_0%,_rgba(10,10,10,1)_70%)]" />
        <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-[#0a0a0a] to-transparent" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="z-10 flex flex-col items-center text-center max-w-md w-full"
      >
        <div className="mb-8 flex items-center justify-center gap-2">
          <Zap className="w-8 h-8 text-[#00ff88]" />
          <h1 className="text-3xl font-black tracking-tighter uppercase text-white">
            Dtel <span className="text-[#00ff88]">Fibra</span>
          </h1>
        </div>

        <h2 className="text-5xl font-black uppercase leading-[0.9] mb-4 tracking-tight">
          Você no <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00ff88] to-[#00cc6a]">
            Mundial
          </span>
        </h2>
        
        <p className="text-gray-400 mb-10 text-lg font-medium">
          Tire uma foto e celebre com os craques da seleção na velocidade da luz.
        </p>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleStart}
          disabled={isChecking}
          className="w-full py-4 px-8 bg-[#00ff88] text-black font-bold text-xl rounded-2xl shadow-[0_0_20px_rgba(0,255,136,0.4)] flex items-center justify-center gap-3 uppercase tracking-wide disabled:opacity-70"
        >
          <Camera className="w-6 h-6" />
          {isChecking ? 'Verificando...' : 'Começar Agora'}
        </motion.button>
        
        <p className="mt-6 text-xs text-gray-500 uppercase tracking-widest">
          Experiência gerada por IA
        </p>
      </motion.div>
    </div>
  );
}
