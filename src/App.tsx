import { useState } from 'react';
import LandingScreen from './components/LandingScreen';
import CameraScreen from './components/CameraScreen';
import LoadingScreen from './components/LoadingScreen';
import LeadCaptureScreen from './components/LeadCaptureScreen';
import ResultScreen from './components/ResultScreen';

export type ScreenState = 
  | 'landing' 
  | 'camera' 
  | 'loading' 
  | 'lead_capture' 
  | 'result';

export interface AppData {
  userImage: string | null;
  generatedImage: string | null;
  leadData: any | null;
}

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenState>('landing');
  const [appData, setAppData] = useState<AppData>({
    userImage: null,
    generatedImage: null,
    leadData: null,
  });

  const updateData = (data: Partial<AppData>) => {
    setAppData((prev) => ({ ...prev, ...data }));
  };

  const navigate = (screen: ScreenState) => {
    setCurrentScreen(screen);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans overflow-hidden flex flex-col">
      {currentScreen === 'landing' && <LandingScreen onNext={() => navigate('camera')} />}
      {currentScreen === 'camera' && (
        <CameraScreen 
          onCapture={(image) => {
            updateData({ userImage: image });
            navigate('loading');
          }} 
          onBack={() => navigate('landing')}
        />
      )}
      {currentScreen === 'loading' && (
        <LoadingScreen 
          appData={appData}
          onComplete={(generatedImage) => {
            updateData({ generatedImage });
            navigate('lead_capture');
          }}
          onError={() => {
            alert('Erro ao gerar imagem. Tente novamente.');
            navigate('camera');
          }}
        />
      )}
      {currentScreen === 'lead_capture' && (
        <LeadCaptureScreen 
          onComplete={(leadData) => {
            updateData({ leadData });
            navigate('result');
          }}
        />
      )}
      {currentScreen === 'result' && (
        <ResultScreen 
          appData={appData} 
          onRestart={() => {
            setAppData({
              userImage: null,
              generatedImage: null,
              leadData: null,
            });
            navigate('landing');
          }}
        />
      )}
    </div>
  );
}
