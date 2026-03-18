// ... (mantenha os imports e interfaces iguais)

  useEffect(() => {
    const generateImage = async () => {
      try {
        if (!appData.userImage) throw new Error('No image provided');

        const apiKey = import.meta.env.VITE_GEMINI_KEY;
        if (!apiKey) throw new Error('API Key missing');

        const ai = new GoogleGenAI({ apiKey });
        
        const base64Parts = appData.userImage.split(',');
        const base64Data = base64Parts[1];
        const mimeType = base64Parts[0].split(';')[0].split(':')[1];

        const prompt = `Create an ultra-photorealistic, cinematic 8K image of a football fan transformed into a Brazilian national team champion player, celebrating victory in a packed stadium. Wearing official-style Brazil jersey, holding golden world championship trophy. Preserve exact facial identity from the photo. Cinematic stadium lighting.`;

        // MUDANÇA: Usando o modelo Gemini 1.5 Flash
        const result = await ai.models.generateContent({
          model: 'gemini-1.5-flash', 
          contents: {
            parts: [
              { inlineData: { data: base64Data, mimeType: mimeType } },
              { text: prompt }
            ],
          },
          config: { 
            // Configurações otimizadas para velocidade
            temperature: 0.7,
            topP: 0.95,
          }
        });

        let generatedUrl = null;
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
          // Se o modelo 1.5 Flash não gerar imagem direta, ele retornará erro
          throw new Error('No image generated');
        }
      } catch (error) {
        console.error('Generation error:', error);
        onError();
      }
    };

    generateImage();
  }, [appData, onComplete, onError]);

// ... (resto do componente igual)
