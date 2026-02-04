import React, { useState, useRef, useEffect } from 'react';
import { DBService } from '../services/dbService.ts';

declare const jsQR: any;

const QRScanner: React.FC = () => {
  const [scanResult, setScanResult] = useState<{ success: boolean; message: string; isReuse: boolean } | null>(null);
  const [mode, setMode] = useState<'CHECKIN' | 'CHECKOUT'>('CHECKIN');
  const [manualCode, setManualCode] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [lastScanned, setLastScanned] = useState<string | null>(null);
  const [showFlash, setShowFlash] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (requestRef.current !== null) {
      cancelAnimationFrame(requestRef.current);
      requestRef.current = null;
    }
    setIsScanning(false);
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } } 
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsScanning(true);
      }
    } catch (err) {
      alert("Camera access denied. Security staff must grant camera permissions.");
      setIsScanning(false);
    }
  };

  const processResult = (code: string) => {
    if (code === lastScanned) return;
    
    setShowFlash(true);
    setTimeout(() => setShowFlash(false), 150);

    setLastScanned(code);
    const result = mode === 'CHECKIN' 
      ? DBService.checkIn(code.toUpperCase())
      : DBService.checkOut(code.toUpperCase());
    
    setScanResult(result);
    
    if (window.navigator.vibrate) {
      if (result.isReuse) window.navigator.vibrate([100, 50, 100, 50, 100]);
      else if (!result.success) window.navigator.vibrate(500);
      else window.navigator.vibrate(80);
    }

    setTimeout(() => {
      setScanResult(null);
      setLastScanned(null);
    }, 4000); 
  };

  const scanFrame = () => {
    if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA && canvasRef.current) {
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d', { willReadFrequently: true });
      if (context) {
        canvas.height = videoRef.current.videoHeight;
        canvas.width = videoRef.current.videoWidth;
        context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        try {
          const code = jsQR(imageData.data, imageData.width, imageData.height, { inversionAttempts: "dontInvert" });
          if (code && code.data) processResult(code.data);
        } catch (e) {
          // jsQR can sometimes fail on very blurry frames
        }
      }
    }
    if (isScanning) {
      requestRef.current = requestAnimationFrame(scanFrame);
    }
  };

  useEffect(() => {
    if (isScanning) {
      requestRef.current = requestAnimationFrame(scanFrame);
    } else {
      if (requestRef.current !== null) cancelAnimationFrame(requestRef.current);
    }
    return () => {
      if (requestRef.current !== null) cancelAnimationFrame(requestRef.current);
    };
  }, [isScanning, mode]);

  useEffect(() => {
    return () => stopCamera();
  }, []);

  const getStatusColorClass = () => {
    if (!scanResult) return 'border-white/40 shadow-[0_0_20px_rgba(255,255,255,0.1)]';
    if (scanResult.isReuse) return 'border-red-500 shadow-[0_0_40px_rgba(239,68,68,0.6)] bg-red-500/10';
    if (scanResult.success) return 'border-green-500 shadow-[0_0_40px_rgba(34,197,94,0.6)] bg-green-500/10';
    return 'border-amber-500 shadow-[0_0_40px_rgba(245,158,11,0.6)] bg-amber-500/10';
  };

  return (
    <div className="space-y-6">
      <div className="flex p-1 bg-gray-100 rounded-[2rem] border border-gray-200">
        <button onClick={() => { setMode('CHECKIN'); setScanResult(null); }} className={`flex-1 py-4 rounded-[1.8rem] font-black uppercase text-xs tracking-widest transition-all ${mode === 'CHECKIN' ? 'bg-white text-indigo-600 shadow-xl' : 'text-gray-400'}`}>Check-In</button>
        <button onClick={() => { setMode('CHECKOUT'); setScanResult(null); }} className={`flex-1 py-4 rounded-[1.8rem] font-black uppercase text-xs tracking-widest transition-all ${mode === 'CHECKOUT' ? 'bg-white text-gray-800 shadow-xl' : 'text-gray-400'}`}>Check-Out</button>
      </div>

      <div className="relative aspect-square bg-black rounded-[3rem] overflow-hidden border-[8px] border-white shadow-2xl ring-1 ring-gray-100">
        <canvas ref={canvasRef} className="hidden" />
        {isScanning ? (
          <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50 text-center p-6">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6 text-2xl text-gray-300"><i className="fas fa-camera"></i></div>
            <h3 className="font-black text-gray-400 text-xs tracking-widest mb-4 uppercase">Scanner Ready</h3>
            <button onClick={startCamera} className="bg-indigo-600 text-white px-10 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl active:scale-95 transition-all">Activate Camera</button>
          </div>
        )}
        <div className={`absolute inset-0 bg-white transition-opacity pointer-events-none z-20 ${showFlash ? 'opacity-80' : 'opacity-0'}`}></div>
        {isScanning && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-8 pointer-events-none z-10">
            <div className={`w-64 h-64 border-4 rounded-[3rem] relative transition-all duration-300 ${getStatusColorClass()}`}>
                {!scanResult && <div className="absolute top-0 left-0 w-full h-1 bg-indigo-500/80 shadow-[0_0_20px_rgba(99,102,241,1)] animate-[scan_2s_ease-in-out_infinite]"></div>}
            </div>
          </div>
        )}
      </div>

      {scanResult && (
        <div className={`p-6 rounded-[2.5rem] text-center shadow-2xl animate-in zoom-in-95 duration-300 border-4 transform -translate-y-4 ${scanResult.isReuse ? 'bg-red-600 text-white border-red-400 animate-bounce' : scanResult.success ? 'bg-green-600 text-white border-green-400' : 'bg-gray-900 text-white border-gray-700'}`}>
          <div className="flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-2xl mb-1"><i className={`fas ${scanResult.isReuse ? 'fa-triangle-exclamation' : scanResult.success ? 'fa-check' : 'fa-xmark'}`}></i></div>
            <span className="font-black uppercase tracking-[0.2em] text-lg">{scanResult.isReuse ? 'Duplicate' : scanResult.success ? 'Validated' : 'Error'}</span>
            <span className="font-bold uppercase tracking-tight text-sm opacity-90 px-4">{scanResult.message}</span>
          </div>
        </div>
      )}

      <div className="flex gap-3 bg-white p-2 rounded-[2.5rem] border border-gray-100 shadow-sm">
        <input type="text" placeholder="Manual Token..." value={manualCode} onChange={(e) => setManualCode(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (processResult(manualCode.toUpperCase()), setManualCode(''))} className="flex-grow px-8 py-5 rounded-[2rem] bg-gray-50 border-none outline-none font-black font-mono uppercase text-sm tracking-widest" />
        <button onClick={() => { processResult(manualCode.toUpperCase()); setManualCode(''); }} className="bg-indigo-600 text-white px-10 py-5 rounded-[2rem] font-black uppercase tracking-widest text-[10px] shadow-lg active:scale-95 transition-all">Verify</button>
      </div>
      <style>{`@keyframes scan { 0% { top: 0; opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { top: 100%; opacity: 0; } }`}</style>
    </div>
  );
};

export default QRScanner;