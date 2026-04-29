import React, { createContext, useContext, useState, useEffect } from 'react';
import api from './api';
import ConfirmationModal from './components/dashboard/ConfirmationModal';

const TerminologyContext = createContext();

export const TerminologyProvider = ({ children }) => {
    const [terms, setTerms] = useState({});
    const [isEditMode, setIsEditMode] = useState(false);
    const [pendingTerm, setPendingTerm] = useState(null); // { key, oldVal, newVal }

    const fetchTerms = async () => {
        try {
            const res = await api.get('terminology/');
            const termMap = {};
            if (Array.isArray(res.data)) {
                res.data.forEach(t => {
                    if (t && t.key) {
                        termMap[t.key] = t.value_fr;
                    }
                });
            }
            setTerms(termMap);
        } catch (err) {
            console.error("Failed to load terminology", err);
        }
    };

    useEffect(() => {
        fetchTerms();
    }, []);

    const t_dyn = (key, defaultValue) => {
        return terms[key] || defaultValue;
    };

    const updateTerm = (key, newValue) => {
        const oldVal = terms[key] || '';
        if (oldVal === newValue) return;
        setPendingTerm({ key, oldVal, newVal: newValue });
    };

    const confirmUpdate = async () => {
        if (!pendingTerm) return;
        const { key, newVal } = pendingTerm;
        
        try {
            // First try update
            await api.patch(`terminology/${encodeURIComponent(key)}/`, { value_fr: newVal });
            setTerms(prev => ({ ...prev, [key]: newVal }));
        } catch (err) {
            // If failed (maybe 404), try create
            try {
                await api.post(`terminology/`, { key, value_fr: newVal });
                setTerms(prev => ({ ...prev, [key]: newVal }));
            } catch (postErr) {
                console.error("Failed to update/create terminology", postErr);
                alert("Erreur lors de la mise à jour.");
            }
        }
        setPendingTerm(null);
    };

    return (
        <TerminologyContext.Provider value={{ t_dyn, updateTerm, isEditMode, setIsEditMode }}>
            {children}
            <ConfirmationModal 
                isOpen={!!pendingTerm}
                onClose={() => setPendingTerm(null)}
                onConfirm={confirmUpdate}
                title="Validation des Titres"
                message={pendingTerm ? `Vous allez modifier "${pendingTerm.oldVal || pendingTerm.key}" par "${pendingTerm.newVal}". Êtes-vous sûr ?` : ""}
                confirmText="Oui, Modifier"
                cancelText="Non, Annuler"
            />
        </TerminologyContext.Provider>
    );
};

export const useTerminology = () => useContext(TerminologyContext);
