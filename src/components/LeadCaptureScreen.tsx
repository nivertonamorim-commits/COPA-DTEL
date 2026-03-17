import React, { useState } from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, User, Phone, MapPin } from 'lucide-react';

interface Props {
  onComplete: (data: any) => void;
}

export default function LeadCaptureScreen({ onComplete }: Props) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    city: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        onComplete(formData);
      } else {
        throw new Error('Failed to save lead');
      }
    } catch (error) {
      console.error(error);
      // Proceed anyway for the demo
      onComplete(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-[#0a0a0a] p-6 relative overflow-hidden">
      <div className="absolute top-[-20%] right-[-20%] w-[140%] h-[140%] bg-[radial-gradient(circle_at_50%_50%,_rgba(0,255,136,0.1)_0%,_rgba(10,10,10,1)_70%)] z-0 pointer-events-none" />

      <div className="z-10 flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-[#00ff88]/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-[#00ff88]" />
          </div>
          <h2 className="text-4xl font-black uppercase tracking-tight mb-3">
            Imagem <span className="text-[#00ff88]">Pronta!</span>
          </h2>
          <p className="text-gray-400 text-lg">
            Preencha os dados abaixo para liberar o download e compartilhar com seus amigos.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <User className="h-5 w-5 text-gray-500" />
            </div>
            <input
              type="text"
              required
              placeholder="Seu Nome Completo"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="block w-full pl-12 pr-4 py-4 bg-zinc-900 border-2 border-zinc-800 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-[#00ff88] focus:ring-1 focus:ring-[#00ff88] transition-colors"
            />
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Phone className="h-5 w-5 text-gray-500" />
            </div>
            <input
              type="tel"
              required
              placeholder="WhatsApp (com DDD)"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="block w-full pl-12 pr-4 py-4 bg-zinc-900 border-2 border-zinc-800 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-[#00ff88] focus:ring-1 focus:ring-[#00ff88] transition-colors"
            />
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <MapPin className="h-5 w-5 text-gray-500" />
            </div>
            <input
              type="text"
              required
              placeholder="Sua Cidade"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              className="block w-full pl-12 pr-4 py-4 bg-zinc-900 border-2 border-zinc-800 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-[#00ff88] focus:ring-1 focus:ring-[#00ff88] transition-colors"
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 px-8 bg-[#00ff88] text-black font-bold text-xl rounded-2xl shadow-[0_0_20px_rgba(0,255,136,0.3)] uppercase tracking-wide mt-4 disabled:opacity-70"
          >
            {isSubmitting ? 'Processando...' : 'Ver e Baixar Foto'}
          </motion.button>
        </form>
        
        <p className="text-center text-xs text-gray-600 mt-6">
          Ao continuar, você concorda em receber comunicações da Dtel Telecom.
        </p>
      </div>
    </div>
  );
}
