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
    Edit3,
    RotateCcw,
    ClipboardList,
    ChevronDown,
    ChevronUp
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
    const [activeReports, setActiveReports] = useState([]);
    const [showReportsDrawer, setShowReportsDrawer] = useState(false);
    const [finalizingReport, setFinalizingReport] = useState(null);
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
    const isOperator = currentUser?.role?.toUpperCase() === 'OPERATOR';
    const isPractitioner = !isSuperAdmin && !isOperator;
    const userGovId = currentUser?.governorate || currentUser?.gouvernorat || currentUser?.governorate_id || '';

    const INITIAL_FORM = {
        governorate: (isPractitioner && userGovId) ? String(userGovId) : '',
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
    };

    const [formData, setFormData] = useState(INITIAL_FORM);

    const t = {
        fr: {
            title: "Rapport de Classe",
            subtitle: "Administration de l'enquête MedSPAD",
            active_title: "Mes Rapports de Classe Actifs (En cours)",
            active_desc: "Vous pouvez basculer entre vos classes ou créer un nouveau rapport pour un autre établissement.",
            new_report_btn: "+ Nouveau Rapport de Classe",
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
                update: "Mettre à jour le Rapport",
                back: "Retour",
                success: "Rapport enregistré avec succès",
                error: "Erreur lors de l'enregistrement",
                finalize_btn: "Clôturer la classe",
                continue_btn: "Saisir les Questionnaires",
                edit_btn: "Modifier"
            }
        },
        ar: {
            title: "تقرير القسم",
            subtitle: "إدارة مسح MedSPAD",
            active_title: "تقارير الأقسام النشطة (قيد الإنجاز)",
            active_desc: "يمكنك التنقل بين أقسامك أو فتح تقرير جديد لمؤسسة تعليمية أخرى.",
            new_report_btn: "+ تقرير قسم جديد",
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
                update: "تحديث التقرير",
                back: "رجوع",
                success: "تم حفظ التقرير بنجاح",
                error: "خطأ أثناء الحفظ",
                finalize_btn: "إغلاق القسم نهائياً",
                continue_btn: "متابعة إدخال الاستبيانات",
                edit_btn: "تعديل"
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

    const loadReports = () => {
        api.get('class-report/list/').then(res => {
            const list = Array.isArray(res.data) ? res.data : (res.data?.results || []);
            setExistingReports(list);
            setActiveReports(list.filter(r => !r.is_finalized));
        }).catch(() => {
            setExistingReports([]);
            setActiveReports([]);
        });
    };

    useEffect(() => {
        api.get('geography/governorates/').then(res => {
            const list = Array.isArray(res.data) ? res.data : (res.data?.results || []);
            setGovernorates(list);
        }).catch(() => setGovernorates([]));

        loadFields();
        loadReports();

        if (editId) {
            api.get(`class-report/${editId}/`).then(res => {
                setFormData({
                    ...INITIAL_FORM,
                    ...res.data,
                    extra_data: res.data?.extra_data || {}
                });
            }).catch(console.error);
        } else {
            setFormData(INITIAL_FORM);
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

    const handleEstablishmentChange = (e) => {
        const val = e.target.value;
        setFormData({ ...formData, establishment_name: val, establishment: '' });
        
        if (val.length > 1) {
            let matches = establishments.filter(est => 
                est.name.toLowerCase().includes(val.toLowerCase())
            );
            if (formData.governorate) {
                matches = matches.filter(est => {
                    const estGov = typeof est.governorate === 'object' ? est.governorate?.id : est.governorate;
                    return String(estGov) === String(formData.governorate) || String(est.governorate_id) === String(formData.governorate);
                });
            }
            setSuggestions(matches.slice(0, 6));
        } else {
            setSuggestions([]);
        }
    };

    const selectSuggestion = (est) => {
        const estGovId = typeof est.governorate === 'object' ? est.governorate?.id : est.governorate;
        setFormData(prev => ({ 
            ...prev, 
            establishment: est.id,
            establishment_name: est.name,
            governorate: (isPractitioner && userGovId) ? String(userGovId) : (estGovId || prev.governorate)
        }));
        setSuggestions([]);
    };

    const [reportViewFilter, setReportViewFilter] = useState('active');

    const handleReopenReport = async (reportId) => {
        try {
            await api.post(`class-report/${reportId}/finalize/`, { action: 'unfinalize', is_finalized: false });
            loadReports();
        } catch (err) {
            console.error("Failed to reopen report", err);
            alert("Erreur lors de la réouverture du rapport.");
        }
    };

    const handleFinalizeConfirm = async (reportId) => {
        try {
            await api.post(`class-report/${reportId}/finalize/`);
            setFinalizingReport(null);
            loadReports();
            if (editId === String(reportId)) {
                navigate('/class-report');
            }
        } catch (err) {
            console.error("Failed to finalize report", err);
            alert("Erreur lors de la clôture du rapport.");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('submitting');
        
        const cleanedData = { ...formData };
        ['students_present', 'students_refused', 'students_absent', 'questionnaires_collected', 
         'planned_time_minutes', 'first_student_time_minutes', 'last_student_time_minutes',
         'students_without_authorization'].forEach(field => {
            if (cleanedData[field] === '' || cleanedData[field] === undefined || cleanedData[field] === null) {
                cleanedData[field] = null;
            } else {
                cleanedData[field] = Math.max(0, Number(cleanedData[field]));
            }
        });

        if (cleanedData.questionnaires_collected === null || cleanedData.questionnaires_collected === undefined || cleanedData.questionnaires_collected <= 0) {
            if (cleanedData.students_present) {
                cleanedData.questionnaires_collected = Math.max(0, (cleanedData.students_present || 0) - (cleanedData.students_refused || 0) - (cleanedData.students_without_authorization || 0));
            }
        }

        if (!cleanedData.establishment || cleanedData.establishment === '') {
            cleanedData.establishment = null;
        } else {
            cleanedData.establishment = Number(cleanedData.establishment);
        }

        const effectiveGov = cleanedData.governorate || userGovId;
        if (effectiveGov) {
            cleanedData.governorate = Number(effectiveGov);
        } else {
            delete cleanedData.governorate;
        }

        try {
            let res;
            if (editId) {
                res = await api.patch(`class-report/${editId}/`, cleanedData);
            } else {
                res = await api.post('class-report/', cleanedData);
            }
            const activeId = String(res.data?.id || editId);
            localStorage.setItem('sentinelle_active_report_id', activeId);
            setStatus('success');
            loadReports();
            setTimeout(() => navigate(`/session/${activeId}/collect`), 1500);
        } catch (err) {
            console.error("Submit class report error:", err.response?.data || err);
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
                        {lang === 'ar' ? 'لم يتم تحديد خيارات (انقر فوق تعديل لإضافة خيارات)' : 'Aucune option définie (cliquez sur Modifier pour ajouter des options)'}
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
            <div className="max-w-5xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => navigate('/dashboard')}
                            className="p-2.5 hover:bg-slate-900 rounded-2xl transition-colors border border-slate-800 text-slate-400 hover:text-white"
                            title="Tableau de bord"
                        >
                            <ArrowLeft className={lang === 'ar' ? 'rotate-180' : ''} size={20} />
                        </button>
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white uppercase italic">
                                    {currentT.title}
                                </h1>
                                {editId ? (
                                    <span className="text-xs px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-full font-bold">
                                        Mode Édition #{editId}
                                    </span>
                                ) : (
                                    <span className="text-xs px-3 py-1 bg-brand-500/20 text-brand-300 border border-brand-500/40 rounded-full font-bold">
                                        Nouveau Rapport
                                    </span>
                                )}
                            </div>
                            <p className="text-brand-400 font-bold text-xs uppercase tracking-widest mt-0.5">
                                {currentT.subtitle}
                            </p>
                        </div>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-3">
                        {editId && (
                            <button
                                type="button"
                                onClick={() => navigate('/class-report')}
                                className="flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold text-xs bg-slate-900 border border-slate-700 text-slate-300 hover:text-white hover:border-slate-500 transition-all"
                            >
                                <Plus size={14} /> {currentT.new_report_btn}
                            </button>
                        )}

                        {existingReports.length > 0 && (
                            <button
                                type="button"
                                onClick={() => setShowReportsDrawer(!showReportsDrawer)}
                                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold text-xs border transition-all ${
                                    showReportsDrawer
                                        ? 'bg-brand-600 text-white border-brand-500 shadow-md shadow-brand-500/20'
                                        : 'bg-slate-900 border-slate-700 text-slate-300 hover:text-white hover:border-slate-500'
                                }`}
                            >
                                <ClipboardList size={14} />
                                <span>{lang === 'ar' ? 'سجل التقارير' : 'Historique'} ({activeReports.length} {lang === 'ar' ? 'نشط' : 'actifs'})</span>
                                {showReportsDrawer ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                            </button>
                        )}

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
                                {isEditMode ? 'Quitter Structure' : 'Structure Formulaire'}
                            </button>
                        )}

                        <button 
                            onClick={() => setLang(lang === 'fr' ? 'ar' : 'fr')}
                            className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-brand-500/30 rounded-xl font-bold text-xs hover:border-brand-500 transition-all text-white"
                        >
                            <Globe size={16} />
                            {lang === 'fr' ? 'العربية' : 'Français'}
                        </button>
                    </div>
                </div>

                {/* ─── REPORTS LIST & ACTIONS SECTION ─────────────────────── */}
                {showReportsDrawer && existingReports.length > 0 && (
                    <div className="bg-slate-900/70 border border-brand-500/30 rounded-3xl p-6 shadow-2xl backdrop-blur-md relative overflow-hidden">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-3 border-b border-slate-800">
                            <div>
                                <div className="flex items-center gap-3">
                                    <h2 className="text-base font-black text-white uppercase italic tracking-wide flex items-center gap-2">
                                        <ClipboardList size={18} className="text-brand-400" />
                                        Mes Rapports de Classe
                                    </h2>
                                    <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-bold">
                                        <button
                                            type="button"
                                            onClick={() => setReportViewFilter('active')}
                                            className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 ${
                                                reportViewFilter === 'active' 
                                                    ? 'bg-brand-500 text-white shadow-md' 
                                                    : 'text-slate-400 hover:text-white'
                                            }`}
                                        >
                                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                                            En cours ({activeReports.length})
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setReportViewFilter('closed')}
                                            className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 ${
                                                reportViewFilter === 'closed' 
                                                    ? 'bg-amber-500 text-white shadow-md' 
                                                    : 'text-slate-400 hover:text-white'
                                            }`}
                                        >
                                            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                                            Clôturés ({existingReports.filter(r => r.is_finalized).length})
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setReportViewFilter('all')}
                                            className={`px-3 py-1 rounded-lg transition-all ${
                                                reportViewFilter === 'all' 
                                                    ? 'bg-brand-500 text-white shadow-md' 
                                                    : 'text-slate-400 hover:text-white'
                                            }`}
                                        >
                                            Tous ({existingReports.length})
                                        </button>
                                    </div>
                                </div>
                                <p className="text-xs text-slate-400 font-medium mt-1.5">
                                    {reportViewFilter === 'active' ? currentT.active_desc : (reportViewFilter === 'closed' ? 'Sessions clôturées et archivées.' : 'Historique complet de toutes vos sessions créées.')}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => {
                                    setFormData(INITIAL_FORM);
                                    if (editId) navigate('/class-report');
                                }}
                                className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-brand-500/20 transition-all shrink-0"
                            >
                                <Plus size={16} /> {currentT.new_report_btn}
                            </button>
                        </div>

                        {/* List Grid */}
                        {((reportViewFilter === 'active' ? activeReports : (reportViewFilter === 'closed' ? existingReports.filter(r => r.is_finalized) : existingReports)).length === 0) ? (
                            <div className="text-center py-8 text-slate-500 text-xs font-bold">
                                Aucun rapport dans cette vue.
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {(reportViewFilter === 'active' ? activeReports : (reportViewFilter === 'closed' ? existingReports.filter(r => r.is_finalized) : existingReports)).map(rep => {
                                    const isCurrentEdit = String(rep.id) === String(editId);
                                    const collected = rep.submissions_count || 0;
                                    const rawTarget = Number(rep.questionnaires_collected);
                                    const rawPres = Number(rep.students_present) || 0;
                                    const rawRef = Number(rep.students_refused) || 0;
                                    const rawNoA = Number(rep.students_without_authorization) || 0;
                                    const target = (rawTarget > 0) ? rawTarget : Math.max(0, rawPres - rawRef - rawNoA);
                                    return (
                                        <div 
                                            key={rep.id} 
                                            className={`p-4 rounded-2xl border transition-all duration-300 flex flex-col justify-between ${
                                                isCurrentEdit 
                                                    ? 'bg-amber-500/10 border-amber-500/50 shadow-lg shadow-amber-500/10 ring-1 ring-amber-400' 
                                                    : 'bg-slate-950/80 border-slate-800 hover:border-slate-700 hover:bg-slate-950'
                                            }`}
                                        >
                                            <div>
                                                <div className="flex items-start justify-between gap-2 mb-2">
                                                    <h3 className="font-extrabold text-sm text-white line-clamp-1 flex items-center gap-1.5" title={rep.establishment_name}>
                                                        <Building2 size={15} className="text-brand-400 shrink-0" />
                                                        {rep.establishment_name || 'Établissement non précisé'}
                                                    </h3>
                                                    <div className="flex items-center gap-1.5">
                                                        {rep.is_finalized ? (
                                                            <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 border border-slate-700">
                                                                Clôturé
                                                            </span>
                                                        ) : (
                                                            <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                                                En cours
                                                            </span>
                                                        )}
                                                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-slate-800 text-brand-300 shrink-0">
                                                            #{rep.id}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-3 text-[11px] text-slate-400 font-medium mb-3">
                                                    <span className="flex items-center gap-1">
                                                        <School size={12} className="text-slate-500" />
                                                        {rep.study_level === '1_AS' ? '1ère AS' : '2ème AS'}
                                                    </span>
                                                    <span>•</span>
                                                    <span className="flex items-center gap-1">
                                                        <Calendar size={12} className="text-slate-500" />
                                                        {rep.report_date}
                                                    </span>
                                                    {rep.governorate_name && (
                                                        <>
                                                            <span>•</span>
                                                            <span className="text-slate-300 font-bold">{rep.governorate_name}</span>
                                                        </>
                                                    )}
                                                </div>

                                                {/* Progress indicator */}
                                                <div className="bg-slate-900/90 rounded-xl p-2.5 border border-slate-800/80 mb-3">
                                                    <div className="flex justify-between text-[10px] font-black uppercase tracking-wider mb-1">
                                                        <span className="text-slate-400">Questionnaires saisis</span>
                                                        <span className="text-brand-400 font-mono font-bold">
                                                            {collected} {target > 0 ? `/ ${target}` : ''}
                                                        </span>
                                                    </div>
                                                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                                        <div 
                                                            className={`h-full transition-all duration-500 ${rep.is_finalized ? 'bg-slate-600' : 'bg-gradient-to-r from-brand-500 to-emerald-400'}`}
                                                            style={{ width: `${target > 0 ? Math.min(100, (collected / target) * 100) : (collected > 0 ? 100 : 0)}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Action buttons */}
                                            <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        localStorage.setItem('sentinelle_active_report_id', String(rep.id));
                                                        navigate(`/session/${rep.id}/collect`);
                                                    }}
                                                    className="flex-1 py-2 px-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm"
                                                    title="Saisir ou consulter les questionnaires"
                                                >
                                                    <FileText size={13} /> {currentT.actions.continue_btn}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => navigate(`/class-report?edit=${rep.id}`)}
                                                    className="p-2 bg-slate-800 hover:bg-slate-700 text-amber-300 hover:text-white rounded-xl text-xs font-bold transition-all border border-slate-700"
                                                    title="Modifier les informations du rapport"
                                                >
                                                    <Pencil size={14} />
                                                </button>
                                                {rep.is_finalized ? (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleReopenReport(rep.id)}
                                                        className="p-2 bg-slate-800 hover:bg-emerald-500/20 text-slate-400 hover:text-emerald-400 rounded-xl text-xs font-bold transition-all border border-slate-700"
                                                        title="Rouvrir cette classe"
                                                    >
                                                        <RotateCcw size={14} />
                                                    </button>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        onClick={() => setFinalizingReport(rep)}
                                                        className="p-2 bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 rounded-xl text-xs font-bold transition-all border border-slate-700"
                                                        title="Clôturer cette classe définitivement"
                                                    >
                                                        <ShieldCheck size={14} />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* ─── EDIT MODE BANNER ──────────────────────────────────────── */}
                {editId && (
                    <div className="p-4 bg-amber-500/10 border border-amber-500/40 rounded-2xl flex items-center justify-between gap-4 animate-fade-in">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                                <Pencil size={18} />
                            </div>
                            <div>
                                <h4 className="text-sm font-black text-amber-300 uppercase tracking-tight">
                                    Mode Modification : Rapport #{editId} ({formData.establishment_name || 'Établissement'})
                                </h4>
                                <p className="text-xs text-slate-400 font-medium">
                                    Vos modifications s'appliqueront directement à cette session de classe.
                                </p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => {
                                setFormData(INITIAL_FORM);
                                navigate('/class-report');
                            }}
                            className="px-4 py-2 bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition-all"
                        >
                            Annuler l'édition
                        </button>
                    </div>
                )}

                {/* ─── FORM SECTION ─────────────────────────────────────────── */}
                <form onSubmit={handleSubmit} className="space-y-8">
                    
                    {/* SECTION 1: IDENTITY */}
                    <div className="bg-slate-900/50 border border-slate-800 p-6 md:p-8 rounded-3xl backdrop-blur-sm relative overflow-hidden group">
                        <div className="flex items-center justify-between mb-6 border-b border-slate-800 pb-4">
                            <div>
                                <h2 className="flex items-center gap-2.5 text-lg font-black text-white uppercase italic">
                                    <Building2 className="text-brand-500" size={22} />
                                    {currentT.sections.identity}
                                </h2>
                                <p className="text-xs text-slate-400 font-medium mt-1">
                                    Sélectionnez la région et le lycée concerné pour ce rapport spécifique.
                                </p>
                            </div>
                            {isEditMode && (
                                <button
                                    type="button"
                                    onClick={() => setAddingToSection('identity')}
                                    className="flex items-center gap-1 px-3 py-1.5 bg-brand-500/20 text-brand-300 border border-brand-500/40 rounded-xl text-xs font-bold hover:bg-brand-500/30"
                                >
                                    <Plus size={14} /> Ajouter une question
                                </button>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {getSectionFields('identity').map((field, idx, arr) => (
                                <div key={field.code} className={`space-y-2 p-3 rounded-2xl transition-all ${isEditMode ? 'bg-slate-950/80 border border-slate-800' : ''}`}>
                                    <div className="flex items-center justify-between">
                                        <label className="text-xs font-black uppercase tracking-tighter text-slate-300">
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
                                        (isPractitioner && userGovId) ? (
                                            <div className="w-full bg-slate-950/90 border border-brand-500/30 p-3.5 rounded-xl flex items-center justify-between">
                                                <div className="flex items-center gap-2.5">
                                                    <span className="w-2.5 h-2.5 rounded-full bg-brand-400"></span>
                                                    <span className="text-white font-bold text-sm">
                                                        {governorates.find(g => String(g.id) === String(formData.governorate || userGovId))?.name || (formData.governorate_name || 'Gouvernorat Assigné')}
                                                    </span>
                                                </div>
                                                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md bg-brand-500/20 text-brand-300 border border-brand-500/30">
                                                    {lang === 'ar' ? 'الولاية المعينة' : 'Région assignée'}
                                                </span>
                                            </div>
                                        ) : (
                                            <select 
                                                className="w-full bg-slate-950 border border-slate-800 p-3.5 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none text-white font-medium text-sm"
                                                value={formData.governorate}
                                                onChange={e => {
                                                    setFormData(prev => ({ 
                                                        ...prev, 
                                                        governorate: e.target.value, 
                                                        establishment: '', 
                                                        establishment_name: '' 
                                                    }));
                                                    setSuggestions([]);
                                                }}
                                                required
                                            >
                                                <option value="">-- {currentT.fields.governorate} --</option>
                                                {governorates.map(g => (
                                                    <option key={g.id} value={g.id}>{g.name}</option>
                                                ))}
                                            </select>
                                        )
                                    ) : field.code === 'establishment_name' ? (
                                        <div className="relative">
                                            <input 
                                                type="text"
                                                className="w-full bg-slate-950 border border-slate-800 p-3.5 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none text-white font-medium text-sm pr-10"
                                                placeholder="Tapez le nom ou choisissez dans la liste..."
                                                value={formData.establishment_name}
                                                onChange={handleEstablishmentChange}
                                                required
                                            />
                                            {formData.establishment_name && (
                                                <button
                                                    type="button"
                                                    onClick={() => setFormData(prev => ({ ...prev, establishment: '', establishment_name: '' }))}
                                                    className="absolute right-3 top-3.5 text-slate-500 hover:text-slate-300 p-0.5 rounded-full"
                                                    title="Effacer le nom"
                                                >
                                                    <X size={16} />
                                                </button>
                                            )}
                                            {suggestions.length > 0 && (
                                                <div className="absolute z-30 w-full mt-1 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden max-h-60 overflow-y-auto">
                                                    {suggestions.map(est => (
                                                        <div 
                                                            key={est.id} 
                                                            className="p-3.5 hover:bg-brand-500/20 cursor-pointer border-b border-slate-800/80 last:border-0 transition-colors" 
                                                            onClick={() => selectSuggestion(est)}
                                                        >
                                                            <div className="font-bold text-white text-sm">{est.name}</div>
                                                            <div className="text-xs text-brand-400 font-medium">{est.governorate_name}</div>
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

            {/* FINALIZE CONFIRMATION MODAL */}
            {finalizingReport && (
                <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl animate-fade-in">
                        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto">
                            <ShieldCheck size={28} />
                        </div>
                        <div className="text-center space-y-2">
                            <h3 className="text-lg font-black text-white uppercase italic tracking-tight">
                                Clôturer cette classe ?
                            </h3>
                            <p className="text-xs text-slate-300 font-medium">
                                Vous êtes sur le point de clôturer définitivement le rapport pour <span className="text-amber-300 font-bold">{finalizingReport.establishment_name}</span> ({finalizingReport.study_level === '1_AS' ? '1ère AS' : '2ème AS'}).
                            </p>
                            <p className="text-[11px] text-slate-500 font-medium">
                                Total de questionnaires enregistrés : <span className="font-bold text-brand-400">{finalizingReport.submissions_count || 0}</span>.
                            </p>
                        </div>
                        <div className="flex gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => setFinalizingReport(null)}
                                className="flex-1 py-3 bg-slate-950 border border-slate-800 hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-bold transition-all"
                            >
                                Annuler
                            </button>
                            <button
                                type="button"
                                onClick={() => handleFinalizeConfirm(finalizingReport.id)}
                                className="flex-1 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-lg shadow-amber-500/20"
                            >
                                Confirmer la clôture
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ClassReportPage;
