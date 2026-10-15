import React, { useState, useEffect } from 'react';
import {
    ShieldCheck,
    ClipboardList,
    Scan,
    FileText,
    BarChart3,
    ArrowRight,
    Globe,
    HelpCircle,
    CheckCircle2,
    BookOpen,
    LayoutDashboard,
    Zap,
    RotateCw,
    Link as LinkIcon,
    ArrowDown,
    PlusCircle,
    PlayCircle,
    LogOut,
    Building2,
    School,
    Calendar,
    Pencil,
    Plus
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api';

const PractitionerGuide = ({ user }) => {
    const navigate = useNavigate();
    const [lang, setLang] = useState('fr');
    const localUser = JSON.parse(localStorage.getItem('user') || '{}');
    const currentUser = user || localUser;
    const role = currentUser?.role?.toUpperCase();
    const isOperator = role === 'OPERATOR';
    const [activeReports, setActiveReports] = useState([]);
    const [closedReports, setClosedReports] = useState([]);
    const [reportTab, setReportTab] = useState('active'); // 'active' | 'closed'
    const [isLoading, setIsLoading] = useState(true);

    const handleLogout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
        window.location.href = '/';
    };

    const fetchReports = async () => {
        try {
            const [activeRes, closedRes] = await Promise.all([
                api.get('class-report/list/?is_finalized=false'),
                api.get('class-report/list/?is_finalized=true')
            ]);
            setActiveReports(Array.isArray(activeRes.data) ? activeRes.data : (activeRes.data?.results || []));
            setClosedReports(Array.isArray(closedRes.data) ? closedRes.data : (closedRes.data?.results || []));
        } catch (err) {
            console.log("Error fetching reports:", err);
            setActiveReports([]);
            setClosedReports([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleFinalizeReport = async (reportId) => {
        if (window.confirm(lang === 'fr'
            ? "Voulez-vous vraiment clôturer cette session de classe ?"
            : "هل تريد حقًا إغلاق هذه الحصة بشكل نهائي؟")) {
            try {
                await api.post(`class-report/${reportId}/finalize/`);
                fetchReports();
            } catch (err) {
                console.error("Failed to finalize report", err);
            }
        }
    };

    const handleReopenReport = async (reportId) => {
        try {
            await api.post(`class-report/${reportId}/finalize/`, { action: 'unfinalize', is_finalized: false });
            fetchReports();
        } catch (err) {
            console.error("Failed to reopen report", err);
        }
    };

    useEffect(() => {
        fetchReports();
    }, []);

    const t = {
        fr: {
            welcome: "Guide des Procédures Administratives",
            subtitle: "Méthodologie de Collecte et Liaison des Données MedSPAD",
            roleLabel: isOperator ? "Rôle : Opérateur" : "Rôle : Praticien",
            guideTitle: "Manuel de Procédure",
            processTitle: "Le Processus de Liaison (Tethering)",
            processSubtitle: "Comprendre comment les questionnaires sont rattachés aux classes",
            logicHeader: "Gestion des Sessions : Sauvegarde & Reprise",
            logicDesc: "Le système est conçu pour la flexibilité. Vous pouvez interrompre une session de saisie et la reprendre à tout moment sans perdre le lien avec la classe.",
            steps: [
                {
                    title: "Ouverture du Rapport",
                    subtitle: "L'Ancre Administrative",
                    desc: "Avant toute chose, vous créez un 'Rapport de Classe'. Ce document définit l'établissement et la classe.",
                    logic: "Tant que vous ne créez pas de nouveau rapport, tout ce que vous saisissez sera lié à celui-ci.",
                    icon: <ClipboardList className="text-slate-700" size={24} />
                },
                {
                    title: "Saisie & Interruption",
                    subtitle: "Reprise Automatique",
                    desc: "Si vous saisissez 10 élèves et que vous devez partir, fermez simplement l'application.",
                    logic: "À votre retour, le système vous proposera de continuer la saisie pour cette même classe.",
                    icon: <PlayCircle className="text-blue-600" size={24} />
                },
                {
                    title: "Finalisation de Classe",
                    subtitle: "Clôture Administrative",
                    desc: "Une fois tous les formulaires de la classe saisis, vous validez l'ensemble de la session.",
                    logic: "C'est seulement à ce moment que vous considérez la classe comme 'terminée' dans le système.",
                    icon: <CheckCircle2 className="text-emerald-600" size={24} />
                },
                {
                    title: "Nouvelle Classe",
                    subtitle: "Nouvelle Itération",
                    desc: "Pour passer à la classe suivante, cliquez sur 'Nouveau Rapport'. Cela crée une nouvelle ancre.",
                    logic: "Le cycle recommence : Nouveau Rapport -> Saisie -> Clôture.",
                    icon: <PlusCircle className="text-indigo-600" size={24} />
                }
            ],
            visualLabel: "Schéma de Liaison Administrative",
            visualParent: "Rapport de Classe (Parent)",
            visualChild: "Questionnaires (Enfants)",
            visualIteration: "Itération : Nouvelle Classe",
            resumeCard: {
                title: "Session en Cours Détectée",
                msg: "Vous avez un rapport actif pour :",
                btn: "Continuer la Saisie",
                ignore: "Ignorer et Nouveau Rapport"
            },
            actions: {
                start: "Créer un Nouveau Rapport",
                dashboard: "Accéder au Tableau de Bord",
                back: "Retour",
                logout: "Déconnexion"
            }
        },
        ar: {
            welcome: "دليل الإجراءات الإدارية",
            subtitle: "منهجية جمع وربط بيانات MedSPAD",
            roleLabel: isOperator ? "الدور : عون" : "الدور : ممارس",
            guideTitle: "دليل الإجراءات",
            processTitle: "عملية الربط (Tethering)",
            processSubtitle: "فهم كيفية ربط الاستبيانات بالأقسام",
            logicHeader: "إدارة الحصص: الحفظ والاستئناف",
            logicDesc: "تم تصميم النظام للمرونة. يمكنك إيقاف حصة الإدخال واستئنافها في أي وقت دون فقدان الارتباط بالقسم.",
            steps: [
                {
                    title: "فتح التقرير",
                    subtitle: "المرساة الإدارية",
                    desc: "قبل كل شيء، تقوم بإنشاء 'تقرير قسم'. تحدد هذه الوثيقة المؤسسة والقسم.",
                    logic: "طالما لم تنشئ تقريراً جديداً، فإن كل ما تدخله سيرتبط بهذا التقرير.",
                    icon: <ClipboardList className="text-slate-700" size={24} />
                },
                {
                    title: "الإدخال والتوقف",
                    subtitle: "استئناف تلقائي",
                    desc: "إذا أدخلت بيانات 10 تلاميذ واضطررت للمغادرة، فما عليك سوى إغلاق التطبيق.",
                    logic: "عند عودتك، سيقترح عليك النظام مواصلة الإدخال لنفس القسم.",
                    icon: <PlayCircle className="text-blue-600" size={24} />
                },
                {
                    title: "ختم القسم",
                    subtitle: "الإنهاء الإداري",
                    desc: "بمجرد إدخال جميع استمارات القسم، تقوم بالمصادقة على الحصة كاملة.",
                    logic: "فقط في هذه اللحظة تعتبر القسم 'منتهياً' في النظام.",
                    icon: <CheckCircle2 className="text-emerald-600" size={24} />
                },
                {
                    title: "قسم جديد",
                    subtitle: "تكرار العملية",
                    desc: "للانتقال إلى القسم الموالي، انقر على 'تقرير جديد'. هذا ينشئ مرساة جديدة.",
                    logic: "تبدأ الدورة من جديد: تقرير جديد -> إدخال -> ختم.",
                    icon: <PlusCircle className="text-indigo-600" size={24} />
                }
            ],
            visualLabel: "مخطط الربط الإداري",
            visualParent: "تقرير القسم (الأصل)",
            visualChild: "الاستبيانات (الفروع)",
            visualIteration: "تكرار: قسم جديد",
            resumeCard: {
                title: "تم اكتشاف حصة جارية",
                msg: "لديك تقرير نشط لـ :",
                btn: "واصل الإدخال",
                ignore: "تجاهل وتقرير جديد"
            },
            actions: {
                start: "إنشاء تقرير جديد",
                dashboard: "الذهاب إلى لوحة القيادة",
                back: "رجوع",
                logout: "تسجيل الخروج"
            }
        }
    };

    const currentT = t[lang];

    return (
        <div className={`min-h-screen bg-slate-50 text-slate-900 font-sans ${lang === 'ar' ? 'rtl' : 'ltr'}`} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
            {/* Professional Header */}
            <nav className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between sticky top-0 z-50 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center text-white">
                        <FileText size={22} />
                    </div>
                    <div>
                        <h1 className="text-lg font-black uppercase tracking-tight leading-none text-slate-900">Sentinelle</h1>
                        <p className="text-[10px] font-bold uppercase text-slate-500 tracking-widest">{currentT.roleLabel}</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {!isOperator && (
                        <button
                            onClick={() => navigate('/user')}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-md font-black text-[10px] uppercase tracking-widest transition-all border border-blue-100 shadow-sm"
                        >
                            <LayoutDashboard size={14} />
                            {currentT.actions.dashboard}
                        </button>
                    )}
                    <button
                        onClick={() => setLang(lang === 'fr' ? 'ar' : 'fr')}
                        className="flex items-center gap-2 px-4 py-2 hover:bg-slate-100 rounded-md font-bold text-xs transition-colors border border-slate-200 text-slate-600"
                    >
                        <Globe size={16} />
                        {lang === 'fr' ? 'العربية' : 'Français'}
                    </button>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-4 py-2 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-md font-black text-[10px] uppercase tracking-widest transition-all border border-rose-100 shadow-sm"
                    >
                        <LogOut size={14} />
                        {currentT.actions.logout}
                    </button>
                </div>
            </nav>

            <main className="max-w-5xl mx-auto px-6 py-12">
                {/* Multi-School Sessions Hub (Active & Closed History) */}
                <AnimatePresence>
                    {(activeReports.length > 0 || closedReports.length > 0) && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-12 bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950 rounded-[36px] p-8 text-white shadow-2xl border border-blue-500/30 relative overflow-hidden"
                        >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-800">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-blue-500/20 border border-blue-400/30 rounded-2xl flex items-center justify-center text-blue-400">
                                        <RotateCw size={24} className={reportTab === 'active' ? "animate-spin-slow" : ""} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black italic uppercase tracking-tight flex items-center gap-2">
                                            {reportTab === 'active'
                                                ? (lang === 'fr' ? 'Sessions de Classe en Cours' : 'حصص الأقسام المفتوحة')
                                                : (lang === 'fr' ? 'Historique des Rapports Clôturés' : 'سجل الحصص المغلقة')}
                                            <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${reportTab === 'active' ? 'bg-blue-500/30 text-blue-300' : 'bg-amber-500/30 text-amber-300'}`}>
                                                {reportTab === 'active' ? activeReports.length : closedReports.length}
                                            </span>
                                        </h3>
                                        <p className="text-slate-400 text-xs font-medium mt-0.5">
                                            {reportTab === 'active'
                                                ? (lang === 'fr' ? 'Vos enquêtes terrain actives sont prêtes pour la saisie ou la reprise.' : 'حصص الاستبيان الميدانية النشطة جاهزة للإدخال أو الاستئناف.')
                                                : (lang === 'fr' ? 'Consultez les questionnaires saisis ou réouvrez une session pour modification.' : 'استعرض الاستمارات المسجلة أو أعد فتح الحصة للتعديل.')}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    {/* Tab Toggle Buttons */}
                                    <div className="flex bg-slate-950/80 p-1 rounded-xl border border-slate-800">
                                        <button
                                            onClick={() => setReportTab('active')}
                                            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${reportTab === 'active' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
                                        >
                                            <PlayCircle size={13} />
                                            {lang === 'fr' ? 'En cours' : 'جارية'} ({activeReports.length})
                                        </button>
                                        <button
                                            onClick={() => setReportTab('closed')}
                                            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${reportTab === 'closed' ? 'bg-amber-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
                                        >
                                            <CheckCircle2 size={13} />
                                            {lang === 'fr' ? 'Clôturés' : 'مغلقة'} ({closedReports.length})
                                        </button>
                                    </div>

                                    <button
                                        onClick={() => navigate('/class-report')}
                                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-xs uppercase tracking-wider shadow-lg shadow-blue-500/20 transition-all shrink-0"
                                    >
                                        <Plus size={15} />
                                        {lang === 'fr' ? 'Nouveau' : 'جديد'}
                                    </button>
                                </div>
                            </div>

                            {/* Reports Grid */}
                            {((reportTab === 'active' ? activeReports : closedReports).length === 0) ? (
                                <div className="py-12 text-center text-slate-500 text-xs font-bold uppercase tracking-wider">
                                    {reportTab === 'active'
                                        ? (lang === 'fr' ? 'Aucune session active en cours' : 'لا توجد حصص نشطة حالياً')
                                        : (lang === 'fr' ? 'Aucun rapport clôturé dans l’historique' : 'لا توجد حصص مغلقة في السجل')}
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {(reportTab === 'active' ? activeReports : closedReports).map(rep => {
                                        const collected = rep.submissions_count || 0;
                                        const rawTarget = Number(rep.questionnaires_collected);
                                        const rawPres = Number(rep.students_present) || 0;
                                        const rawRef = Number(rep.students_refused) || 0;
                                        const rawNoA = Number(rep.students_without_authorization) || 0;
                                        const target = (rawTarget > 0) ? rawTarget : Math.max(0, rawPres - rawRef - rawNoA);
                                        const isClosed = rep.is_finalized;

                                        return (
                                            <div
                                                key={rep.id}
                                                className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${isClosed ? 'bg-slate-950/60 border-slate-800/80 hover:border-amber-500/50' : 'bg-slate-950/80 border-slate-800 hover:border-blue-500/50'}`}
                                            >
                                                <div>
                                                    <div className="flex items-start justify-between gap-2 mb-1.5">
                                                        <h4 className="font-extrabold text-sm text-white line-clamp-1 flex items-center gap-1.5" title={rep.establishment_name}>
                                                            <Building2 size={15} className={isClosed ? "text-amber-400 shrink-0" : "text-blue-400 shrink-0"} />
                                                            {rep.establishment_name || 'Lycée'}
                                                        </h4>
                                                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md shrink-0 ${isClosed ? 'bg-amber-950/60 text-amber-300 border border-amber-800/40' : 'bg-slate-800 text-blue-300'}`}>
                                                            #{rep.id}
                                                        </span>
                                                    </div>

                                                    <div className="flex items-center gap-2 text-[11px] text-slate-400 font-medium mb-3">
                                                        <span>{rep.study_level === '1_AS' ? '1ère AS' : '2ème AS'}</span>
                                                        <span>•</span>
                                                        <span>{rep.report_date}</span>
                                                        {rep.governorate_name && (
                                                            <>
                                                                <span>•</span>
                                                                <span className="text-slate-300 font-bold">{rep.governorate_name}</span>
                                                            </>
                                                        )}
                                                        {isClosed && (
                                                            <span className="ml-auto text-[9px] font-bold text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded">
                                                                {lang === 'fr' ? 'Clôturé' : 'مغلق'}
                                                            </span>
                                                        )}
                                                    </div>

                                                    <div className="bg-slate-900 rounded-xl p-2.5 border border-slate-800/80 mb-3">
                                                        <div className="flex justify-between text-[10px] font-black uppercase tracking-wider mb-1">
                                                            <span className="text-slate-400">{lang === 'fr' ? 'Questionnaires saisis' : 'الاستمارات المسجلة'}</span>
                                                            <span className={isClosed ? "text-amber-400 font-mono font-bold" : "text-blue-400 font-mono font-bold"}>
                                                                {collected} {target > 0 ? `/ ${target}` : ''}
                                                            </span>
                                                        </div>
                                                        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                                            <div
                                                                className={`h-full ${isClosed ? 'bg-gradient-to-r from-amber-500 to-emerald-400' : 'bg-gradient-to-r from-blue-500 to-emerald-400'}`}
                                                                style={{ width: `${target > 0 ? Math.min(100, (collected / target) * 100) : (collected > 0 ? 100 : 0)}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80">
                                                    <button
                                                        onClick={() => navigate(`/session/${rep.id}/collect`)}
                                                        className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all text-white ${isClosed ? 'bg-slate-800 hover:bg-slate-700' : 'bg-blue-600 hover:bg-blue-500'}`}
                                                    >
                                                        <FileText size={13} />
                                                        {isClosed ? (lang === 'fr' ? 'Inspecter' : 'معاينة') : (lang === 'fr' ? 'Saisie' : 'إدخال')}
                                                    </button>
                                                    <button
                                                        onClick={() => navigate(`/class-report?edit=${rep.id}`)}
                                                        className="p-2 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-xl text-xs font-bold transition-all border border-slate-700"
                                                        title={lang === 'fr' ? 'Modifier' : 'تعديل'}
                                                    >
                                                        <Pencil size={13} />
                                                    </button>
                                                    {isClosed ? (
                                                        <button
                                                            onClick={() => handleReopenReport(rep.id)}
                                                            className="p-2 bg-slate-800 hover:bg-emerald-600 text-emerald-400 hover:text-white rounded-xl text-xs font-bold transition-all border border-slate-700"
                                                            title={lang === 'fr' ? 'Réouvrir la session' : 'إعادة فتح الحصة'}
                                                        >
                                                            <RotateCw size={13} />
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => handleFinalizeReport(rep.id)}
                                                            className="p-2 bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 rounded-xl text-xs font-bold transition-all border border-slate-700"
                                                            title={lang === 'fr' ? 'Clôturer' : 'إغلاق'}
                                                        >
                                                            <ShieldCheck size={13} />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Hero / Context */}
                <header className="mb-16 border-b border-slate-200 pb-12">
                    <div className="flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-[3px] mb-4">
                        <BookOpen size={14} />
                        {currentT.guideTitle}
                    </div>
                    <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-4">
                        {currentT.welcome}
                    </h2>
                    <p className="text-slate-500 text-lg max-w-3xl leading-relaxed italic">
                        {currentT.subtitle}
                    </p>
                </header>

                {/* The logic explanation */}
                <div className="bg-white border border-slate-200 rounded-3xl p-8 md:p-12 mb-16 shadow-sm">
                    <div className="flex flex-col md:flex-row gap-12 items-center">
                        <div className="flex-1">
                            <h3 className="text-2xl font-black text-slate-900 mb-4">{currentT.logicHeader}</h3>
                            <p className="text-slate-600 leading-relaxed mb-6">
                                {currentT.logicDesc}
                            </p>
                            <div className="space-y-4">
                                <div className="flex items-start gap-4 p-4 bg-emerald-50 border-l-4 border-emerald-500 rounded-r-xl">
                                    <CheckCircle2 size={20} className="text-emerald-600 shrink-0 mt-1" />
                                    <p className="text-sm font-medium text-emerald-900">
                                        {lang === 'fr'
                                            ? "Pas besoin de recommencer un rapport si vous revenez sur une classe non terminée. Reprenez simplement là où vous vous étiez arrêté."
                                            : "لا حاجة لبدء تقرير جديد إذا عدت لقسم لم ينتهِ بعد. واصل ببساطة من حيث توقفت."}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Visual Schema Component */}
                        <div className="w-full md:w-80 bg-slate-50 border border-slate-200 rounded-2xl p-6 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-slate-900" />
                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-6 text-center">{currentT.visualLabel}</p>

                            <div className="flex flex-col items-center gap-4">
                                <div className="w-full py-3 bg-white border border-slate-300 rounded-lg flex items-center justify-center gap-2 shadow-sm">
                                    <ClipboardList size={16} className="text-slate-900" />
                                    <span className="text-[10px] font-bold uppercase">{currentT.visualParent}</span>
                                </div>
                                <ArrowDown size={16} className="text-slate-300" />
                                <div className="grid grid-cols-3 gap-2 w-full">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="py-2 bg-blue-100 border border-blue-200 rounded flex items-center justify-center">
                                            <FileText size={12} className="text-blue-600" />
                                        </div>
                                    ))}
                                </div>
                                <p className="text-[8px] font-bold text-slate-400 uppercase">{currentT.visualChild}</p>

                                <div className="w-full border-t border-dashed border-slate-200 my-2" />

                                <div className="w-full py-3 bg-slate-200 border border-slate-300 rounded-lg flex items-center justify-center gap-2 opacity-50 italic">
                                    <PlusCircle size={16} />
                                    <span className="text-[10px] font-bold uppercase">{currentT.visualIteration}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Steps Section */}
                <div className="mb-16">
                    <div className="mb-10">
                        <h3 className="text-2xl font-black text-slate-900 mb-2">{currentT.processTitle}</h3>
                        <p className="text-slate-500 font-medium">{currentT.processSubtitle}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {currentT.steps.map((step, idx) => (
                            <div key={idx} className="bg-white border border-slate-200 p-8 rounded-2xl flex gap-6 hover:border-slate-400 transition-colors">
                                <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center shrink-0 border border-slate-100">
                                    {step.icon}
                                </div>
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="text-xs font-black text-slate-400">0{idx + 1}</span>
                                        <h4 className="text-lg font-black text-slate-900">{step.title}</h4>
                                    </div>
                                    <p className="text-sm font-bold text-slate-500 mb-4">{step.subtitle}</p>
                                    <p className="text-sm text-slate-600 leading-relaxed mb-4">
                                        {step.desc}
                                    </p>
                                    <div className="p-3 bg-slate-50 rounded-lg text-xs text-slate-500 font-medium italic border border-slate-100">
                                        {step.logic}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Final Call to Action */}
                <div className="flex flex-col md:flex-row items-center justify-center gap-6 border-t border-slate-200 pt-16">
                    <button
                        onClick={() => navigate('/class-report')}
                        className="w-full md:w-auto px-10 py-5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-black uppercase text-sm tracking-[2px] flex items-center justify-center gap-4 transition-all hover:scale-[1.02] active:scale-95 shadow-xl"
                    >
                        <PlusCircle size={20} />
                        {currentT.actions.start}
                    </button>

                    {!isOperator && (
                        <button
                            onClick={() => navigate('/user')}
                            className="w-full md:w-auto px-10 py-5 bg-white border-2 border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl font-black uppercase text-sm tracking-[2px] flex items-center justify-center gap-4 transition-all"
                        >
                            <LayoutDashboard size={20} />
                            {currentT.actions.dashboard}
                        </button>
                    )}
                </div>
            </main>

            <footer className="py-12 text-center border-t border-slate-200">
                <p className="text-[10px] font-black uppercase tracking-[8px] text-slate-400">Sentinelle · Procédures Officielles · MedSPAD 2026</p>
            </footer>

            <style>{`
                @keyframes spin-slow {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .animate-spin-slow {
                    animation: spin-slow 8s linear infinite;
                }
            `}</style>
        </div>
    );
};

export default PractitionerGuide;
