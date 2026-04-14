import React, { useState, useEffect, useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { motion } from 'framer-motion';
import { Download, Printer, Globe, ArrowLeft, RefreshCw, Smartphone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const QRCodePage = () => {
    const navigate = useNavigate();
    const qrRef = useRef();
    
    // Detection logic for local IP
    // Default to the current window location if not localhost, 
    // otherwise fallback to the detected machine IP 172.20.10.3
    const initialHost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
        ? '172.20.10.3' 
        : window.location.hostname;
    
    const [ipAddress, setIpAddress] = useState(initialHost);
    const [port, setPort] = useState(window.location.port || '5173');
    const [path, setPath] = useState('/questionnaire');
    
    const fullUrl = `http://${ipAddress}${port ? `:${port}` : ''}${path}`;

    const downloadQRCode = () => {
        const canvas = qrRef.current.querySelector('canvas');
        if (canvas) {
            const pngUrl = canvas
                .toDataURL("image/png")
                .replace("image/png", "image/octet-stream");
            let downloadLink = document.createElement("a");
            downloadLink.href = pngUrl;
            downloadLink.download = "sentinelle_qr_code.png";
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="min-h-screen p-6 md:p-12 flex flex-col items-center justify-center bg-slate-50 relative overflow-hidden">
            {/* Background elements (Decorative) */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-40">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-200/20 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-brand-400/10 rounded-full blur-[120px]" />
            </div>

            {/* Back Button (Hidden in print) */}
            <button 
                onClick={() => navigate(-1)}
                className="print:hidden absolute top-8 left-8 flex items-center gap-2 text-slate-400 hover:text-brand-600 font-bold uppercase tracking-widest text-[10px] transition-colors group"
            >
                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                Retour
            </button>

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-2xl w-full"
            >
                {/* Main Card */}
                <div className="pro-card bg-white p-8 md:p-16 shadow-2xl shadow-slate-200 border border-slate-100 flex flex-col items-center">
                    
                    {/* Header */}
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-50 rounded-2xl text-brand-600 mb-6 shadow-inner border border-brand-100">
                            <Smartphone size={32} />
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter italic uppercase leading-none mb-4">
                            Accès <span className="text-brand-600">Mobile</span>
                        </h1>
                        <p className="text-[11px] font-black text-slate-400 uppercase tracking-[4px] italic">
                            Scan pour accéder au questionnaire
                        </p>
                    </div>

                    {/* QR Code Container */}
                    <div 
                        ref={qrRef}
                        className="p-8 bg-white border-2 border-slate-100 rounded-[48px] shadow-xl shadow-slate-100/50 mb-10 group relative"
                    >
                        <QRCodeCanvas 
                            value={fullUrl} 
                            size={256}
                            level="H" // High error correction
                            includeMargin={false}
                            imageSettings={{
                                src: "/favicon.svg", // Fallback if available, or just leave it out
                                x: undefined,
                                y: undefined,
                                height: 40,
                                width: 40,
                                excavate: true,
                            }}
                        />
                        {/* Decorative corner accents */}
                        <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-brand-500 rounded-tl-2xl opacity-40" />
                        <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-brand-500 rounded-tr-2xl opacity-40" />
                        <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-brand-500 rounded-bl-2xl opacity-40" />
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-brand-500 rounded-br-2xl opacity-40" />
                    </div>

                    {/* URL Display */}
                    <div className="w-full bg-slate-50 border border-slate-100 p-6 rounded-[32px] text-center mb-12 group transition-colors hover:border-brand-200">
                        <div className="flex items-center justify-center gap-2 mb-2 text-slate-400">
                            <Globe size={14} />
                            <span className="text-[9px] font-black uppercase tracking-widest italic">Cible du Réseau Local</span>
                        </div>
                        <p className="font-mono text-sm font-bold text-slate-700 break-all select-all">
                            {fullUrl}
                        </p>
                    </div>

                    {/* Configuration Panel (Hidden in print) */}
                    <div className="print:hidden w-full space-y-4 mb-12 border-t border-slate-100 pt-10">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[3px] italic mb-6">Paramètres de Déploiement</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-2 italic">Adresse IP / Host</label>
                                <input 
                                    type="text" 
                                    value={ipAddress}
                                    onChange={(e) => setIpAddress(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
                                    placeholder="e.g. 192.168.1.10"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-2 italic">Port</label>
                                <input 
                                    type="text" 
                                    value={port}
                                    onChange={(e) => setPort(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 focus:outline-none focus:border-brand-500 transition-all"
                                    placeholder="5173"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-2 italic">Chemin (Route)</label>
                            <input 
                                type="text" 
                                value={path}
                                onChange={(e) => setPath(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 focus:outline-none focus:border-brand-500 transition-all"
                                placeholder="/questionnaire"
                            />
                        </div>
                        <div className="flex justify-end pt-2">
                            <button 
                                onClick={() => setIpAddress(initialHost)}
                                className="flex items-center gap-2 text-slate-400 hover:text-brand-600 text-[9px] font-black uppercase tracking-widest italic transition-colors"
                            >
                                <RefreshCw size={12} />
                                Reset IP
                            </button>
                        </div>
                    </div>

                    {/* Actions (Hidden in print) */}
                    <div className="print:hidden flex flex-wrap gap-4 w-full justify-center">
                        <button 
                            onClick={downloadQRCode}
                            className="pro-btn-primary flex items-center gap-3 px-8 py-4 text-[10px] italic"
                        >
                            <Download size={18} />
                            Télécharger PNG
                        </button>
                        <button 
                            onClick={handlePrint}
                            className="pro-btn-secondary flex items-center gap-3 px-8 py-4 text-[10px] italic"
                        >
                            <Printer size={18} />
                            Imprimer
                        </button>
                    </div>

                    {/* Print Footer (Only in print) */}
                    <div className="hidden print:block text-center mt-12 pt-8 border-t border-slate-200 w-full">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[4px]">
                            Sentinelle System © 2026 • Plateforme de Veille Sanitaire
                        </p>
                    </div>
                </div>

                {/* Print Tip (Hidden in print) */}
                <div className="print:hidden mt-8 text-center flex items-center justify-center gap-3 text-slate-400">
                    <div className="w-1.5 h-1.5 rounded-full bg-brand-500/30" />
                    <p className="text-[10px] font-bold italic">
                        Conseil : L'imprimé peut être affiché dans les salles d'enquête.
                    </p>
                </div>
            </motion.div>

            {/* Custom Print Styles */}
            <style jsx>{`
                @media print {
                    body {
                        background: white !important;
                    }
                    .pro-card {
                        box-shadow: none !important;
                        border: none !important;
                    }
                }
            `}</style>
        </div>
    );
};

export default QRCodePage;
