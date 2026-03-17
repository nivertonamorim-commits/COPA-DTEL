import { useRef, useState, useCallback } from 'react';
import { motion } from 'motion/react';
import { Camera, ArrowLeft, RefreshCw } from 'lucide-react';

interface Props {
  onCapture: (image: string) => void;
  onBack: () => void;
}

export default function CameraScreen({ onCapture, onBack }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');

  const startCamera = useCallback(async () => {
    try {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode, width: { ideal: 1080 }, height: { ideal: 1920 } },
      });
      setStream(newStream);
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
      }
      setHasPermission(true);
    } catch (err) {
      console.error('Error accessing camera:', err);
      setHasPermission(false);
    }
  }, [facingMode]);

  // Start camera on mount
  useState(() => {
    startCamera();
  });

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // If front camera, flip horizontally
        if (facingMode === 'user') {
          ctx.translate(canvas.width, 0);
          ctx.scale(-1, 1);
        }
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = canvas.toDataURL('image/jpeg', 0.8);
        
        // Stop stream
        if (stream) {
          stream.getTracks().forEach((track) => track.stop());
        }
        
        onCapture(imageData);
      }
    }
  };

  const toggleCamera = () => {
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
  };

  return (
    <div className="flex-1 flex flex-col bg-black relative">
      {/* Header */}
      <div className="absolute top-0 left-0 w-full p-4 z-20 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent">
        <button onClick={onBack} className="p-2 rounded-full bg-white/10 backdrop-blur-md">
          <ArrowLeft className="w-6 h-6 text-white" />
        </button>
        <div className="text-sm font-bold tracking-widest uppercase text-[#00ff88]">
          Tire sua foto
        </div>
        <button onClick={toggleCamera} className="p-2 rounded-full bg-white/10 backdrop-blur-md">
          <RefreshCw className="w-6 h-6 text-white" />
        </button>
      </div>

      {/* Camera View */}
      <div className="flex-1 relative overflow-hidden flex items-center justify-center bg-zinc-900">
        {hasPermission === false ? (
          <div className="text-center p-6">
            <p className="text-red-400 mb-4">Permissão de câmera negada.</p>
            <button 
              onClick={startCamera}
              className="px-6 py-2 bg-white/10 rounded-lg text-white"
            >
              Tentar Novamente
            </button>
          </div>
        ) : (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`w-full h-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
          />
        )}
        
        {/* Overlay Guidelines */}
        <div className="absolute inset-0 pointer-events-none border-[2px] border-white/20 m-8 rounded-3xl" />
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div className="w-48 h-64 border-2 border-dashed border-[#00ff88]/50 rounded-[100px] opacity-50" />
        </div>
      </div>

      {/* Controls */}
      <div className="absolute bottom-0 left-0 w-full p-8 pb-12 z-20 flex justify-center items-center bg-gradient-to-t from-black/90 to-transparent">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleCapture}
          className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center bg-white/20 backdrop-blur-sm"
        >
          <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center">
            <Camera className="w-8 h-8 text-black" />
          </div>
        </motion.button>
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
