import React, { useState, useEffect } from 'react';
import { 
    FileText, 
    School, 
    Users, 
    Calendar, 
    Clock, 
    MessageSquare, 
    CheckCircle2, 
    AlertCircle,
    ArrowLeft,
    Globe,
    Building2,
    ShieldCheck,
    Pencil,
    Plus,
    Trash2,
    ArrowUp,
    ArrowDown,
    X,
    Save,
    Edit3
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api';

const ClassReportPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const editId = searchParams.get('edit');
    const [lang, setLang] = useState('fr');
    const isRTL = lang === 'ar';
    const [status, setStatus] = useState('idle');
    const [governorates, setGovernorates] = useState([]);
    const [establishments, setEstablishments] = useState([]);
    const [suggestions, setSuggestions] = useState([]);
    
    // Dynamic Fields Engine State
    const [fieldsList, setFieldsList] = useState([]);
    const [isEditMode, setIsEditMode] = useState(false);
    const [existingReports, setExistingReports] = useState([]);
    const [editingField, setEditingField] = useState(null);
    const [addingToSection, setAddingToSection] = useState(null);
    const [newFieldData, setNewFieldData] = useState({
        code: '',
        label_fr: '',
        label_ar: '',
        field_type: 'TEXT',
        options_str: ''
    });

    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    const isSuperAdmin = ['SUPER_ADMIN', 'GLOBAL_ADMIN'].includes(currentUser?.role?.toUpperCase());

    const [formData, setFormData] = useState({
        governorate: '',
        establishment: '',
        establishment_name: '',
        establishment_type: 'PUBLIC',
        study_level: '1_AS',
        report_date: new Date().toISOString().split('T')[0],
        students_present: '',
        students_refused: '0',
        students_absent: '0',
        parental_authorization_required: false,
        students_without_authorization: '0',
        questionnaires_collected: '',
        perturbations: 1,
        serious_work: 1,
        difficulty_level: 1,
        planned_time_minutes: '45',
        first_student_time_minutes: '',
        last_student_time_minutes: '',
        personal_comments: '',
        extra_data: {}
    });

    const t = {
        fr: {
            title: "Rapport de Classe",
            subtitle: "Administration de l'enquête MedSPAD",
            sections: {
                identity: "Identité de l'établissement",
                stats: "Statistiques de participation",
                observations: "Déroulement & Observations",
                timing: "Chronométrie",
                comments: "Commentaires personnels"
            },
            fields: {
                governorate: "Gouvernorat",
                establishment: "Nom de l'établissement",
                type: "Type d'établissement",
                level: "Niveau d'études",
                date: "Date de l'enquête",
                present: "Élèves présents",
                refused: "Élèves ayant refusé",
                absent: "Élèves absents",
                auth_req: "Autorisation parentale demandée ?",
                no_auth: "Élèves sans autorisation",
                collected: "Questionnaires collectés",
                perturbations: "Perturbations remarquées",
                serious: "Sérieux des élèves",
                difficulty: "Facilité de réponse",
                planned_time: "Temps prévu (min)",
                first_time: "Temps premier élève (min)",
                last_time: "Temps dernier élève (min)",
                comments: "Remarques et incidents"
            },
            options: {
                public: "Public",
                private: "Privé",
                l1: "1ère AS",
                l2: "2ème AS",
                none: "Aucune",
                few: "Quelques élèves",
                many: "Plusieurs élèves",
                all: "Tous",
                majority: "La majorité",
                half: "Moitié ou moins",
                easy: "Facile",
                neutral: "Moyen",
                hard: "Difficile"
            },
            actions: {
                submit: "Enregistrer le Rapport",
                back: "Retour",
                success: "Rapport enregistré avec succès",
                error: "Erreur lors de l'enregistrement"
            }
        },
        ar: {
            title: "تقرير القسم",
            subtitle: "إدارة مسح MedSPAD",
            sections: {
                identity: "هوية المؤسسة",
                stats: "إحصائيات المشاركة",
                observations: "سير العملية والملاحظات",
                timing: "التوقيت",
                comments: "ملاحظات شخصية"
            },
            fields: {
                governorate: "الولاية",
                establishment: "اسم المؤسسة",
                type: "نوع المؤسسة",
                level: "المستوى الدراسي",
                date: "تاريخ المسح",
                present: "عدد التلاميذ الحاضرين",
                refused: "عدد التلاميذ الرافضين",
                absent: "عدد التلاميذ الغائبين",
                auth_req: "هل طُلبت موافقة الأولياء؟",
                no_auth: "تلاميذ بدون موافقة",
                collected: "الاستبيانات التي تم جمعها",
                perturbations: "الاضطرابات الملاحظة",
                serious: "جدية التلاميذ",
                difficulty: "سهولة الإجابة",
                planned_time: "الوقت المقرر (دقائق)",
                first_time: "وقت أول تلميذ (دقائق)",
                last_time: "وقت آخر تلميذ (دقائق)",
                comments: "ملاحظات وحوادث"
            },
            options: {
                public: "عمومية",
                private: "خاصة",
                l1: "السنة الأولى",
                l2: "السنة الثانية",
                none: "لا يوجد",
                few: "بعض التلاميذ",
                many: "تلاميذ كثر",
                all: "الجميع",
                majority: "الأغلبية",
                half: "النصف أو أقل",
                easy: "سهل",
                neutral: "متوسط",
                hard: "صعب"
            },
            actions: {
                submit: "حفظ التقرير",
                back: "رجوع",
                success: "تم حفظ التقرير بنجاح",
                error: "خطأ أثناء الحفظ"
            }
        }
    };

    const currentT = t[lang];

    const loadFields = () => {
        api.get('class-report-fields/').then(res => {
            const list = Array.isArray(res.data) ? res.data : (res.data?.results || []);
            setFieldsList(list);
        }).catch(err => console.error(err));
    };

    useEffect(() => {
        api.get('geography/governorates/').then(res => {
            const list = Array.isArray(res.data) ? res.data : (res.data?.results || []);
            setGovernorates(list);
        }).catch(() => setGovernorates([]));

        loadFields();

        if (editId) {
            api.get(`class-report/${editId}/`).then(res => {
                setFormData(prev => ({
                    ...prev,
                    ...res.data,
                    extra_data: res.data?.extra_data || {}
                }));
            }).catch(console.error);
        } else {
            const savedUser = localStorage.getItem('user');
            if (savedUser) {
                try {
                    const user = JSON.parse(savedUser);
                    if (user.role === 'PRACTITIONER' || user.role === 'OPERATOR') {
                        setFormData(prev => ({
                            ...prev,
                            establishment: user.establishment || '',
                            establishment_name: user.establishment_name || '',
                            governorate: user.governorate || ''
                        }));
                    }
                } catch (e) {}
            }
        }
    }, [editId]);

    useEffect(() => {
        if (formData.governorate) {
            api.get(`geography/establishments/?governorate_id=${formData.governorate}`).then(res => {
                const list = Array.isArray(res.data) ? res.data : (res.data?.results || []);
                setEstablishments(list);
            }).catch(() => {});
        } else {
            api.get('geography/establishments/').then(res => {
                const list = Array.isArray(res.data) ? res.data : (res.data?.results || []);
                setEstablishments(list);
            }).catch(() => {});
        }
    }, [formData.governorate]);

    useEffect(() => {
        api.get('class-report/list/').then(res => {
            const list = Array.isArray(res.data) ? res.data : (res.data?.results || []);
            setExistingReports(list);
        }).catch(() => setExistingReports([]));
    }, []);

    const handleEstablishmentChange = (e) => {
        const val = e.target.value;
        setFormData({ ...formData, establishment_name: val });
        
        if (val.length > 2) {
            let matches = establishments.filter(est => 
                est.name.toLowerCase().includes(val.toLowerCase())
            );
            if (formData.governorate) {
                matches = matches.filter(est => {
                    const estGov = typeof est.governorate === 'object' ? est.governorate?.id : est.governorate;
                    return String(estGov) === String(formData.governorate) || String(est.governorate_id) === String(formData.governorate);
                });
            }
            setSuggestions(matches.slice(0, 5));
        } else {
            setSuggestions([]);
        }
    };

    const selectSuggestion = (est) => {
        setFormData({ 
            ...formData, 
            establishment: est.id,
            establishment_name: est.name,
            governorate: est.governorate 
        });
        setSuggestions([]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('submitting');
        
        const cleanedData = { ...formData };
        ['students_present', 'students_refused', 'students_absent', 'questionnaires_collected', 
         'planned_time_minutes', 'first_student_time_minutes', 'last_student_time_minutes',
         'students_without_authorization'].forEach(field => {
            if (cleanedData[field] === '') {
                cleanedData[field] = null;
            }
        });

        try {
            let res;
            if (editId) {
                res = await api.patch(`class-report/${editId}/`, cleanedData);
            } else {
                res = await api.post('class-report/', cleanedData);
            }
            setStatus('success');
            setTimeout(() => navigate(`/session/${res.data?.id || editId}/collect`), 2000);
        } catch (err) {
            console.error(err);
            setStatus('error');
        }
    };

    // Reordering & Field Management Handlers
    const handleMoveField = async (section, index, direction) => {
        const secFields = fieldsList.filter(f => f.section === section).sort((a, b) => a.order - b.order);
        const targetIndex = index + direction;
        if (targetIndex < 0 || targetIndex >= secFields.length) return;

        const currentField = secFields[index];
        const targetField = secFields[targetIndex];

        const tempOrder = currentField.order;
        currentField.order = targetField.order;
        targetField.order = tempOrder;

        try {
            await api.patch(`class-report-fields/${currentField.code}/`, { order: currentField.order });
            await api.patch(`class-report-fields/${targetField.code}/`, { order: targetField.order });
            loadFields();
        } catch (e) {
            console.error("Reordering failed", e);
        }
    };

    const handleDeleteField = async (code) => {
        if (!window.confirm(`Voulez-vous vraiment supprimer le champ "${code}" ?`)) return;
        try {
            await api.delete(`class-report-fields/${code}/`);
            loadFields();
        } catch (e) {
            console.error("Delete field failed", e);
        }
    };

    const handleSaveEditField = async () => {
        if (!editingField) return;
        try {
            let options_json = editingField.options_json;
            if (typeof editingField.options_str === 'string' && editingField.options_str.trim()) {
                try {
                    options_json = JSON.parse(editingField.options_str);
                } catch {
                    options_json = editingField.options_str.split(',').map((s, idx) => [
                        s.trim().toLowerCase().replace(/\s+/g, '_') || String(idx + 1),
                        s.trim(),
                        s.trim(),
                        String(idx + 1)
                    ]);
                }
            }
            await api.patch(`class-report-fields/${editingField.code}/`, {
                label_fr: editingField.label_fr,
                label_ar: editingField.label_ar,
                field_type: editingField.field_type,
                options_json
            });
            setEditingField(null);
            loadFields();
        } catch (e) {
            console.error("Edit field failed", e);
        }
    };

    const handleCreateField = async () => {
        if (!newFieldData.code || !newFieldData.label_fr) {
            alert("Code et libellé FR sont requis !");
            return;
        }
        try {
            let options_json = [];
            if (newFieldData.options_str && newFieldData.options_str.trim()) {
                try {
                    options_json = JSON.parse(newFieldData.options_str);
                } catch {
                    options_json = newFieldData.options_str.split(',').map((s, idx) => [
                        s.trim().toLowerCase().replace(/\s+/g, '_') || String(idx + 1),
                        s.trim(),
                        s.trim(),
                        String(idx + 1)
                    ]);
                }
            }
            const secFields = fieldsList.filter(f => f.section === addingToSection);
            const maxOrder = secFields.length ? Math.max(...secFields.map(f => f.order)) : 0;
            await api.post('class-report-fields/', {
                code: newFieldData.code.toLowerCase().replace(/\s+/g, '_'),
                section: addingToSection,
                label_fr: newFieldData.label_fr,
                label_ar: newFieldData.label_ar || newFieldData.label_fr,
                field_type: newFieldData.field_type,
                options_json,
                order: maxOrder + 10,
                is_custom: true
            });
            setAddingToSection(null);
            setNewFieldData({ code: '', label_fr: '', label_ar: '', field_type: 'TEXT', options_str: '' });
            loadFields();
        } catch (e) {
            console.error("Create field failed", e);
            alert("Erreur lors de la création de la question !");
        }
    };

    const getSectionFields = (secKey) => {
        if (!Array.isArray(fieldsList)) return [];
        return fieldsList.filter(f => f && f.section === secKey && !f.is_hidden).sort((a, b) => (a.order || 0) - (b.order || 0));
    };

    const normalizeOptions = (rawOptions) => {
        if (!rawOptions) return [];
        let opts = rawOptions;
        if (typeof rawOptions === 'string') {
            try {
                opts = JSON.parse(rawOptions);
            } catch {
                opts = rawOptions.split(',').map(s => s.trim());
            }
        }
        if (!Array.isArray(opts) || opts.length === 0) return [];

        return opts.map((opt, idx) => {
            if (Array.isArray(opt)) {
                const val = opt[0] !== undefined ? opt[0] : String(idx + 1);
                const fr = opt[1] !== undefined ? opt[1] : opt[0];
                const ar = opt[2] !== undefined ? opt[2] : fr;
                return [val, fr, ar];
            } else if (typeof opt === 'object' && opt !== null) {
                const val = opt.value || opt.id || opt.code || String(idx + 1);
                const fr = opt.label_fr || opt.label || opt.name || val;
                const ar = opt.label_ar || fr;
                return [val, fr, ar];
            } else {
                const strVal = String(opt).trim();
                return [strVal.toLowerCase().replace(/\s+/g, '_') || String(idx + 1), strVal, strVal];
            }
        });
    };

    const renderFieldControl = (field) => {
        const getVal = () => field.is_custom ? (formData.extra_data?.[field.code] || '') : (formData[field.code] || '');
        const setVal = (newVal) => {
            if (field.is_custom) {
                setFormData(prev => ({ ...prev, extra_data: { ...(prev.extra_data || {}), [field.code]: newVal } }));
            } else {
                setFormData(prev => ({ ...prev, [field.code]: newVal }));
            }
        };

        const currentVal = getVal();
        const customOptions = normalizeOptions(field.options_json);

        if (field.field_type === 'RADIO') {
            const opts = customOptions.length ? customOptions : (
                field.code === 'establishment_type' 
                    ? [['PUBLIC', 'Public', 'عمومية'], ['PRIVATE', 'Privé', 'خاصة']] 
                    : []
            );

            if (opts.length === 0) {
                return (
                    <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-500 text-xs italic">
                        {lang === 'ar' ? 'لم يتم تحديد خيارات (انقر فوق ✏️ للتعديل)' : 'Aucune option définie (cliquez sur ✏️ pour ajouter des options)'}
                    </div>
                );
            }

            return (
                <div className={`grid gap-2 ${opts.length === 1 ? 'grid-cols-1' : opts.length === 3 ? 'grid-cols-3' : 'grid-cols-2'}`}>
                    {opts.map(opt => {
                        const optVal = opt[0];
                        const isSelected = String(currentVal) === String(optVal) || (optVal === 'true' && currentVal === true) || (optVal === 'false' && currentVal === false);
                        return (
                            <button
                                key={optVal}
                                type="button"
                                onClick={() => setVal(optVal === 'true' ? true : optVal === 'false' ? false : optVal)}
                                className={`p-3 rounded-xl border text-sm font-bold transition-all ${
                                    isSelected 
                                        ? 'bg-brand-500/20 border-brand-500 text-white shadow-[0_0_15px_rgba(20,184,166,0.2)]' 
                                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                                }`}
                            >
                                {lang === 'ar' && opt[2] ? opt[2] : opt[1]}
                            </button>
                        );
                    })}
                </div>
            );
        }

        if (field.field_type === 'SELECT') {
            const opts = customOptions;
            return (
                <select
                    className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none text-white font-bold"
                    value={currentVal}
                    onChange={e => setVal(e.target.value)}
                >
                    <option value="">-- {lang === 'ar' ? 'اختر' : 'Sélectionner'} --</option>
                    {opts.map(opt => (
                        <option key={opt[0]} value={opt[0]}>
                            {lang === 'ar' && opt[2] ? opt[2] : opt[1]}
                        </option>
                    ))}
                </select>
            );
        }

        if (field.field_type === 'CHECKBOX') {
            const opts = customOptions.length ? customOptions : [['true', 'Oui', 'نعم']];
            return (
                <div className="space-y-2">
                    {opts.map(opt => {
                        const optVal = opt[0];
                        const isChecked = Array.isArray(currentVal) ? currentVal.includes(optVal) : String(currentVal) === String(optVal);
                        return (
                            <label key={optVal} className="flex items-center gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer hover:border-slate-700">
                                <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={e => {
                                        if (Array.isArray(currentVal)) {
                                            const next = e.target.checked ? [...currentVal, optVal] : currentVal.filter(v => v !== optVal);
                                            setVal(next);
                                        } else {
                                            setVal(e.target.checked ? optVal : '');
                                        }
                                    }}
                                    className="w-4 h-4 rounded text-brand-500 bg-slate-900 border-slate-700 focus:ring-brand-500"
                                />
                                <span className="text-sm font-medium text-slate-200">{lang === 'ar' && opt[2] ? opt[2] : opt[1]}</span>
                            </label>
                        );
                    })}
                </div>
            );
        }

        return (
            <input 
                type={field.field_type === 'NUMBER' ? 'number' : field.field_type === 'DATE' ? 'date' : 'text'}
                className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none text-white font-medium"
                value={currentVal}
                onChange={e => setVal(e.target.value)}
            />
        );
    };

    return (
        <div className={`min-h-screen bg-slate-950 text-slate-200 p-4 md:p-8 font-sans ${lang === 'ar' ? 'rtl' : 'ltr'}`} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => navigate(-1)}
                            className="p-2 hover:bg-slate-900 rounded-full transition-colors border border-slate-800"
                        >
                            <ArrowLeft className={lang === 'ar' ? 'rotate-180' : ''} />
                        </button>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white uppercase italic flex items-center gap-3">
                                {currentT.title}
                                {editId && (
                                    <span className="text-xs px-2.5 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full normal-case font-bold tracking-normal">
                                        Mode Édition #{editId}
                                    </span>
                                )}
                            </h1>
                            <p className="text-brand-400 font-bold text-xs uppercase tracking-widest">
                                {currentT.subtitle}
                            </p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        {isSuperAdmin && (
                            <button
                                type="button"
                                onClick={() => setIsEditMode(!isEditMode)}
                                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold text-xs border transition-all shadow-sm ${
                                    isEditMode 
                                        ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-amber-500/20' 
                                        : 'bg-slate-900 border-slate-700 text-slate-300 hover:text-white hover:border-slate-500'
                                }`}
                            >
                                <Pencil size={14} />
                                {isEditMode ? 'Quitter Éditeur Structure' : 'Éditeur de Structure'}
                            </button>
                        )}

                        {existingReports.length > 0 && (
                            <select
                                className="bg-slate-900 border border-slate-700 text-xs font-bold px-3 py-2 rounded-lg text-slate-300 outline-none focus:border-brand-500"
                                value={editId || ''}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    if (val) {
                                        navigate(`/class-report?edit=${val}`);
                                    } else {
                                        navigate('/class-report');
                                    }
                                }}
                            >
                                <option value="">-- {editId ? 'Créer nouveau rapport' : 'Éditer un rapport existant'} --</option>
                                {existingReports.map(r => (
                                    <option key={r.id} value={r.id}>
                                        #{r.id} - {r.establishment_name} ({r.report_date})
                                    </option>
                                ))}
                            </select>
                        )}

                        <button 
                            onClick={() => setLang(lang === 'fr' ? 'ar' : 'fr')}
                            className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-brand-500/30 rounded-lg font-bold text-sm hover:border-brand-500 transition-all"
                        >
                            <Globe size={18} />
                            {lang === 'fr' ? 'العربية' : 'Français'}
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    
                    {/* SECTION 1: IDENTITY */}
                    <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl backdrop-blur-sm relative overflow-hidden group">
                        <div className="flex items-center justify-between mb-6 border-b border-slate-800 pb-3">
                            <h2 className="flex items-center gap-2 text-lg font-bold text-white uppercase italic">
                                <Building2 className="text-brand-500" size={20} />
                                {currentT.sections.identity}
                            </h2>
                            {isEditMode && (
                                <button
                                    type="button"
                                    onClick={() => setAddingToSection('identity')}
                                    className="flex items-center gap-1 px-3 py-1 bg-brand-500/20 text-brand-300 border border-brand-500/40 rounded-lg text-xs font-bold hover:bg-brand-500/30"
                                >
                                    <Plus size={14} /> Ajouter une question
                                </button>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {getSectionFields('identity').map((field, idx, arr) => (
                                <div key={field.code} className={`space-y-2 p-3 rounded-xl transition-all ${isEditMode ? 'bg-slate-950/80 border border-slate-800' : ''}`}>
                                    <div className="flex items-center justify-between">
                                        <label className="text-xs font-black uppercase tracking-tighter text-slate-400">
                                            {isRTL && field.label_ar ? field.label_ar : field.label_fr}
                                        </label>
                                        {isEditMode && (
                                            <div className="flex items-center gap-1 bg-slate-900 px-2 py-1 rounded-md border border-slate-800">
                                                <button type="button" onClick={() => handleMoveField('identity', idx, -1)} disabled={idx === 0} className="p-0.5 text-slate-400 hover:text-white disabled:opacity-30"><ArrowUp size={12} /></button>
                                                <button type="button" onClick={() => handleMoveField('identity', idx, 1)} disabled={idx === arr.length - 1} className="p-0.5 text-slate-400 hover:text-white disabled:opacity-30"><ArrowDown size={12} /></button>
                                                <button type="button" onClick={() => setEditingField({ ...field, options_str: JSON.stringify(field.options_json) })} className="p-0.5 text-amber-400 hover:text-amber-300"><Edit3 size={12} /></button>
                                                <button type="button" onClick={() => handleDeleteField(field.code)} className="p-0.5 text-red-400 hover:text-red-300"><Trash2 size={12} /></button>
                                            </div>
                                        )}
                                    </div>

                                    {field.code === 'governorate' ? (
                                        <select 
                                            className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none disabled:opacity-50"
                                            value={formData.governorate}
                                            onChange={e => {
                                                setFormData(prev => ({ ...prev, governorate: e.target.value, establishment: '', establishment_name: '' }));
                                                setSuggestions([]);
                                            }}
                                            required
                                            disabled={formData.governorate !== '' && !isSuperAdmin}
                                        >
                                            <option value="">-- {currentT.fields.governorate} --</option>
                                            {governorates.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                                        </select>
                                    ) : field.code === 'establishment_name' ? (
                                        <div className="relative">
                                            <input 
                                                type="text"
                                                className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none disabled:opacity-50"
                                                placeholder="..."
                                                value={formData.establishment_name}
                                                onChange={handleEstablishmentChange}
                                                required
                                                readOnly={formData.establishment !== '' && !isSuperAdmin}
                                            />
                                            {suggestions.length > 0 && (
                                                <div className="absolute z-10 w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden">
                                                    {suggestions.map(est => (
                                                        <div key={est.id} className="p-3 hover:bg-brand-500/10 cursor-pointer text-sm border-b border-slate-800 last:border-0" onClick={() => selectSuggestion(est)}>
                                                            <div className="font-bold text-white">{est.name}</div>
                                                            <div className="text-xs text-slate-500">{est.governorate_name}</div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        renderFieldControl(field)
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* SECTION 2: STATS */}
                    <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl backdrop-blur-sm relative overflow-hidden group">
                        <div className="flex items-center justify-between mb-6 border-b border-slate-800 pb-3">
                            <h2 className="flex items-center gap-2 text-lg font-bold text-white uppercase italic">
                                <Users className="text-brand-500" size={20} />
                                {currentT.sections.stats}
                            </h2>
                            {isEditMode && (
                                <button
                                    type="button"
                                    onClick={() => setAddingToSection('stats')}
                                    className="flex items-center gap-1 px-3 py-1 bg-brand-500/20 text-brand-300 border border-brand-500/40 rounded-lg text-xs font-bold hover:bg-brand-500/30"
                                >
                                    <Plus size={14} /> Ajouter une question
                                </button>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {getSectionFields('stats').map((field, idx, arr) => (
                                <div key={field.code} className={`space-y-2 p-3 rounded-xl transition-all ${isEditMode ? 'bg-slate-950/80 border border-slate-800' : ''}`}>
                                    <div className="flex items-center justify-between">
                                        <label className="text-xs font-black uppercase tracking-tighter text-slate-400">
                                            {isRTL && field.label_ar ? field.label_ar : field.label_fr}
                                        </label>
                                        {isEditMode && (
                                            <div className="flex items-center gap-1 bg-slate-900 px-2 py-1 rounded-md border border-slate-800">
                                                <button type="button" onClick={() => handleMoveField('stats', idx, -1)} disabled={idx === 0} className="p-0.5 text-slate-400 hover:text-white disabled:opacity-30"><ArrowUp size={12} /></button>
                                                <button type="button" onClick={() => handleMoveField('stats', idx, 1)} disabled={idx === arr.length - 1} className="p-0.5 text-slate-400 hover:text-white disabled:opacity-30"><ArrowDown size={12} /></button>
                                                <button type="button" onClick={() => setEditingField({ ...field, options_str: JSON.stringify(field.options_json) })} className="p-0.5 text-amber-400 hover:text-amber-300"><Edit3 size={12} /></button>
                                                <button type="button" onClick={() => handleDeleteField(field.code)} className="p-0.5 text-red-400 hover:text-red-300"><Trash2 size={12} /></button>
                                            </div>
                                        )}
                                    </div>

                                    {renderFieldControl(field)}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* SECTION 3: OBSERVATIONS */}
                    <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl backdrop-blur-sm relative overflow-hidden group">
                        <div className="flex items-center justify-between mb-6 border-b border-slate-800 pb-3">
                            <h2 className="flex items-center gap-2 text-lg font-bold text-white uppercase italic">
                                <FileText className="text-brand-500" size={20} />
                                {currentT.sections.observations}
                            </h2>
                            {isEditMode && (
                                <button
                                    type="button"
                                    onClick={() => setAddingToSection('observations')}
                                    className="flex items-center gap-1 px-3 py-1 bg-brand-500/20 text-brand-300 border border-brand-500/40 rounded-lg text-xs font-bold hover:bg-brand-500/30"
                                >
                                    <Plus size={14} /> Ajouter une question
                                </button>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {getSectionFields('observations').map((field, idx, arr) => (
                                <div key={field.code} className={`space-y-2 p-3 rounded-xl transition-all ${isEditMode ? 'bg-slate-950/80 border border-slate-800' : ''}`}>
                                    <div className="flex items-center justify-between">
                                        <label className="text-xs font-black uppercase tracking-tighter text-slate-400">
                                            {isRTL && field.label_ar ? field.label_ar : field.label_fr}
                                        </label>
                                        {isEditMode && (
                                            <div className="flex items-center gap-1 bg-slate-900 px-2 py-1 rounded-md border border-slate-800">
                                                <button type="button" onClick={() => handleMoveField('observations', idx, -1)} disabled={idx === 0} className="p-0.5 text-slate-400 hover:text-white disabled:opacity-30"><ArrowUp size={12} /></button>
                                                <button type="button" onClick={() => handleMoveField('observations', idx, 1)} disabled={idx === arr.length - 1} className="p-0.5 text-slate-400 hover:text-white disabled:opacity-30"><ArrowDown size={12} /></button>
                                                <button type="button" onClick={() => setEditingField({ ...field, options_str: JSON.stringify(field.options_json) })} className="p-0.5 text-amber-400 hover:text-amber-300"><Edit3 size={12} /></button>
                                                <button type="button" onClick={() => handleDeleteField(field.code)} className="p-0.5 text-red-400 hover:text-red-300"><Trash2 size={12} /></button>
                                            </div>
                                        )}
                                    </div>

                                    {renderFieldControl(field)}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* SECTION 4: TIMING */}
                    <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl backdrop-blur-sm relative overflow-hidden group">
                        <div className="flex items-center justify-between mb-6 border-b border-slate-800 pb-3">
                            <h2 className="flex items-center gap-2 text-lg font-bold text-white uppercase italic">
                                <Clock className="text-brand-500" size={20} />
                                {currentT.sections.timing}
                            </h2>
                            {isEditMode && (
                                <button
                                    type="button"
                                    onClick={() => setAddingToSection('timing')}
                                    className="flex items-center gap-1 px-3 py-1 bg-brand-500/20 text-brand-300 border border-brand-500/40 rounded-lg text-xs font-bold hover:bg-brand-500/30"
                                >
                                    <Plus size={14} /> Ajouter une question
                                </button>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {getSectionFields('timing').map((field, idx, arr) => (
                                <div key={field.code} className={`space-y-2 p-3 rounded-xl transition-all ${isEditMode ? 'bg-slate-950/80 border border-slate-800' : ''}`}>
                                    <div className="flex items-center justify-between">
                                        <label className="text-xs font-black uppercase tracking-tighter text-slate-400">
                                            {isRTL && field.label_ar ? field.label_ar : field.label_fr}
                                        </label>
                                        {isEditMode && (
                                            <div className="flex items-center gap-1 bg-slate-900 px-2 py-1 rounded-md border border-slate-800">
                                                <button type="button" onClick={() => handleMoveField('timing', idx, -1)} disabled={idx === 0} className="p-0.5 text-slate-400 hover:text-white disabled:opacity-30"><ArrowUp size={12} /></button>
                                                <button type="button" onClick={() => handleMoveField('timing', idx, 1)} disabled={idx === arr.length - 1} className="p-0.5 text-slate-400 hover:text-white disabled:opacity-30"><ArrowDown size={12} /></button>
                                                <button type="button" onClick={() => setEditingField({ ...field, options_str: JSON.stringify(field.options_json) })} className="p-0.5 text-amber-400 hover:text-amber-300"><Edit3 size={12} /></button>
                                                <button type="button" onClick={() => handleDeleteField(field.code)} className="p-0.5 text-red-400 hover:text-red-300"><Trash2 size={12} /></button>
                                            </div>
                                        )}
                                    </div>

                                    {renderFieldControl(field)}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* SECTION 5: COMMENTS */}
                    <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl backdrop-blur-sm relative overflow-hidden group">
                        <div className="flex items-center justify-between mb-6 border-b border-slate-800 pb-3">
                            <h2 className="flex items-center gap-2 text-lg font-bold text-white uppercase italic">
                                <MessageSquare className="text-brand-500" size={20} />
                                {currentT.sections.comments}
                            </h2>
                            {isEditMode && (
                                <button
                                    type="button"
                                    onClick={() => setAddingToSection('comments')}
                                    className="flex items-center gap-1 px-3 py-1 bg-brand-500/20 text-brand-300 border border-brand-500/40 rounded-lg text-xs font-bold hover:bg-brand-500/30"
                                >
                                    <Plus size={14} /> Ajouter une question
                                </button>
                            )}
                        </div>

                        <div className="space-y-6">
                            {getSectionFields('comments').map((field, idx, arr) => (
                                <div key={field.code} className={`space-y-2 p-3 rounded-xl transition-all ${isEditMode ? 'bg-slate-950/80 border border-slate-800' : ''}`}>
                                    <div className="flex items-center justify-between">
                                        <label className="text-xs font-black uppercase tracking-tighter text-slate-400">
                                            {isRTL && field.label_ar ? field.label_ar : field.label_fr}
                                        </label>
                                        {isEditMode && (
                                            <div className="flex items-center gap-1 bg-slate-900 px-2 py-1 rounded-md border border-slate-800">
                                                <button type="button" onClick={() => handleMoveField('comments', idx, -1)} disabled={idx === 0} className="p-0.5 text-slate-400 hover:text-white disabled:opacity-30"><ArrowUp size={12} /></button>
                                                <button type="button" onClick={() => handleMoveField('comments', idx, 1)} disabled={idx === arr.length - 1} className="p-0.5 text-slate-400 hover:text-white disabled:opacity-30"><ArrowDown size={12} /></button>
                                                <button type="button" onClick={() => setEditingField({ ...field, options_str: JSON.stringify(field.options_json) })} className="p-0.5 text-amber-400 hover:text-amber-300"><Edit3 size={12} /></button>
                                                <button type="button" onClick={() => handleDeleteField(field.code)} className="p-0.5 text-red-400 hover:text-red-300"><Trash2 size={12} /></button>
                                            </div>
                                        )}
                                    </div>

                                    {renderFieldControl(field)}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Status Feedback */}
                    {status === 'success' && (
                        <div className="p-4 bg-emerald-500/20 border border-emerald-500/50 rounded-xl text-emerald-400 flex items-center gap-3 font-bold text-sm">
                            <CheckCircle2 size={20} />
                            {currentT.actions.success}
                        </div>
                    )}

                    {status === 'error' && (
                        <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-400 flex items-center gap-3 font-bold text-sm">
                            <AlertCircle size={20} />
                            {currentT.actions.error}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-4 pt-4">
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="px-6 py-3 bg-slate-900 border border-slate-800 rounded-xl font-bold text-sm text-slate-400 hover:text-white transition-all"
                        >
                            {currentT.actions.back}
                        </button>

                        <button
                            type="submit"
                            disabled={status === 'submitting'}
                            className="px-8 py-3 bg-gradient-to-r from-brand-600 to-brand-500 text-white rounded-xl font-bold text-sm hover:opacity-90 transition-all shadow-lg shadow-brand-500/20 disabled:opacity-50"
                        >
                            {status === 'submitting' ? '...' : currentT.actions.submit}
                        </button>
                    </div>
                </form>
            </div>

            {/* EDIT FIELD MODAL */}
            {editingField && (
                <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                            <h3 className="text-lg font-black text-white italic uppercase flex items-center gap-2">
                                <Edit3 className="text-amber-400" size={18} /> Éditer la question #{editingField.code}
                            </h3>
                            <button onClick={() => setEditingField(null)} className="p-1 text-slate-400 hover:text-white"><X size={18} /></button>
                        </div>

                        <div className="space-y-3 text-xs font-bold">
                            <div>
                                <label className="text-slate-400 mb-1 block">Intitulé Français</label>
                                <input type="text" className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-white outline-none focus:border-brand-500" value={editingField.label_fr} onChange={e => setEditingField({ ...editingField, label_fr: e.target.value })} />
                            </div>
                            <div>
                                <label className="text-slate-400 mb-1 block">Intitulé Arabe (العنوان)</label>
                                <input type="text" className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-white outline-none focus:border-brand-500" value={editingField.label_ar || ''} onChange={e => setEditingField({ ...editingField, label_ar: e.target.value })} />
                            </div>
                            <div>
                                <label className="text-slate-400 mb-1 block">Type de champ</label>
                                <select className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-white outline-none focus:border-brand-500" value={editingField.field_type} onChange={e => setEditingField({ ...editingField, field_type: e.target.value })}>
                                    <option value="TEXT">Texte</option>
                                    <option value="NUMBER">Nombre</option>
                                    <option value="RADIO">Boutons Radio</option>
                                    <option value="SELECT">Liste déroulante</option>
                                    <option value="TEXTAREA">Zone de texte</option>
                                </select>
                            </div>
                            {(editingField.field_type === 'RADIO' || editingField.field_type === 'SELECT') && (
                                <div>
                                    <label className="text-slate-400 mb-1 block">Options (JSON ou séparées par des virgules)</label>
                                    <textarea rows="3" className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-white outline-none font-mono text-[11px]" value={editingField.options_str} onChange={e => setEditingField({ ...editingField, options_str: e.target.value })} />
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                            <button type="button" onClick={() => setEditingField(null)} className="px-4 py-2 bg-slate-950 border border-slate-800 text-slate-400 rounded-xl text-xs font-bold">Annuler</button>
                            <button type="button" onClick={handleSaveEditField} className="px-5 py-2 bg-amber-500 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 hover:bg-amber-400"><Save size={14} /> Enregistrer</button>
                        </div>
                    </div>
                </div>
            )}

            {/* ADD NEW FIELD MODAL */}
            {addingToSection && (
                <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                            <h3 className="text-lg font-black text-white italic uppercase flex items-center gap-2">
                                <Plus className="text-brand-400" size={18} /> Ajouter une question ({addingToSection})
                            </h3>
                            <button onClick={() => setAddingToSection(null)} className="p-1 text-slate-400 hover:text-white"><X size={18} /></button>
                        </div>

                        <div className="space-y-3 text-xs font-bold">
                            <div>
                                <label className="text-slate-400 mb-1 block">Code unique (ex: custom_field_1)</label>
                                <input type="text" placeholder="custom_..." className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-white outline-none focus:border-brand-500" value={newFieldData.code} onChange={e => setNewFieldData({ ...newFieldData, code: e.target.value })} />
                            </div>
                            <div>
                                <label className="text-slate-400 mb-1 block">Intitulé Français</label>
                                <input type="text" placeholder="Entrez la question..." className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-white outline-none focus:border-brand-500" value={newFieldData.label_fr} onChange={e => setNewFieldData({ ...newFieldData, label_fr: e.target.value })} />
                            </div>
                            <div>
                                <label className="text-slate-400 mb-1 block">Intitulé Arabe (العنوان)</label>
                                <input type="text" placeholder="أدخل السؤال بالعربية..." className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-white outline-none focus:border-brand-500" value={newFieldData.label_ar} onChange={e => setNewFieldData({ ...newFieldData, label_ar: e.target.value })} />
                            </div>
                            <div>
                                <label className="text-slate-400 mb-1 block">Type de champ</label>
                                <select className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-white outline-none focus:border-brand-500" value={newFieldData.field_type} onChange={e => setNewFieldData({ ...newFieldData, field_type: e.target.value })}>
                                    <option value="TEXT">Texte</option>
                                    <option value="NUMBER">Nombre</option>
                                    <option value="RADIO">Boutons Radio</option>
                                    <option value="SELECT">Liste déroulante</option>
                                    <option value="TEXTAREA">Zone de texte</option>
                                </select>
                            </div>
                            {(newFieldData.field_type === 'RADIO' || newFieldData.field_type === 'SELECT') && (
                                <div>
                                    <label className="text-slate-400 mb-1 block">Options (séparées par des virgules: Opt1, Opt2)</label>
                                    <input type="text" placeholder="Option 1, Option 2, Option 3" className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-white outline-none font-mono text-[11px]" value={newFieldData.options_str} onChange={e => setNewFieldData({ ...newFieldData, options_str: e.target.value })} />
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                            <button type="button" onClick={() => setAddingToSection(null)} className="px-4 py-2 bg-slate-950 border border-slate-800 text-slate-400 rounded-xl text-xs font-bold">Annuler</button>
                            <button type="button" onClick={handleCreateField} className="px-5 py-2 bg-brand-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 hover:bg-brand-400"><Plus size={14} /> Créer la question</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ClassReportPage;
