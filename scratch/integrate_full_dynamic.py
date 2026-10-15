import sys
import os
import re

sys.stdout.reconfigure(encoding='utf-8')

with open('scratch/merged_header_constants.js', 'r', encoding='utf-8') as f:
    header = f.read()

# Let's inspect the complete QuestionnaireForm component with dynamic sections handling
component_code = r'''
const QuestionnaireForm = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const reportIdParam = searchParams.get('report_id');
  const urlEditMode = searchParams.get('edit') === 'true';

  const [step, setStep] = useState(0);
  const [data, setData] = useState(INITIAL_DATA);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState({ loading: false, success: false, error: null });
  const [lang, setLang] = useState('fr');
  const [currentUser, setCurrentUser] = useState(null);

  // Dynamic Questions config & modal state
  const [dynamicConfigs, setDynamicConfigs] = useState([]);
  const [isEditMode, setIsEditMode] = useState(urlEditMode);
  const [editingItem, setEditingItem] = useState(null);
  const [modalError, setModalError] = useState(null);

  // Class report selection & finalization
  const [openReports, setOpenReports] = useState([]);
  const [loadingReports, setLoadingReports] = useState(false);
  const [activeReport, setActiveReport] = useState(null);
  const [showFinalizeModal, setShowFinalizeModal] = useState(false);

  // Dynamic answers
  const [extraAnswers, setExtraAnswers] = useState({});

  // Location modal for users without fixed establishment
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [operatorGovId, setOperatorGovId] = useState(null);
  const [operatorEstId, setOperatorEstId] = useState(null);

  const isRTL = lang === 'ar';
  const isAdmin = currentUser?.role === 'SUPER_ADMIN' || currentUser?.role === 'ADMIN' || currentUser?.is_superuser;

  useEffect(() => {
    fetchCurrentUser();
    fetchConfig();
    if (reportIdParam) {
      fetchReport(reportIdParam);
    } else {
      fetchOpenReports();
    }
  }, [reportIdParam]);

  const fetchCurrentUser = async () => {
    try {
      const res = await api.get('users/me/');
      setCurrentUser(res.data);
    } catch (err) {
      console.error('Failed to load current user', err);
    }
  };

  const fetchConfig = async () => {
    try {
      const res = await api.get('dynamic-questions/');
      setDynamicConfigs(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Failed to load dynamic question configs', err);
    }
  };

  const fetchOpenReports = async () => {
    setLoadingReports(true);
    try {
      const res = await api.get('class-reports/');
      const list = Array.isArray(res.data) ? res.data : res.data.results || [];
      const open = list.filter((r) => !r.is_finalized);
      setOpenReports(open);
      if (open.length === 1) {
        setActiveReport(open[0]);
      }
    } catch (err) {
      console.error('Failed to load open class reports', err);
    } finally {
      setLoadingReports(false);
    }
  };

  const fetchReport = async (id) => {
    try {
      const res = await api.get(`class-reports/${id}/`);
      setActiveReport(res.data);
    } catch (err) {
      console.error('Failed to load class report', err);
    }
  };

  const handleChange = (section) => (e) => {
    const { name, value } = e.target;
    setData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [name]: value,
      },
    }));
  };

  const update = (section, key, value) => {
    setData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value,
      },
    }));
  };

  const updateCheck = (section, group, key, value) => {
    setData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [group]: {
          ...(prev[section][group] || {}),
          [key]: value,
        },
      },
    }));
  };

  const handleFinalize = async () => {
    if (!activeReport) return;
    try {
      await api.post(`class-reports/${activeReport.id}/finalize/`);
      setShowFinalizeModal(false);
      navigate('/dashboard/reports');
    } catch (err) {
      console.error('Error finalizing report:', err);
    }
  };

  const handleDeleteDynamic = async (code, type) => {
    if (!window.confirm(isRTL ? 'تأكيد الحذف؟' : 'Confirmer la suppression ?')) return;
    try {
      await api.delete(`dynamic-questions/${code}/`);
      fetchConfig();
    } catch (err) {
      console.error('Error deleting question', err);
    }
  };

  const handleSubmit = async (overrideGovId, overrideEstId) => {
    const needsLocation = currentUser && !currentUser.establishment && !activeReport;
    if (needsLocation && (!overrideGovId || !overrideEstId)) {
      setIsLocationModalOpen(true);
      return;
    }

    setStatus({ loading: true, success: false, error: null });

    try {
      const payload = {
        ...data,
        language_used: lang === 'ar' ? 'AR' : 'FR',
        class_report_id: activeReport ? activeReport.id : null,
        extra_answers: extraAnswers,
      };

      if (overrideGovId) payload.governorate_id = overrideGovId;
      if (overrideEstId) payload.school_id = overrideEstId;

      await api.post('questionnaire-sessions/', payload);

      setStatus({ loading: false, success: true, error: null });
      setTimeout(() => {
        if (activeReport) {
          setShowFinalizeModal(true);
        } else {
          navigate('/dashboard');
        }
      }, 1000);
    } catch (err) {
      console.error('Submission failed', err);
      const errMsg = err.response?.data?.detail || err.response?.data?.message || 'Une erreur est survenue lors de l’enregistrement.';
      setStatus({ loading: false, success: false, error: errMsg });
    }
  };

  const renderDynamicQuestionCard = (q) => (
    <div key={q.code} className={`p-6 rounded-2xl bg-white border-2 ${isEditMode ? 'border-blue-200' : 'border-slate-100'} relative group shadow-sm mb-6`}>
      {isEditMode && (
        <div className="absolute top-4 right-4 flex gap-2 z-50">
          <button
            onClick={() => setEditingItem({ id: q.code, type: 'QUESTION', section: q.section, data: q })}
            className="p-2 text-slate-400 hover:text-blue-600 bg-slate-50 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <Edit2 size={16} />
          </button>
          <button
            onClick={() => handleDeleteDynamic(q.code, 'QUESTION')}
            className="p-2 text-slate-400 hover:text-rose-600 bg-slate-50 hover:bg-rose-50 rounded-lg transition-colors"
          >
            <Trash2 size={16} />
          </button>
        </div>
      )}
      <FieldLabel code={q.code} fr={q.label_fr} ar={q.label_ar || q.label_fr} isRTL={isRTL} />

      {q.question_type === 'RADIO' && (
        <RadioGroup
          name={q.code}
          value={extraAnswers[q.code] || ''}
          onChange={(e) => setExtraAnswers({ ...extraAnswers, [q.code]: e.target.value })}
          options={Array.isArray(q.options_json) ? q.options_json : []}
          isRTL={isRTL}
        />
      )}

      {q.question_type === 'NUMBER' && (
        <input
          type="number"
          value={extraAnswers[q.code] || ''}
          onChange={(e) => setExtraAnswers({ ...extraAnswers, [q.code]: e.target.value })}
          className="w-full mt-2 p-3 bg-white border-2 border-slate-200 rounded-xl font-bold text-slate-800 text-sm focus:border-blue-600 outline-none"
          placeholder="0"
        />
      )}

      {q.question_type === 'TEXT' && (
        <input
          type="text"
          value={extraAnswers[q.code] || ''}
          onChange={(e) => setExtraAnswers({ ...extraAnswers, [q.code]: e.target.value })}
          className="w-full mt-2 p-3 bg-white border-2 border-slate-200 rounded-xl font-bold text-slate-800 text-sm focus:border-blue-600 outline-none"
          placeholder={isRTL ? 'إجابتك...' : 'Votre réponse...'}
        />
      )}
    </div>
  );
'''

