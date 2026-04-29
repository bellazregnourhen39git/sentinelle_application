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
    LogOut
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api';

const PractitionerGuide = ({ user }) => {
    const navigate = useNavigate();
    const [lang, setLang] = useState('fr');
    const role = user?.role?.toUpperCase();
    const isOperator = role === 'OPERATOR';
    const [activeReport, setActiveReport] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const handleLogout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
        window.location.href = '/';
    };

    const handleIgnore = async () => {
        if (!activeReport) return;
        
        // Finalize it so it doesn't show up again
        if (window.confirm(lang === 'fr' 
            ? "Voulez-vous vraiment ignorer ce rapport ? Il sera clôturé et vous ne pourrez plus y lier de nouveaux formulaires automatiquement."
            : "هل تريد حقًا تجاهل هذا التقرير؟ سيتم إغلاقه ولن تتمكن من ربط استمارات جديدة به تلقائيًا.")) {
            try {
                await api.post(`class-report/${activeReport.id}/finalize/`);
                setActiveReport(null);
            } catch (err) {
                console.error("Failed to finalize report", err);
                // Fallback to just hiding it in UI
                setActiveReport(null);
            }
        }
    };

    useEffect(() => {
        const fetchActiveReport = async () => {
            try {
                const response = await api.get('class-report/active/');
                console.log("Active report found:", response.data);
                if (response.data) setActiveReport(response.data);
            } catch (err) {
                console.log("No active report found or error fetching:", err);
                setActiveReport(null);
            } finally {
                setIsLoading(false);
            }
        };
        fetchActiveReport();
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

            <main className="max-w-5xl mx-auto px-6 py-16">
                {/* Active Session Alert (NEW) */}
                <AnimatePresence>
                    {activeReport && (
                        <motion.div 
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-12 bg-blue-600 rounded-[32px] p-8 text-white shadow-2xl shadow-blue-500/20 flex flex-col md:flex-row items-center justify-between gap-6"
                        >
                            <div className="flex items-center gap-6">
                                <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center">
                                    <RotateCw size={32} className="animate-spin-slow" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black italic uppercase tracking-tight">{currentT.resumeCard.title}</h3>
                                    <p className="text-blue-100 text-sm font-medium">
                                        {currentT.resumeCard.msg} <strong className="text-white font-black">{activeReport.establishment_name} ({activeReport.study_level})</strong>
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 w-full md:w-auto">
                                <button 
                                    onClick={() => navigate(`/session/${activeReport.id}/collect`)}
                                    className="flex-1 md:flex-none px-8 py-4 bg-white text-blue-600 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-blue-50 transition-colors shadow-lg"
                                >
                                    {currentT.resumeCard.btn}
                                </button>
                                <button 
                                    onClick={handleIgnore}
                                    className="px-4 py-4 bg-white/10 text-white rounded-2xl font-bold uppercase text-[10px] tracking-widest hover:bg-white/20 transition-colors"
                                >
                                    {currentT.resumeCard.ignore}
                                </button>
                            </div>
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
                                    {[1,2,3].map(i => (
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
                    {!activeReport && (
                        <button 
                            onClick={() => navigate('/class-report')}
                            className="w-full md:w-auto px-10 py-5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-black uppercase text-sm tracking-[2px] flex items-center justify-center gap-4 transition-all hover:scale-[1.02] active:scale-95 shadow-xl"
                        >
                            <PlusCircle size={20} />
                            {currentT.actions.start}
                        </button>
                    )}

                    {activeReport && (
                        <button 
                            onClick={() => navigate(`/session/${activeReport.id}/collect`)}
                            className="w-full md:w-auto px-10 py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black uppercase text-sm tracking-[2px] flex items-center justify-center gap-4 transition-all hover:scale-[1.02] active:scale-95 shadow-xl"
                        >
                            <PlayCircle size={20} />
                            {currentT.resumeCard.btn}
                        </button>
                    )}

                    <button 
                        onClick={() => navigate('/user')}
                        className="w-full md:w-auto px-10 py-5 bg-white border-2 border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl font-black uppercase text-sm tracking-[2px] flex items-center justify-center gap-4 transition-all"
                    >
                        <LayoutDashboard size={20} />
                        {currentT.actions.dashboard}
                    </button>
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
