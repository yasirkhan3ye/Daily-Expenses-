
import React, { useState, useRef, useEffect } from 'react';
import { generateImage, chatWithGemini, generateSpeech, decodeBase64Audio, decodeAudioData } from '../services/geminiService';
import { ImageSize, ChatMessage } from '../types';

export const AIStudio: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'chat' | 'image' | 'voice'>('chat');
  
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [chatLoading, setChatLoading] = useState(false);
  
  const [imagePrompt, setImagePrompt] = useState('');
  const [imageSize, setImageSize] = useState<ImageSize>(ImageSize.ONE_K);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(false);

  const [voiceText, setVoiceText] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);

  const handleChat = async () => {
    if (!chatInput.trim()) return;
    const userMsg = { role: 'user' as const, text: chatInput };
    setChatHistory(prev => [...prev, userMsg]);
    setChatInput('');
    setChatLoading(true);
    try {
      const response = await chatWithGemini(chatInput);
      setChatHistory(prev => [...prev, { role: 'model', text: response }]);
    } catch (e) {
      setChatHistory(prev => [...prev, { role: 'model', text: "Hisaab AI is temporarily offline." }]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleGenerateImage = async () => {
    if (!imagePrompt.trim()) return;
    setImageLoading(true);
    try {
      const url = await generateImage(imagePrompt, imageSize);
      setGeneratedImage(url);
    } catch (e) {
      alert("Image generation failed.");
    } finally {
      setImageLoading(false);
    }
  };

  const handleSpeak = async () => {
    if (!voiceText.trim()) return;
    setIsSpeaking(true);
    try {
      const base64 = await generateSpeech(voiceText);
      if (base64) {
        if (!audioContextRef.current) {
          audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        }
        const ctx = audioContextRef.current;
        const decoded = decodeBase64Audio(base64);
        const buffer = await decodeAudioData(decoded, ctx, 24000, 1);
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(ctx.destination);
        source.onended = () => setIsSpeaking(false);
        source.start();
      }
    } catch (e) {
      setIsSpeaking(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-20">
      <header className="px-1">
        <h2 className="text-2xl font-black tracking-tighter">AI Studio</h2>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Generative Intelligence Hub</p>
      </header>

      <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-2xl border border-slate-200 dark:border-slate-800">
        {(['chat', 'image', 'voice'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
              activeTab === tab ? 'bg-primary text-white shadow-lg' : 'text-slate-400'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="min-h-[400px]">
        {activeTab === 'chat' && (
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl overflow-hidden flex flex-col h-[500px]">
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {chatHistory.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] px-5 py-3 rounded-2xl text-xs font-bold leading-relaxed ${
                    msg.role === 'user' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {chatLoading && <div className="text-primary animate-pulse text-[10px] font-black uppercase">Thinking...</div>}
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 flex gap-2">
              <input 
                type="text" 
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleChat()}
                placeholder="Ask Hisaab AI..."
                className="flex-1 bg-white dark:bg-slate-900 rounded-2xl px-5 py-4 outline-none text-xs font-bold"
              />
              <button onClick={handleChat} className="bg-primary text-white p-4 rounded-2xl shadow-lg">
                <span className="material-symbols-outlined text-xl">send</span>
              </button>
            </div>
          </div>
        )}

        {activeTab === 'image' && (
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-xl border border-slate-100 dark:border-slate-800 space-y-6">
            <textarea 
              value={imagePrompt}
              onChange={e => setImagePrompt(e.target.value)}
              placeholder="Describe a financial visualization..."
              className="w-full h-32 bg-slate-50 dark:bg-slate-800/50 border-none rounded-3xl p-6 font-bold text-xs outline-none focus:ring-2 focus:ring-primary/20 resize-none"
            />
            <div className="flex gap-2">
              {Object.values(ImageSize).map(size => (
                <button
                  key={size}
                  onClick={() => setImageSize(size)}
                  className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${
                    imageSize === size ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
            <button 
              onClick={handleGenerateImage}
              disabled={imageLoading}
              className="w-full bg-primary text-white py-5 rounded-[1.5rem] font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20 disabled:opacity-50"
            >
              {imageLoading ? 'Visualizing...' : 'Generate Asset'}
            </button>
            {generatedImage && <img src={generatedImage} className="w-full rounded-[2rem] shadow-2xl mt-4 animate-fadeIn" />}
          </div>
        )}

        {activeTab === 'voice' && (
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-xl border border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center min-h-[400px] text-center space-y-8">
            <div className={`size-32 rounded-full flex items-center justify-center text-4xl shadow-inner transition-all duration-500 ${isSpeaking ? 'bg-primary text-white animate-pulse' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
              {isSpeaking ? '🔊' : '🔇'}
            </div>
            <div className="w-full max-w-sm space-y-4">
              <input 
                type="text" 
                value={voiceText}
                onChange={e => setVoiceText(e.target.value)}
                placeholder="Text to speak..."
                className="w-full bg-slate-50 dark:bg-slate-800/50 border-none rounded-2xl px-6 py-4 font-bold text-xs"
              />
              <button 
                onClick={handleSpeak}
                disabled={isSpeaking}
                className="w-full bg-primary text-white py-5 rounded-[1.5rem] font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20"
              >
                Start Voice Synth
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