# Let's inspect the rest of SECTIONS from scratch/assemble_questionnaire.py
with open('scratch/assemble_questionnaire.py', 'r', encoding='utf-8') as f:
    asm_code = f.read()

sections_start = asm_code.find('  const SECTIONS = [')
sections_end = asm_code.find('  const currentSection = SECTIONS[step];')

sections_text = asm_code[sections_start:sections_end]

# Dynamic sections wrapping
dynamic_processor = r'''
  const isHidden = (code) => {
    return Array.isArray(dynamicConfigs) && dynamicConfigs.some((q) => q.code === code && q.is_hidden);
  };

  const staticProcessed = RAW_SECTIONS.filter((s) => s.id === 'section_z' || !isHidden(s.id)).map((s) => {
    const sectionDynQuestions = Array.isArray(dynamicConfigs)
      ? dynamicConfigs.filter((q) => q.is_dynamic && !q.is_hidden && q.question_type !== 'SECTION' && q.section === s.id)
      : [];

    let contentNode = s.content;
    if (sectionDynQuestions.length > 0 || isEditMode) {
      contentNode = (
        <>
          {s.content}
          {(sectionDynQuestions.length > 0 || isEditMode) && (
            <div className={`mt-12 pt-12 border-t-2 border-dashed ${isEditMode ? 'border-blue-200' : 'border-slate-200'}`}>
              <h4 className="font-bold mb-6 uppercase tracking-widest text-sm text-slate-500">
                {isRTL ? 'أسئلة إضافية' : 'Questions Personnalisées'}
              </h4>
              {sectionDynQuestions.map((q) => renderDynamicQuestionCard(q))}
              {isEditMode && (
                <button
                  onClick={() =>
                    setEditingItem({
                      id: null,
                      type: 'QUESTION',
                      section: s.id,
                      data: { code: '', label_fr: '', question_type: 'TEXT', section: s.id, is_dynamic: true, options_json: [] },
                    })
                  }
                  className="w-full py-4 border-2 border-dashed border-blue-300 text-blue-600 rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
                >
                  <Plus size={16} /> {isRTL ? 'إضافة سؤال جديد في هذا القسم' : 'Ajouter une question dans cette section'}
                </button>
              )}
            </div>
          )}
        </>
      );
    }

    const overriddenTitle = Array.isArray(dynamicConfigs) ? dynamicConfigs.find((q) => q.code === s.id && q.question_type === 'SECTION') : null;

    return {
      ...s,
      title: overriddenTitle ? overriddenTitle.label_fr : s.title,
      titleAr: overriddenTitle && overriddenTitle.label_ar ? overriddenTitle.label_ar : s.titleAr,
      actionButtons: isEditMode ? (
        <button
          onClick={() =>
            setEditingItem({
              id: s.id,
              type: 'SECTION',
              section: s.id,
              data: overriddenTitle || { code: s.id, label_fr: s.title, label_ar: s.titleAr, question_type: 'SECTION', section: s.id, is_dynamic: false },
            })
          }
          className="px-3 py-1.5 bg-white text-slate-900 rounded-lg shadow font-bold text-xs flex items-center gap-1.5 hover:bg-slate-50"
        >
          <Pencil size={13} /> {isRTL ? 'تعديل العنوان' : 'Modifier titre'}
        </button>
      ) : null,
      content: contentNode,
    };
  });

  const dynamicSections = Array.isArray(dynamicConfigs)
    ? dynamicConfigs.filter((q) => q.is_dynamic && !q.is_hidden && q.question_type === 'SECTION' && q.code.toLowerCase() !== 'section_z' && q.code.toLowerCase() !== 'z')
    : [];

  const dynamicProcessed = dynamicSections.map((sec) => {
    const secQuestions = Array.isArray(dynamicConfigs)
      ? dynamicConfigs.filter((q) => q.is_dynamic && !q.is_hidden && q.question_type !== 'SECTION' && q.section === sec.code)
      : [];

    return {
      id: sec.code,
      letter: sec.code.replace('SEC_', '').toUpperCase(),
      title: sec.label_fr,
      titleAr: sec.label_ar || sec.label_fr,
      color: 'bg-indigo-950',
      actionButtons: isEditMode ? (
        <div className="flex gap-2">
          <button
            onClick={() => setEditingItem({ id: sec.code, type: 'SECTION', section: sec.code, data: sec })}
            className="px-3 py-1.5 bg-white text-slate-900 rounded-lg shadow font-bold text-xs flex items-center gap-1.5 hover:bg-slate-50"
          >
            <Edit2 size={13} /> {isRTL ? 'تعديل' : 'Modifier'}
          </button>
          <button
            onClick={() => handleDeleteDynamic(sec.code, 'SECTION')}
            className="px-3 py-1.5 bg-rose-600 text-white rounded-lg shadow font-bold text-xs flex items-center gap-1.5 hover:bg-rose-700"
          >
            <Trash2 size={13} />
          </button>
        </div>
      ) : null,
      content: (
        <div className="space-y-6">
          {secQuestions.map((q) => renderDynamicQuestionCard(q))}
          {isEditMode && (
            <button
              onClick={() =>
                setEditingItem({
                  id: null,
                  type: 'QUESTION',
                  section: sec.code,
                  data: { code: '', label_fr: '', question_type: 'TEXT', section: sec.code, is_dynamic: true, options_json: [] },
                })
              }
              className="w-full py-4 border-2 border-dashed border-blue-300 text-blue-600 rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
            >
              <Plus size={16} /> {isRTL ? 'إضافة سؤال جديد' : 'Ajouter une question'}
            </button>
          )}
        </div>
      ),
    };
  });

  const filteredSections = [...staticProcessed, ...dynamicProcessed];

  if (isEditMode) {
    filteredSections.push({
      id: 'add_section',
      letter: '+',
      title: isRTL ? 'قسم جديد' : 'Nouvelle Section',
      titleAr: 'قسم جديد',
      color: 'bg-slate-700',
      content: (
        <div className="p-12 border-4 border-dashed border-slate-300 rounded-3xl flex items-center justify-center">
          <button
            onClick={() =>
              setEditingItem({
                id: null,
                type: 'SECTION',
                section: '',
                data: { code: '', label_fr: '', label_ar: '', question_type: 'SECTION', is_dynamic: true },
              })
            }
            className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold uppercase tracking-widest text-xs shadow-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus size={16} /> {isRTL ? 'إنشاء قسم جديد' : 'Créer une nouvelle section'}
          </button>
        </div>
      ),
    });
  }

  const SECTIONS = filteredSections;
  const currentSection = SECTIONS[step] || SECTIONS[0];
'''

