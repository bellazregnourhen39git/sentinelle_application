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
    ShieldCheck
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const ClassReportPage = () => {
    const navigate = useNavigate();
    const [lang, setLang] = useState('fr');
    const [status, setStatus] = useState('idle');
    const [governorates, setGovernorates] = useState([]);
    const [establishments, setEstablishments] = useState([]);
    const [suggestions, setSuggestions] = useState([]);
    
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
        personal_comments: ''
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

    useEffect(() => {
        // Fetch governorates for the dropdown
        api.get('geography/governorates/').then(res => setGovernorates(res.data));
        // Fetch all establishments for the "extraction" logic
        api.get('geography/establishments/').then(res => setEstablishments(res.data));

        // Auto-fill from user profile
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
            const user = JSON.parse(savedUser);
            if (user.role === 'PRACTITIONER' || user.role === 'OPERATOR') {
                setFormData(prev => ({
                    ...prev,
                    establishment: user.establishment || '',
                    establishment_name: user.establishment_name || '',
                    governorate: user.governorate || ''
                }));
            }
        }
    }, []);

    const handleEstablishmentChange = (e) => {
        const val = e.target.value;
        setFormData({ ...formData, establishment_name: val });
        
        if (val.length > 2) {
            const matches = establishments.filter(est => 
                est.name.toLowerCase().includes(val.toLowerCase())
            ).slice(0, 5);
            setSuggestions(matches);
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
        
        // Clean data: convert empty strings for numbers to null
        const cleanedData = { ...formData };
        ['students_present', 'students_refused', 'students_absent', 'questionnaires_collected', 
         'planned_time_minutes', 'first_student_time_minutes', 'last_student_time_minutes',
         'students_without_authorization'].forEach(field => {
            if (cleanedData[field] === '') {
                cleanedData[field] = null;
            }
        });

        try {
            const res = await api.post('class-report/', cleanedData);
            setStatus('success');
            // Redirect to the Session Hub for this report
            setTimeout(() => navigate(`/session/${res.data.id}/collect`), 2000);
        } catch (err) {
            console.error(err);
            setStatus('error');
        }
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
                            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white uppercase italic">
                                {currentT.title}
                            </h1>
                            <p className="text-brand-400 font-bold text-xs uppercase tracking-widest">
                                {currentT.subtitle}
                            </p>
                        </div>
                    </div>
                    
                    <button 
                        onClick={() => setLang(lang === 'fr' ? 'ar' : 'fr')}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-brand-500/30 rounded-lg font-bold text-sm hover:border-brand-500 transition-all"
                    >
                        <Globe size={18} />
                        {lang === 'fr' ? 'العربية' : 'Français'}
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* SECTION 1: IDENTITY */}
                    <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl backdrop-blur-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                            <School size={80} />
                        </div>
                        <h2 className="flex items-center gap-2 text-lg font-bold text-white mb-6 border-b border-slate-800 pb-2">
                            <Building2 className="text-brand-500" size={20} />
                            {currentT.sections.identity}
                        </h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-tighter text-slate-400">{currentT.fields.governorate}</label>
                                <select 
                                    className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                                    value={formData.governorate}
                                    onChange={e => setFormData({...formData, governorate: e.target.value})}
                                    required
                                    disabled={formData.governorate !== '' && JSON.parse(localStorage.getItem('user'))?.role !== 'SUPER_ADMIN'}
                                >
                                    <option value="">-- {currentT.fields.governorate} --</option>
                                    {governorates.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                                </select>
                            </div>

                            <div className="space-y-2 relative">
                                <label className="text-xs font-black uppercase tracking-tighter text-slate-400">{currentT.fields.establishment}</label>
                                <input 
                                    type="text"
                                    className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none disabled:opacity-50"
                                    placeholder="..."
                                    value={formData.establishment_name}
                                    onChange={handleEstablishmentChange}
                                    required
                                    readOnly={formData.establishment !== '' && JSON.parse(localStorage.getItem('user'))?.role !== 'SUPER_ADMIN'}
                                />
                                {suggestions.length > 0 && (
                                    <div className="absolute z-10 w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden">
                                        {suggestions.map(est => (
                                            <div 
                                                key={est.id}
                                                className="p-3 hover:bg-brand-500/10 cursor-pointer text-sm border-b border-slate-800 last:border-0"
                                                onClick={() => selectSuggestion(est)}
                                            >
                                                <div className="font-bold text-white">{est.name}</div>
                                                <div className="text-xs text-slate-500">{est.governorate_name}</div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-tighter text-slate-400">{currentT.fields.type}</label>
                                <div className="grid grid-cols-2 gap-2">
                                    <button 
                                        type="button"
                                        className={`p-3 rounded-xl font-bold text-sm border transition-all ${formData.establishment_type === 'PUBLIC' ? 'bg-brand-500 border-brand-400 text-white shadow-lg shadow-brand-500/20' : 'bg-slate-950 border-slate-800 text-slate-500'}`}
                                        onClick={() => setFormData({...formData, establishment_type: 'PUBLIC'})}
                                    >
                                        {currentT.options.public}
                                    </button>
                                    <button 
                                        type="button"
                                        className={`p-3 rounded-xl font-bold text-sm border transition-all ${formData.establishment_type === 'PRIVATE' ? 'bg-brand-500 border-brand-400 text-white shadow-lg shadow-brand-500/20' : 'bg-slate-950 border-slate-800 text-slate-500'}`}
                                        onClick={() => setFormData({...formData, establishment_type: 'PRIVATE'})}
                                    >
                                        {currentT.options.private}
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-tighter text-slate-400">{currentT.fields.level}</label>
                                <div className="grid grid-cols-2 gap-2">
                                    <button 
                                        type="button"
                                        className={`p-3 rounded-xl font-bold text-sm border transition-all ${formData.study_level === '1_AS' ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-500'}`}
                                        onClick={() => setFormData({...formData, study_level: '1_AS'})}
                                    >
                                        {currentT.options.l1}
                                    </button>
                                    <button 
                                        type="button"
                                        className={`p-3 rounded-xl font-bold text-sm border transition-all ${formData.study_level === '2_AS' ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-500'}`}
                                        onClick={() => setFormData({...formData, study_level: '2_AS'})}
                                    >
                                        {currentT.options.l2}
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-tighter text-slate-400">{currentT.fields.date}</label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-3 text-slate-500" size={18} />
                                    <input 
                                        type="date"
                                        className="w-full bg-slate-950 border border-slate-800 p-3 pl-10 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
                                        value={formData.report_date}
                                        onChange={e => setFormData({...formData, report_date: e.target.value})}
                                        required
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* SECTION 2: STATS */}
                    <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl backdrop-blur-sm">
                        <h2 className="flex items-center gap-2 text-lg font-bold text-white mb-6 border-b border-slate-800 pb-2">
                            <Users className="text-blue-500" size={20} />
                            {currentT.sections.stats}
                        </h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-tighter text-slate-400">{currentT.fields.present}</label>
                                <input 
                                    type="number"
                                    className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl outline-none"
                                    value={formData.students_present}
                                    onChange={e => setFormData({...formData, students_present: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-tighter text-slate-400">{currentT.fields.refused}</label>
                                <input 
                                    type="number"
                                    className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl outline-none"
                                    value={formData.students_refused}
                                    onChange={e => setFormData({...formData, students_refused: e.target.value})}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-tighter text-slate-400">{currentT.fields.absent}</label>
                                <input 
                                    type="number"
                                    className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl outline-none"
                                    value={formData.students_absent}
                                    onChange={e => setFormData({...formData, students_absent: e.target.value})}
                                />
                            </div>

                            <div className="md:col-span-2 p-4 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <ShieldCheck className="text-brand-500" />
                                    <span className="text-sm font-bold">{currentT.fields.auth_req}</span>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        className="sr-only peer"
                                        checked={formData.parental_authorization_required}
                                        onChange={e => setFormData({...formData, parental_authorization_required: e.target.checked})}
                                    />
                                    <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-600"></div>
                                </label>
                            </div>

                            {formData.parental_authorization_required && (
                                <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                                    <label className="text-xs font-black uppercase tracking-tighter text-brand-400">{currentT.fields.no_auth}</label>
                                    <input 
                                        type="number"
                                        className="w-full bg-slate-950 border border-brand-500/30 p-3 rounded-xl outline-none focus:border-brand-500"
                                        value={formData.students_without_authorization}
                                        onChange={e => setFormData({...formData, students_without_authorization: e.target.value})}
                                    />
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-tighter text-amber-500">{currentT.fields.collected}</label>
                                <input 
                                    type="number"
                                    className="w-full bg-slate-950 border border-amber-500/30 p-3 rounded-xl outline-none focus:border-amber-500 font-black text-xl text-amber-500"
                                    value={formData.questionnaires_collected}
                                    onChange={e => setFormData({...formData, questionnaires_collected: e.target.value})}
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    {/* SECTION 3: OBSERVATIONS */}
                    <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl backdrop-blur-sm">
                        <h2 className="flex items-center gap-2 text-lg font-bold text-white mb-6 border-b border-slate-800 pb-2">
                            <AlertCircle className="text-red-500" size={20} />
                            {currentT.sections.observations}
                        </h2>
                        
                        <div className="space-y-6">
                            {[
                                { field: 'perturbations', label: currentT.fields.perturbations, options: [
                                    {v: 1, l: currentT.options.none}, {v: 2, l: currentT.options.few}, {v: 3, l: currentT.options.many}
                                ]},
                                { field: 'serious_work', label: currentT.fields.serious, options: [
                                    {v: 1, l: currentT.options.all}, {v: 2, l: currentT.options.majority}, {v: 3, l: currentT.options.half}
                                ]},
                                { field: 'difficulty_level', label: currentT.fields.difficulty, options: [
                                    {v: 1, l: currentT.options.easy}, {v: 2, l: currentT.options.neutral}, {v: 3, l: currentT.options.hard}
                                ]}
                            ].map(group => (
                                <div key={group.field} className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-tighter text-slate-400">{group.label}</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {group.options.map(opt => (
                                            <button 
                                                key={opt.v}
                                                type="button"
                                                className={`p-3 rounded-xl font-bold text-xs border transition-all ${formData[group.field] === opt.v ? 'bg-slate-700 border-slate-400 text-white' : 'bg-slate-950 border-slate-800 text-slate-600'}`}
                                                onClick={() => setFormData({...formData, [group.field]: opt.v})}
                                            >
                                                {opt.l}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* SECTION 4: TIMING */}
                    <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl backdrop-blur-sm">
                        <h2 className="flex items-center gap-2 text-lg font-bold text-white mb-6 border-b border-slate-800 pb-2">
                            <Clock className="text-purple-500" size={20} />
                            {currentT.sections.timing}
                        </h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-tighter text-slate-400">{currentT.fields.planned_time}</label>
                                <input 
                                    type="number"
                                    className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl outline-none"
                                    value={formData.planned_time_minutes}
                                    onChange={e => setFormData({...formData, planned_time_minutes: e.target.value})}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-tighter text-slate-400">{currentT.fields.first_time}</label>
                                <input 
                                    type="number"
                                    className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl outline-none"
                                    value={formData.first_student_time_minutes}
                                    onChange={e => setFormData({...formData, first_student_time_minutes: e.target.value})}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-tighter text-slate-400">{currentT.fields.last_time}</label>
                                <input 
                                    type="number"
                                    className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl outline-none"
                                    value={formData.last_student_time_minutes}
                                    onChange={e => setFormData({...formData, last_student_time_minutes: e.target.value})}
                                />
                            </div>
                        </div>
                    </div>

                    {/* SECTION 5: COMMENTS */}
                    <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl backdrop-blur-sm">
                        <h2 className="flex items-center gap-2 text-lg font-bold text-white mb-6 border-b border-slate-800 pb-2">
                            <MessageSquare className="text-brand-500" size={20} />
                            {currentT.sections.comments}
                        </h2>
                        <textarea 
                            className="w-full bg-slate-950 border border-slate-800 p-4 rounded-xl outline-none min-h-[120px] focus:ring-2 focus:ring-brand-500"
                            placeholder="..."
                            value={formData.personal_comments}
                            onChange={e => setFormData({...formData, personal_comments: e.target.value})}
                        ></textarea>
                    </div>

                    {/* SUBMIT */}
                    <div className="sticky bottom-4 z-20">
                        <button 
                            disabled={status === 'submitting'}
                            className={`w-full py-4 rounded-2xl font-black text-lg uppercase tracking-widest transition-all flex items-center justify-center gap-3 shadow-2xl ${
                                status === 'success' ? 'bg-emerald-600' :
                                status === 'error' ? 'bg-red-600' :
                                'bg-brand-600 hover:bg-brand-500 hover:scale-[1.01] active:scale-[0.99]'
                            }`}
                        >
                            {status === 'submitting' ? <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div> : 
                             status === 'success' ? <CheckCircle2 /> : 
                             status === 'error' ? <AlertCircle /> : null}
                            
                            {status === 'success' ? currentT.actions.success :
                             status === 'error' ? currentT.actions.error :
                             currentT.actions.submit}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ClassReportPage;
