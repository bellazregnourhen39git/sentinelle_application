import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, CheckCircle, AlertTriangle, Eye, Save, RefreshCw, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const ScanPage = () => {
    const navigate = useNavigate();
    const [file, setFile] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [scanResult, setScanResult] = useState(null);
    const [rawText, setRawText] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    // Simple drag and drop handlers
    const onDrop = useCallback((e) => {
        e.preventDefault();
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            setFile(e.dataTransfer.files[0]);
            setError(null);
        }
    }, []);

    const onFileChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            setFile(e.target.files[0]);
            setError(null);
        }
    };

    const handleUpload = async () => {
        if (!file) return;
        setIsProcessing(true);
        setError(null);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await api.post('scan/upload/', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setScanResult(response.data.extracted_data);
            setRawText(response.data.raw_text_extracted || "");
        } catch (err) {
            console.error("Scan upload error", err);
            setError("Échec de l'analyse OCR du document.");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleSave = async () => {
        if (!scanResult) return;
        setIsSaving(true);
        setError(null);

        try {
            // Because our mock data needs a school_class (done server-side if not present)
            // We just submit the data exactly as the QuestionnaireForm does
            await api.post('questionnaire/submit/', scanResult);
            setSuccess(true);
            setTimeout(() => {
                setSuccess(false);
                setScanResult(null);
                setFile(null);
                setRawText("");
            }, 3000);
        } catch (err) {
            console.error("Save error", err);
            setError("Erreur lors de l'enregistrement en base de données.");
        } finally {
            setIsSaving(false);
        }
    };

    // A simple recursive component to render the nested JSON for editing
    const renderJSONRows = (obj, path = []) => {
        return Object.keys(obj).map(key => {
            const val = obj[key];
            const currentPath = [...path, key];
            
            if (val !== null && typeof val === 'object' && !Array.isArray(val)) {
                return (
                    <div key={currentPath.join('.')} className="ml-4 mt-2 border-l-2 border-brand-100 pl-4">
                        <strong className="text-[10px] text-slate-400 uppercase tracking-widest">{key}</strong>
                        {renderJSONRows(val, currentPath)}
                    </div>
                );
            }

            // Primitive or Array
            const isArray = Array.isArray(val);
            const displayVal = isArray ? val.join(', ') : String(val);

            return (
                <div key={currentPath.join('.')} className="flex flex-col md:flex-row md:items-center justify-between gap-2 py-2 border-b border-slate-50 last:border-0">
                    <span className="text-xs font-bold text-slate-600">{key}</span>
                    <input 
                        type="text" 
                        value={displayVal}
                        onChange={(e) => {
                            const newResult = { ...scanResult };
                            let current = newResult;
                            for (let i = 0; i < currentPath.length - 1; i++) {
                                current = current[currentPath[i]];
                            }
                            
                            if (isArray) {
                                current[currentPath[currentPath.length - 1]] = e.target.value.split(',').map(s => s.trim());
                            } else {
                                current[currentPath[currentPath.length - 1]] = e.target.value;
                            }
                            setScanResult(newResult);
                        }}
                        className="text-sm px-3 py-1 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-brand-500 w-full md:w-1/2"
                    />
                </div>
            );
        });
    };

    return (
        <div className="min-h-screen p-6 md:p-12 flex flex-col items-center bg-slate-50">
            <div className="max-w-5xl w-full">
                
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 italic uppercase">Scanner OCR</h1>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[2px]">
                            Extraction automatique de questionnaires papier
                        </p>
                    </div>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-600 rounded-2xl flex items-center gap-3">
                        <AlertTriangle size={20} />
                        <span className="text-sm font-bold">{error}</span>
                    </div>
                )}

                {success && (
                    <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-2xl flex items-center gap-3">
                        <CheckCircle size={20} />
                        <span className="text-sm font-bold">Document enregistré avec succès en base de données.</span>
                    </div>
                )}

                {!scanResult ? (
                    /* UPLOAD ZONE */
                    <div 
                        className="pro-card p-12 bg-white border-2 border-dashed border-slate-200 flex flex-col items-center justify-center cursor-pointer hover:border-brand-400 hover:bg-brand-50/30 transition-all rounded-[32px] min-h-[400px]"
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={onDrop}
                        onClick={() => document.getElementById('file-upload').click()}
                    >
                        <input 
                            id="file-upload" 
                            type="file" 
                            className="hidden" 
                            accept="image/*,.pdf" 
                            onChange={onFileChange}
                        />
                        
                        <div className="w-20 h-20 rounded-full bg-brand-50 flex items-center justify-center text-brand-500 mb-6 group-hover:scale-110 transition-transform">
                            {isProcessing ? <RefreshCw size={32} className="animate-spin" /> : <Upload size={32} />}
                        </div>
                        
                        <h3 className="text-xl font-black text-slate-700 italic mb-2">
                            {file ? file.name : "Glissez & Déposez un document"}
                        </h3>
                        <p className="text-sm text-slate-400 font-medium text-center max-w-md">
                            {file 
                                ? "Cliquez sur Analyser pour extraire les données." 
                                : "Formats supportés: JPG, PNG, PDF. L'IA du système extraira les cases cochées et le texte."}
                        </p>

                        {file && (
                            <button 
                                onClick={(e) => { e.stopPropagation(); handleUpload(); }}
                                disabled={isProcessing}
                                className="mt-8 px-8 py-3 bg-brand-600 text-white rounded-full font-bold uppercase tracking-widest text-xs hover:bg-brand-700 transition-colors shadow-lg shadow-brand-500/30 disabled:opacity-50 flex items-center gap-2"
                            >
                                {isProcessing ? "Analyse en cours..." : "Lancer l'Analyse OCR"}
                                {!isProcessing && <FileText size={16} />}
                            </button>
                        )}
                    </div>
                ) : (
                    /* RESULTS PREVIEW & CORRECTION */
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Status/Actions Column */}
                        <div className="lg:col-span-1 space-y-6">
                            <div className="pro-card p-6 bg-white border border-slate-100 rounded-[32px]">
                                <div className="flex items-center gap-3 text-emerald-500 mb-4">
                                    <CheckCircle size={24} />
                                    <h3 className="text-lg font-black italic">Extraction Réussie</h3>
                                </div>
                                <p className="text-xs text-slate-500 mb-6">
                                    Veuillez vérifier les champs détectés ci-contre. Corrigez toute erreur de lecture avant l'enregistrement.
                                </p>
                                
                                <button 
                                    onClick={handleSave}
                                    disabled={isSaving}
                                    className="w-full py-4 bg-brand-600 text-white rounded-2xl font-bold uppercase tracking-widest text-[10px] hover:bg-brand-700 transition-colors shadow-lg shadow-brand-500/30 flex items-center justify-center gap-2 mb-3 disabled:opacity-50"
                                >
                                    {isSaving ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}
                                    {isSaving ? "Enregistrement..." : "Confirmer & Enregistrer"}
                                </button>

                                <button 
                                    onClick={() => {
                                        setScanResult(null);
                                        setFile(null);
                                        setRawText("");
                                    }}
                                    disabled={isSaving}
                                    className="w-full py-3 bg-slate-100 text-slate-600 rounded-2xl font-bold uppercase tracking-widest text-[10px] hover:bg-slate-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    <X size={16} />
                                    Annuler (Recommencer)
                                </button>
                            </div>

                            {/* Raw text preview (helpful for debugging OCR issues) */}
                            <div className="pro-card p-6 bg-slate-900 border border-slate-800 rounded-[32px] text-white">
                                <div className="flex items-center gap-2 text-slate-400 mb-4">
                                    <Eye size={16} />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Texte Brut (Tesseract)</span>
                                </div>
                                <div className="bg-slate-950 p-4 rounded-xl font-mono text-[10px] text-brand-300 h-48 overflow-y-auto break-all">
                                    {rawText || "Aucun texte textuel détectable."}
                                </div>
                            </div>
                        </div>

                        {/* Editor Column */}
                        <div className="lg:col-span-2 pro-card p-6 md:p-8 bg-white border border-slate-100 rounded-[32px] h-[700px] flex flex-col">
                            <div className="mb-6 flex items-center gap-3">
                                <FileText size={20} className="text-brand-500" />
                                <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Données Modélisées</h3>
                            </div>
                            
                            <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar">
                                {renderJSONRows(scanResult)}
                            </div>
                            
                            <style>{`
                                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                                .custom-scrollbar::-webkit-scrollbar-track { background: #f8fafc; border-radius: 8px; }
                                .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 8px; }
                                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
                            `}</style>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ScanPage;