# Replace "const SECTIONS = [" with "const RAW_SECTIONS = ["
sections_text_raw = sections_text.replace('const SECTIONS = [', 'const RAW_SECTIONS = [')

# Build the return JSX including Edit mode button and editing modal
return_jsx = r'''
  return (
    <div className={`min-h-screen bg-slate-100 py-10 px-4 sm:px-6 lg:px-8 font-sans ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <ChoiceInteractionStyles />

      <div className="max-w-4xl mx-auto">
        {/* Top bar with back, edit mode toggle, lang switch, and active report info */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white text-slate-700 font-bold text-sm rounded-xl border border-slate-200 shadow-sm hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft size={16} className={isRTL ? 'rotate-180' : ''} />
            {isRTL ? 'رجوع' : 'Retour'}
          </button>

          <div className="flex items-center gap-3">
            {isAdmin && (
              <button
                onClick={() => setIsEditMode(!isEditMode)}
                className={`px-4 py-2 rounded-xl text-xs font-bold border-2 transition-all flex items-center gap-2 ${
                  isEditMode
                    ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <Pencil size={14} /> {isEditMode ? (isRTL ? 'إلغاء وضع التعديل' : 'Quitter Édition') : (isRTL ? 'وضع التعديل' : 'Mode Édition')}
              </button>
            )}

            {activeReport && (
              <div className="px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-xl text-xs font-bold text-blue-800">
                {isRTL ? 'التقرير النشط:' : 'Rapport actif :'} {activeReport.establishment_name}
              </div>
            )}

            <button
              onClick={() => setLang(lang === 'fr' ? 'ar' : 'fr')}
              className="px-4 py-2 bg-white text-blue-600 font-black text-sm rounded-xl border-2 border-blue-200 shadow-sm hover:bg-blue-50 transition-colors"
            >
              {lang === 'fr' ? 'العربية' : 'Français'}
            </button>
          </div>
        </div>

        {/* Questionnaire Form Card */}
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden"
        >
          {/* Header */}
          <div className="p-6 sm:p-8">
            <SectionHeader
              letter={currentSection.letter}
              title={isRTL ? currentSection.titleAr : currentSection.title}
              subtitle={isRTL ? currentSection.subtitleAr : currentSection.subtitle}
              color={currentSection.color}
              actionButtons={currentSection.actionButtons}
            />

            {/* Content */}
            <div className="mt-8">
              {currentSection.content}
            </div>
          </div>

          {/* Error display */}
          {status.error && (
            <div className="mx-6 sm:mx-8 mb-6 p-4 bg-rose-50 border-2 border-rose-200 rounded-2xl flex items-center gap-3 text-rose-700 font-bold text-sm">
              <AlertCircle size={20} className="shrink-0" />
              <span>{status.error}</span>
            </div>
          )}

          {/* Success display */}
          {status.success && (
            <div className="mx-6 sm:mx-8 mb-6 p-4 bg-emerald-50 border-2 border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-700 font-bold text-sm">
              <CheckCircle2 size={20} className="shrink-0" />
              <span>{isRTL ? 'تم حفظ الاستبيان بنجاح!' : 'Questionnaire enregistré avec succès !'}</span>
            </div>
          )}

          {/* Navigation footer */}
          <div className="p-6 sm:p-8 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
            <button
              onClick={() => {
                setStep((prev) => Math.max(0, prev - 1));
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              disabled={step === 0}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-black text-sm uppercase tracking-wider transition-all disabled:opacity-30 disabled:cursor-not-allowed bg-white border-2 border-slate-200 text-slate-700 hover:bg-slate-100"
            >
              <ChevronLeft size={18} className={isRTL ? 'rotate-180' : ''} />
              {isRTL ? 'السابق' : 'Précédent'}
            </button>

            <span className="text-xs font-bold text-slate-400">
              {isRTL ? `القسم ${step + 1} من ${SECTIONS.length}` : `Section ${step + 1} sur ${SECTIONS.length}`}
            </span>

            {step < SECTIONS.length - 1 ? (
              <button
                onClick={() => {
                  setStep((prev) => Math.min(SECTIONS.length - 1, prev + 1));
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-black text-sm uppercase tracking-wider shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all"
              >
                {isRTL ? 'التالي' : 'Suivant'}
                <ChevronRight size={18} className={isRTL ? 'rotate-180' : ''} />
              </button>
            ) : (
              <button
                onClick={() => handleSubmit()}
                disabled={status.loading}
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-emerald-600 text-white rounded-xl font-black text-sm uppercase tracking-wider shadow-lg shadow-emerald-500/20 hover:bg-emerald-700 transition-all disabled:opacity-50"
              >
                <Send size={18} />
                {status.loading ? (isRTL ? 'جاري الإرسال...' : 'Envoi en cours...') : (isRTL ? 'تأكيد وإرسال' : 'Valider & Transmettre')}
              </button>
            )}
          </div>
        </motion.div>
      </div>

      {/* Dynamic Question / Section Editing Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100">
              <div>
                <h3 className="text-xl font-black text-slate-900">
                  {editingItem.id ? (isRTL ? 'تعديل' : 'Éditer') : (isRTL ? 'إنشاء' : 'Créer')}{' '}
                  {editingItem.type === 'SECTION' ? (isRTL ? 'قسم' : 'Section') : (isRTL ? 'سؤال' : 'Question')}
                </h3>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{editingItem.section}</p>
              </div>
              <button
                onClick={() => setEditingItem(null)}
                className="p-2 text-slate-400 hover:text-slate-700 bg-slate-50 rounded-xl"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">
                  {isRTL ? 'الرمز الفريد (Code Unique)' : 'Code Unique (ex: SEC_CUSTOM ou Z.01)'}
                </label>
                <input
                  type="text"
                  maxLength={50}
                  value={editingItem.data.code}
                  disabled={!!editingItem.id}
                  onChange={(e) =>
                    setEditingItem({
                      ...editingItem,
                      data: { ...editingItem.data, code: e.target.value.toUpperCase() },
                    })
                  }
                  className="w-full border-2 border-slate-200 rounded-xl px-4 py-2.5 font-bold text-sm focus:border-blue-600 outline-none disabled:opacity-50"
                  placeholder={editingItem.type === 'SECTION' ? 'SEC_W' : 'W.01'}
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">
                  {isRTL ? 'النص بالفرنسية (Libellé Français)' : 'Libellé (Français)'}
                </label>
                <input
                  type="text"
                  value={editingItem.data.label_fr}
                  onChange={(e) =>
                    setEditingItem({
                      ...editingItem,
                      data: { ...editingItem.data, label_fr: e.target.value },
                    })
                  }
                  className="w-full border-2 border-slate-200 rounded-xl px-4 py-2.5 font-bold text-sm focus:border-blue-600 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">
                  {isRTL ? 'النص بالعربية (Libellé Arabe)' : 'Libellé (Arabe)'}
                </label>
                <input
                  type="text"
                  dir="rtl"
                  value={editingItem.data.label_ar || ''}
                  onChange={(e) =>
                    setEditingItem({
                      ...editingItem,
                      data: { ...editingItem.data, label_ar: e.target.value },
                    })
                  }
                  className="w-full border-2 border-slate-200 rounded-xl px-4 py-2.5 font-bold text-sm focus:border-blue-600 outline-none text-right"
                />
              </div>

              {editingItem.type === 'QUESTION' && (
                <>
                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1">
                      {isRTL ? 'نوع السؤال' : 'Type de question'}
                    </label>
                    <select
                      value={editingItem.data.question_type}
                      onChange={(e) =>
                        setEditingItem({
                          ...editingItem,
                          data: { ...editingItem.data, question_type: e.target.value },
                        })
                      }
                      className="w-full border-2 border-slate-200 rounded-xl px-4 py-2.5 font-bold text-sm focus:border-blue-600 outline-none"
                    >
                      <option value="TEXT">{isRTL ? 'نص' : 'Texte'}</option>
                      <option value="NUMBER">{isRTL ? 'رقم' : 'Nombre'}</option>
                      <option value="RADIO">{isRTL ? 'خيارات متعددة (Radio)' : 'Choix Multiple (Radio)'}</option>
                    </select>
                  </div>

                  {editingItem.data.question_type === 'RADIO' && (
                    <div>
                      <label className="text-xs font-bold text-slate-600 block mb-1">
                        {isRTL ? 'الخيارات (مفصولة بفواصل)' : 'Options (séparées par des virgules)'}
                      </label>
                      <input
                        type="text"
                        value={
                          Array.isArray(editingItem.data.options_json)
                            ? editingItem.data.options_json.map((o) => o[0]).join(', ')
                            : ''
                        }
                        onChange={(e) => {
                          const opts = e.target.value.split(',').map((o) => [o.trim(), o.trim(), o.trim()]);
                          setEditingItem({ ...editingItem, data: { ...editingItem.data, options_json: opts } });
                        }}
                        className="w-full border-2 border-slate-200 rounded-xl px-4 py-2.5 font-medium text-sm focus:border-blue-600 outline-none"
                        placeholder="Oui, Non, Peut-être"
                      />
                    </div>
                  )}
                </>
              )}

              <div className="flex items-center gap-4 pt-2">
                <div className="flex-1">
                  <label className="text-xs font-bold text-slate-600 block mb-1">
                    {isRTL ? 'الترتيب' : 'Ordre'}
                  </label>
                  <input
                    type="number"
                    value={editingItem.data.order || 100}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        data: { ...editingItem.data, order: parseInt(e.target.value) || 100 },
                      })
                    }
                    className="w-full border-2 border-slate-200 rounded-xl px-4 py-2.5 font-bold text-sm focus:border-blue-600 outline-none"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-xs font-bold text-slate-600 block mb-1">
                    {isRTL ? 'الظهور' : 'Visibilité'}
                  </label>
                  <label className="flex items-center gap-2 mt-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!editingItem.data.is_hidden}
                      onChange={() =>
                        setEditingItem({
                          ...editingItem,
                          data: { ...editingItem.data, is_hidden: !editingItem.data.is_hidden },
                        })
                      }
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    <span className="text-xs font-bold text-slate-700">
                      {isRTL ? 'إظهار للعموم' : 'Afficher au public'}
                    </span>
                  </label>
                </div>
              </div>

              {modalError && (
                <div className="bg-rose-50 border-2 border-rose-200 rounded-xl p-3 flex gap-2 text-rose-700 text-xs font-bold">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{modalError}</span>
                </div>
              )}

              <div className="pt-4">
                <button
                  onClick={async () => {
                    setModalError(null);
                    if (!editingItem.data.code || !editingItem.data.label_fr) {
                      setModalError('Veuillez remplir le code unique et le libellé français.');
                      return;
                    }
                    try {
                      const payload = editingItem.data;
                      if (editingItem.type === 'SECTION') {
                        payload.section = payload.code;
                      }
                      if (editingItem.id) {
                        await api.patch(`dynamic-questions/${editingItem.id}/`, payload);
                      } else {
                        await api.post('dynamic-questions/', payload);
                      }
                      fetchConfig();
                      setModalError('Succès ! Modification enregistrée.');
                      setTimeout(() => {
                        setEditingItem(null);
                        setModalError(null);
                      }, 1000);
                    } catch (err) {
                      console.error('Error saving dynamic item', err);
                      setModalError('Erreur de sauvegarde. Vérifiez le code unique.');
                    }
                  }}
                  className="w-full py-3.5 bg-blue-600 text-white rounded-xl font-bold uppercase tracking-wider text-xs hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Save size={16} /> {isRTL ? 'حفظ' : 'Sauvegarder'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Location Selection Modal */}
      <LocationSelectionModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        isRTL={isRTL}
        onConfirm={(govId, estId) => {
          setOperatorGovId(govId);
          setOperatorEstId(estId);
          setIsLocationModalOpen(false);
          handleSubmit(govId, estId);
        }}
      />

      {/* Finalize Modal */}
      {showFinalizeModal && activeReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-slate-100 text-center">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={32} />
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2">
              {isRTL ? 'تم تسجيل الاستبيان!' : 'Questionnaire Enregistré !'}
            </h3>
            <p className="text-sm text-slate-600 mb-6 leading-relaxed">
              {isRTL
                ? 'هل ترغب في إنهاء وإغلاق تقرير القسم الآن، أم إضافة استبيان آخر؟'
                : 'Souhaitez-vous clôturer ce rapport de classe ou continuer à saisir d’autres questionnaires ?'}
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={handleFinalize}
                className="w-full py-3.5 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-black transition-colors"
              >
                {isRTL ? 'إغلاق وتأكيد تقرير القسم' : 'Clôturer et Finaliser le Rapport'}
              </button>
              <button
                onClick={() => {
                  setData(INITIAL_DATA);
                  setStep(0);
                  setShowFinalizeModal(false);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="w-full py-3.5 bg-blue-50 text-blue-700 rounded-xl font-bold text-sm hover:bg-blue-100 transition-colors"
              >
                {isRTL ? 'إدخال استبيان جديد لنفس القسم' : 'Saisir un autre élève pour cette classe'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionnaireForm;
'''

full_code = header + '\n' + component_code + '\n' + sections_text_raw + '\n' + dynamic_processor + '\n' + return_jsx

with open('frontend/src/components/QuestionnaireForm.jsx', 'w', encoding='utf-8') as f:
    f.write(full_code)

print("Generated full QuestionnaireForm.jsx successfully!")
