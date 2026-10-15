
import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('scratch/merged_header_constants.js', 'r', encoding='utf-8') as f:
    header = f.read()

# Build the sections and QuestionnaireForm main component body
form_body = """
const QuestionnaireForm = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const reportIdParam = searchParams.get('report_id');
  const isEditMode = searchParams.get('edit') === 'true';

  const [step, setStep] = useState(0);
  const [data, setData] = useState(INITIAL_DATA);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState({ loading: false, success: false, error: null });
  const [lang, setLang] = useState('fr');
  const [currentUser, setCurrentUser] = useState(null);

  // Dynamic Questions config & modal state
  const [dynamicConfigs, setDynamicConfigs] = useState({});
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
      const configs = {};
      res.data.forEach((q) => {
        configs[q.code] = q;
      });
      setDynamicConfigs(configs);
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

  const SECTIONS = [
    // SECTION A
    {
      id: 'section_a',
      letter: 'A',
      title: 'Informations Générales',
      titleAr: 'معلومات عامة',
      subtitle: 'Les premières questions concernent des informations générales sur vous.',
      subtitleAr: 'تتعلق الأسئلة الأولى بمعلومات عامة عن شخصكم.',
      color: 'bg-slate-900',
      content: (
        <div className="space-y-12">
          {/* Date de l'enquête */}
          <div className="p-5 bg-blue-50/80 border-2 border-blue-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <FieldLabel code="DATE" fr="Date de l'enquête" ar="تاريخ الاستبيان" isRTL={isRTL} />
              <p className="text-xs text-slate-500 font-medium">{isRTL ? 'التاريخ المسجل لهذه الجلسة' : 'Date enregistrée pour cette session'}</p>
            </div>
            <input
              type="date"
              name="survey_date"
              value={data.section_a.survey_date || ''}
              onChange={handleChange('section_a')}
              className="px-4 py-2.5 bg-white border-2 border-blue-300 rounded-xl font-bold text-slate-800 text-sm focus:border-blue-600 outline-none"
            />
          </div>

          {/* C.A01 */}
          <div>
            <FieldLabel code="C.A01" fr="Genre ?" ar="الجنس؟" isRTL={isRTL} />
            <VerticalChoiceList
              name="gender"
              value={data.section_a.gender}
              onChange={handleChange('section_a')}
              options={[
                ['M', 'Masculin', 'ذكر', 1],
                ['F', 'Féminin', 'أنثى', 2],
              ]}
              isRTL={isRTL}
            />
          </div>

          {/* C.A02: Date de naissance */}
          <div>
            <FieldLabel code="C.A02" fr="En quelle année et quel mois êtes-vous né(e) ?" ar="في أي سنة وأي شهر ولدت؟" isRTL={isRTL} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-3">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
                  (C.A02a) {isRTL ? 'الشهر (01 إلى 12)' : 'Mois (01 à 12)'}
                </span>
                <DigitBoxes
                  value={data.section_a.birth_month}
                  length={2}
                  onChange={(val) => update('section_a', 'birth_month', val)}
                  isRTL={isRTL}
                />
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
                  (C.A02b) {isRTL ? 'السنة (مثال: 2008)' : 'Année (ex: 2008)'}
                </span>
                <DigitBoxes
                  value={data.section_a.birth_year}
                  length={4}
                  onChange={(val) => update('section_a', 'birth_year', val)}
                  isRTL={isRTL}
                />
              </div>
            </div>
          </div>

          {/* C.A03 */}
          <div>
            <FieldLabel code="C.A03" fr="Comment trouvez-vous vos résultats scolaires par rapport aux autres élèves ?" ar="كيف تقيم نتائجك المدرسية مقارنة ببقية التلاميذ؟" isRTL={isRTL} />
            <VerticalChoiceList
              name="academic_performance"
              value={data.section_a.academic_performance}
              onChange={handleChange('section_a')}
              options={PERFORMANCE}
              isRTL={isRTL}
            />
          </div>

          {/* C.A04: Absences */}
          <GridQuestion
            title="Au cours du dernier mois, combien de jours avez-vous manqué le lycée pour l'une des raisons suivantes ?"
            titleAr="خلال الشهر الأخير كم مرة تغيبت عن المدرسة لسبب من الأسباب التالية؟"
            code="C.A04"
            isRTL={isRTL}
            options={[
              ['1', 'Jamais', 'أبداً'],
              ['2', '1 jour', 'يوم واحد'],
              ['3', '2 jours', 'يومان'],
              ['4', '3-4 jours', '3-4 أيام'],
              ['5', '5-6 jours', '5-6 أيام'],
              ['6', '7 jours ou plus', '7 أيام أو أكثر'],
            ]}
            values={data.section_a.school_absences}
            onChange={(key, val) => updateCheck('section_a', 'school_absences', key, val)}
            items={[
              ['a', '(C.A04a) Parce que vous étiez malade', 'بسبب المرض'],
              ['b', "(C.A04b) Parce que vous n'aviez pas envie d'aller au lycée", 'لم تكن راغباً في الذهاب إلى المدرسة'],
              ['c', '(C.A04c) En raison de problèmes avec l’administration ou les enseignants', 'بسبب مشاكل مع الإدارة أو المدرسين'],
              ['d', '(C.A04d) En raison de problèmes avec les ami(e)s au lycée', 'بسبب مشاكل مع الأقران'],
              ['e', '(C.A04e) Parce que vous avez été renvoyé(e)', 'بسبب الطرد'],
            ]}
          />

          {/* C.A05 */}
          <div>
            <FieldLabel code="C.A05" fr="Quel est votre degré d'appréciation de l'école ?" ar="ما مدى إعجابك بالمدرسة؟" isRTL={isRTL} />
            <VerticalChoiceList
              name="school_appreciation"
              value={data.section_a.school_appreciation}
              onChange={handleChange('section_a')}
              options={[
                ['1', "J'aime beaucoup l'école", 'أحب المدرسة كثيراً', 1],
                ['2', "J'aime assez l'école", 'أحب المدرسة إلى حد ما', 2],
                ['3', "Je n'aime pas tellement l'école", 'لا أحب المدرسة كثيراً', 3],
                ['4', "Je n'aime pas du tout l'école", 'لا أحب المدرسة إطلاقاً', 4],
              ]}
              isRTL={isRTL}
            />
          </div>

          {/* C.A06: Activités */}
          <GridQuestion
            title="À quelle fréquence participez-vous aux activités suivantes :"
            titleAr="كم مرة تمارس الأنشطة التالية:"
            code="C.A06"
            isRTL={isRTL}
            options={FREQ_ACTIVITIES}
            values={data.section_a.activities_frequency}
            onChange={(key, val) => updateCheck('section_a', 'activities_frequency', key, val)}
            items={[
              ['sports', '(C.A06a) Pratiquer du sport', 'ممارسة الرياضة'],
              ['reading', '(C.A06b) Lire des livres pour le plaisir', 'قراءة الكتب للمطالعة'],
              ['going_out', '(C.A06c) Sortir le soir avec des ami(e)s', 'الخروج في المساء مع الأصدقاء'],
              ['hobbies', "(C.A06d) Pratiquer d'autres loisirs (musique, théâtre...)", 'ممارسة هوايات أخرى (موسيقى، مسرح...)'],
              ['park', '(C.A06e) Passer du temps dans les parcs ou espaces publics', 'قضاء الوقت في الحدائق أو الفضاءات العامة'],
              ['internet', "(C.A06f) Utiliser Internet pour les loisirs", 'استخدام الإنترنت للترفيه'],
              ['tv', "(C.A06g) Regarder la télévision ou des vidéos", 'مشاهدة التلفزيون أو مقاطع الفيديو'],
            ]}
          />

          {/* C.A07: Membres du foyer */}
          <div>
            <FieldLabel code="C.A07" fr="Quelles sont les personnes qui vivent avec vous dans le même foyer ?" ar="من هم الأشخاص الذين يعيشون معك في نفس المنزل؟" isRTL={isRTL} />
            <p className="text-xs font-medium text-slate-500 mb-2">{isRTL ? 'يمكنك اختيار أكثر من إجابة' : '(Plusieurs choix possibles)'}</p>
            <CheckboxGroup
              values={data.section_a.household_members}
              onChange={(val) => update('section_a', 'household_members', val)}
              options={HOUSEHOLD}
              isRTL={isRTL}
            />
          </div>

          {/* C.A08: Raison absence parents */}
          <div>
            <FieldLabel code="C.A08" fr="Si l'un ou les deux parents ne vivent pas avec vous, quelle en est la raison principale ?" ar="إذا كان أحد الوالدين أو كلاهما لا يعيش معك، ما هو السبب الرئيسي؟" isRTL={isRTL} />
            <VerticalChoiceList
              name="parents_absence_reason"
              value={data.section_a.parents_absence_reason}
              onChange={handleChange('section_a')}
              options={[
                ['1', 'Décès', 'وفاة', 1],
                ['2', 'Divorce ou séparation', 'طلاق أو انفصال', 2],
                ['3', 'Travail ou migration dans une autre région / à l’étranger', 'العمل أو الهجرة إلى منطقة أخرى / بالخارج', 3],
                ['4', 'Autre raison', 'سبب آخر', 4],
                ['5', 'Non concerné (mes deux parents vivent avec moi)', 'غير معني (كلا الوالدين يعيشان معي)', 5],
              ]}
              isRTL={isRTL}
            />
          </div>

          {/* C.A09: Satisfaction relations */}
          <GridQuestion
            title="D'une manière générale, quel est votre degré de satisfaction de votre relation avec :"
            titleAr="كم نسبة رضاك عن علاقتك بــ :"
            code="C.A09"
            isRTL={isRTL}
            options={SATISFACTION_SCALE}
            values={data.section_a.family_relationship_satisfaction}
            onChange={(key, val) => updateCheck('section_a', 'family_relationship_satisfaction', key, val)}
            items={[
              ['a', '(C.A09a) Votre mère', 'أمك'],
              ['b', '(C.A09b) Votre père', 'أبوك'],
              ['c', '(C.A09c) Vos ami(e)s', 'أصدقاؤك'],
            ]}
          />

          {/* C.A10: Sorties nocturnes */}
          <div>
            <FieldLabel code="C.A10" fr="Au cours des 30 DERNIERS JOURS, combien de nuits avez-vous passées hors de chez vous pour vous amuser ?" ar="خلال الـ 30 يوماً الأخيرة، كم ليلة قضيتها خارج المنزل للترفيه؟" isRTL={isRTL} />
            <VerticalChoiceList
              name="nights_out_30days"
              value={data.section_a.nights_out_30days}
              onChange={handleChange('section_a')}
              options={[
                ['1', 'Aucune nuit', 'ولا ليلة', 1],
                ['2', '1 nuit', 'ليلة واحدة', 2],
                ['3', '2 nuits', 'ليلتان', 3],
                ['4', '3 nuits', '3 ليالٍ', 4],
                ['5', '4 nuits', '4 ليالٍ', 5],
                ['6', '5 nuits', '5 ليالٍ', 6],
                ['7', '6 nuits', '6 ليالٍ', 7],
                ['8', '7 nuits ou plus', '7 ليالٍ أو أكثر', 8],
              ]}
              isRTL={isRTL}
            />
          </div>
        </div>
      ),
    },

    // SECTION B
    {
      id: 'section_b',
      letter: 'B',
      title: 'Famille et Situation Socio-Économique',
      titleAr: 'العائلة والوضع الاجتماعي والاقتصادي',
      subtitle: 'Questions sur le niveau d’instruction et la profession de vos parents.',
      subtitleAr: 'أسئلة حول المستوى التعليمي والمهني للوالدين.',
      color: 'bg-emerald-950',
      content: (
        <div className="space-y-12">
          {/* C.B01: Éducation Père */}
          <EducationWithSubQuestions
            fieldName="father_education"
            successFields={{
              primary: 'father_primary_success',
              middle: 'father_middle_success',
              secondary: 'father_secondary_success',
            }}
            labelCode="C.B01"
            labelFr="Quel est le niveau d'instruction le plus élevé atteint par votre PÈRE ?"
            labelAr="ما هو أعلى مستوى تعليمي بلغه والدك؟"
            data={data.section_b}
            update={update}
            isRTL={isRTL}
          />

          {/* C.B02: Éducation Mère */}
          <EducationWithSubQuestions
            fieldName="mother_education"
            successFields={{
              primary: 'mother_primary_success',
              middle: 'mother_middle_success',
              secondary: 'mother_secondary_success',
            }}
            labelCode="C.B02"
            labelFr="Quel est le niveau d'instruction le plus élevé atteint par votre MÈRE ?"
            labelAr="ما هو أعلى مستوى تعليمي بلغته والدتك؟"
            data={data.section_b}
            update={update}
            isRTL={isRTL}
          />

          {/* C.B03: Travail Père */}
          <div>
            <FieldLabel code="C.B03" fr="Quelle est la profession de votre PÈRE ?" ar="ما هي مهنة والدك؟" isRTL={isRTL} />
            <VerticalChoiceList
              name="father_job"
              value={data.section_b.father_job}
              onChange={handleChange('section_b')}
              options={JOBS_FATHER}
              isRTL={isRTL}
            />
          </div>

          {/* C.B04: Travail Mère */}
          <div>
            <FieldLabel code="C.B04" fr="Quelle est la profession de votre MÈRE ?" ar="ما هي مهنة والدتك؟" isRTL={isRTL} />
            <VerticalChoiceList
              name="mother_job"
              value={data.section_b.mother_job}
              onChange={handleChange('section_b')}
              options={JOBS_MOTHER}
              isRTL={isRTL}
            />
          </div>

          {/* C.B05: Situation Économique */}
          <div>
            <FieldLabel code="C.B05" fr="Par rapport aux autres familles tunisiennes, comment évaluez-vous la situation financière de votre famille ?" ar="مقارنة بالعائلات التونسية الأخرى، كيف تقيم الوضع المالي لعائلتك؟" isRTL={isRTL} />
            <VerticalChoiceList
              name="economic_status"
              value={data.section_b.economic_status}
              onChange={handleChange('section_b')}
              options={ECONOMIC}
              isRTL={isRTL}
            />
          </div>

          {/* C.B06: Chambre personnelle */}
          <div>
            <FieldLabel code="C.B06" fr="Avez-vous une chambre individuelle pour vous seul(e) ?" ar="هل لديك غرفة خاصة بك بمفردك؟" isRTL={isRTL} />
            <VerticalChoiceList
              name="private_room"
              value={data.section_b.private_room}
              onChange={handleChange('section_b')}
              options={YES_NO}
              isRTL={isRTL}
            />
          </div>
        </div>
      ),
    },

    // SECTION C
    {
      id: 'section_c',
      letter: 'C',
      title: 'Consommation de Cigarettes',
      titleAr: 'استهلاك السجائر',
      subtitle: 'Questions sur l’accès et la fréquence de consommation de cigarettes traditionnelles.',
      subtitleAr: 'أسئلة حول سهولة الحصول على السجائر التقليدية وتكرار استهلاكها.',
      color: 'bg-amber-900',
      content: (
        <div className="space-y-12">
          <div>
            <FieldLabel code="C.C01" fr="À votre avis, s'il vous était possible d'obtenir des cigarettes, cela vous serait-il :" ar="حسب رأيك، إذا أردت الحصول على السجائر، هل سيكون ذلك:" isRTL={isRTL} />
            <VerticalChoiceList name="access_difficulty" value={data.section_c.access_difficulty} onChange={handleChange('section_c')} options={DIFFICULTY_LEVELS} isRTL={isRTL} />
          </div>
          <GridQuestion
            title="Parmi les personnes suivantes, combien fument des cigarettes :"
            titleAr="من بين الأشخاص التاليين، كم شخصاً يدخن السجائر:"
            code="C.C02"
            isRTL={isRTL}
            options={[
              ['1', 'Aucun', 'لا أحد'],
              ['2', 'Quelques-uns', 'البعض'],
              ['3', 'La plupart', 'الأغلبية'],
              ['4', 'Tous', 'الجميع'],
              ['5', 'Ne sait pas', 'لا أدري'],
            ]}
            values={data.section_c.social_circle}
            onChange={(key, val) => updateCheck('section_c', 'social_circle', key, val)}
            items={[
              ['friends', '(C.C02a) Vos ami(e)s', 'أصدقاؤك'],
              ['father', '(C.C02b) Votre père (ou tuteur)', 'والدك'],
              ['mother', '(C.C02c) Votre mère (ou tutrice)', 'والدتك'],
              ['siblings', '(C.C02d) Vos frères et sœurs', 'إخوتك وأخواتك'],
            ]}
          />
          <div>
            <FieldLabel code="C.C03" fr="Au cours de votre vie, combien de fois avez-vous fumé des cigarettes ?" ar="خلال حياتك، كم مرة دخنت السجائر؟" isRTL={isRTL} />
            <VerticalChoiceList name="lifetime_freq" value={data.section_c.lifetime_freq} onChange={handleChange('section_c')} options={FREQ_LIFETIME_CC03} isRTL={isRTL} />
          </div>
          <div>
            <FieldLabel code="C.C04" fr="Au cours des 12 DERNIERS MOIS, combien de fois avez-vous fumé des cigarettes ?" ar="خلال الـ 12 شهراً الأخيرة، كم مرة دخنت السجائر؟" isRTL={isRTL} />
            <VerticalChoiceList name="months_12_freq" value={data.section_c.months_12_freq} onChange={handleChange('section_c')} options={FREQ_LIFETIME_CC03} isRTL={isRTL} />
          </div>
          <div>
            <FieldLabel code="C.C05" fr="Au cours des 30 DERNIERS JOURS, à quelle fréquence avez-vous fumé des cigarettes ?" ar="خلال الـ 30 يوماً الأخيرة، كم مرة دخنت السجائر؟" isRTL={isRTL} />
            <VerticalChoiceList name="days_30_freq" value={data.section_c.days_30_freq} onChange={handleChange('section_c')} options={FREQ_30DAYS_CIGS} isRTL={isRTL} />
          </div>
          <div>
            <FieldLabel code="C.C06" fr="Quel âge aviez-vous quand vous avez fumé une cigarette pour la première fois ?" ar="كم كان عمرك عندما دخنت سيجارة لأول مرة؟" isRTL={isRTL} />
            <VerticalChoiceList name="age_first_use" value={data.section_c.age_first_use} onChange={handleChange('section_c')} options={AGE_SCALE} isRTL={isRTL} />
          </div>
          <div>
            <FieldLabel code="C.C07" fr="Quel âge aviez-vous quand vous avez commencé à fumer des cigarettes tous les jours ?" ar="كم كان عمرك عندما بدأت تدخن السجائر يومياً؟" isRTL={isRTL} />
            <VerticalChoiceList name="age_daily_use" value={data.section_c.age_daily_use} onChange={handleChange('section_c')} options={AGE_SCALE} isRTL={isRTL} />
          </div>
        </div>
      ),
    },

    // SECTION D
    {
      id: 'section_d',
      letter: 'D',
      title: 'Cigarette Électronique (Vape)',
      titleAr: 'السجائر الإلكترونية (Vape)',
      subtitle: 'Questions sur la cigarette électronique avec ou sans nicotine.',
      subtitleAr: 'أسئلة حول السجائر الإلكترونية بنيكوتين أو بدون نيكوتين.',
      color: 'bg-teal-900',
      content: (
        <div className="space-y-12">
          <div>
            <FieldLabel code="C.D01" fr="À votre avis, s'il vous était possible d'obtenir une cigarette électronique, cela vous serait-il :" ar="حسب رأيك، إذا أردت الحصول على سيجارة إلكترونية، هل سيكون ذلك:" isRTL={isRTL} />
            <VerticalChoiceList name="access_difficulty" value={data.section_d.access_difficulty} onChange={handleChange('section_d')} options={DIFFICULTY_LEVELS} isRTL={isRTL} />
          </div>
          <GridQuestion
            title="Parmi les personnes suivantes, combien utilisent la cigarette électronique :"
            titleAr="من بين الأشخاص التاليين، كم شخصاً يستعمل السيجارة الإلكترونية:"
            code="C.D02"
            isRTL={isRTL}
            options={[
              ['1', 'Aucun', 'لا أحد'],
              ['2', 'Quelques-uns', 'البعض'],
              ['3', 'La plupart', 'الأغلبية'],
              ['4', 'Tous', 'الجميع'],
              ['5', 'Ne sait pas', 'لا أدري'],
            ]}
            values={data.section_d.social_circle}
            onChange={(key, val) => updateCheck('section_d', 'social_circle', key, val)}
            items={[
              ['friends', '(C.D02a) Vos ami(e)s', 'أصدقاؤك'],
              ['father', '(C.D02b) Votre père (ou tuteur)', 'والدك'],
              ['mother', '(C.D02c) Votre mère (ou tutrice)', 'والدتك'],
              ['siblings', '(C.D02d) Vos frères et sœurs', 'إخوتك وأخواتك'],
            ]}
          />
          <div>
            <FieldLabel code="C.D03" fr="Au cours de votre vie, combien de fois avez-vous utilisé une cigarette électronique ?" ar="خلال حياتك، كم مرة استعملت السيجارة الإلكترونية؟" isRTL={isRTL} />
            <VerticalChoiceList name="lifetime_freq" value={data.section_d.lifetime_freq} onChange={handleChange('section_d')} options={FREQ_LIFETIME} isRTL={isRTL} />
          </div>
          <div>
            <FieldLabel code="C.D04" fr="Au cours des 12 DERNIERS MOIS, combien de fois avez-vous utilisé une cigarette électronique ?" ar="خلال الـ 12 شهراً الأخيرة، كم مرة استعملت السيجارة الإلكترونية؟" isRTL={isRTL} />
            <VerticalChoiceList name="months_12_freq" value={data.section_d.months_12_freq} onChange={handleChange('section_d')} options={FREQ_LIFETIME} isRTL={isRTL} />
          </div>
          <div>
            <FieldLabel code="C.D05" fr="Au cours des 30 DERNIERS JOURS, à quelle fréquence avez-vous utilisé une cigarette électronique ?" ar="خلال الـ 30 يوماً الأخيرة، كم مرة استعملت السيجارة الإلكترونية؟" isRTL={isRTL} />
            <VerticalChoiceList name="days_30_freq" value={data.section_d.days_30_freq} onChange={handleChange('section_d')} options={FREQ_30DAYS_VAPE} isRTL={isRTL} />
          </div>
          <div>
            <FieldLabel code="C.D06" fr="Quel âge aviez-vous lors de votre première utilisation d'une cigarette électronique ?" ar="كم كان عمرك عند أول استعمال للسيجارة الإلكترونية؟" isRTL={isRTL} />
            <VerticalChoiceList name="age_first_use" value={data.section_d.age_first_use} onChange={handleChange('section_d')} options={AGE_SCALE} isRTL={isRTL} />
          </div>
          <div>
            <FieldLabel code="C.D07" fr="Quel âge aviez-vous quand vous avez commencé à utiliser la cigarette électronique tous les jours ?" ar="كم كان عمرك عندما بدأت تستعمل السيجارة الإلكترونية يومياً؟" isRTL={isRTL} />
            <VerticalChoiceList name="age_daily_use" value={data.section_d.age_daily_use} onChange={handleChange('section_d')} options={AGE_SCALE} isRTL={isRTL} />
          </div>
        </div>
      ),
    },

    // SECTION E
    {
      id: 'section_e',
      letter: 'E',
      title: 'Chicha (Narguilé)',
      titleAr: 'الشيشة (النرجيلة)',
      subtitle: 'Questions sur la consommation de chicha (au café, à la maison ou ailleurs).',
      subtitleAr: 'أسئلة حول استهلاك الشيشة (في المقهى، في المنزل أو في أي مكان آخر).',
      color: 'bg-stone-800',
      content: (
        <div className="space-y-12">
          <div>
            <FieldLabel code="C.E01" fr="À votre avis, s'il vous était possible de fumer la chicha, cela vous serait-il :" ar="حسب رأيك، إذا أردت تدخين الشيشة، هل سيكون ذلك:" isRTL={isRTL} />
            <VerticalChoiceList name="access_difficulty" value={data.section_e.access_difficulty} onChange={handleChange('section_e')} options={DIFFICULTY_LEVELS} isRTL={isRTL} />
          </div>
          <GridQuestion
            title="Parmi les personnes suivantes, combien fument la chicha :"
            titleAr="من بين الأشخاص التاليين، كم شخصاً يدخن الشيشة:"
            code="C.E02"
            isRTL={isRTL}
            options={[
              ['1', 'Aucun', 'لا أحد'],
              ['2', 'Quelques-uns', 'البعض'],
              ['3', 'La plupart', 'الأغلبية'],
              ['4', 'Tous', 'الجميع'],
              ['5', 'Ne sait pas', 'لا أدري'],
            ]}
            values={data.section_e.social_circle}
            onChange={(key, val) => updateCheck('section_e', 'social_circle', key, val)}
            items={[
              ['friends', '(C.E02a) Vos ami(e)s', 'أصدقاؤك'],
              ['father', '(C.E02b) Votre père (ou tuteur)', 'والدك'],
              ['mother', '(C.E02c) Votre mère (ou tutrice)', 'والدتك'],
              ['siblings', '(C.E02d) Vos frères et sœurs', 'إخوتك وأخواتك'],
            ]}
          />
          <div>
            <FieldLabel code="C.E03" fr="Au cours de votre vie, combien de fois avez-vous fumé la chicha ?" ar="خلال حياتك، كم مرة دخنت الشيشة؟" isRTL={isRTL} />
            <VerticalChoiceList name="lifetime_freq" value={data.section_e.lifetime_freq} onChange={handleChange('section_e')} options={FREQ_LIFETIME} isRTL={isRTL} />
          </div>
          <div>
            <FieldLabel code="C.E04" fr="Au cours des 12 DERNIERS MOIS, combien de fois avez-vous fumé la chicha ?" ar="خلال الـ 12 شهراً الأخيرة، كم مرة دخنت الشيشة؟" isRTL={isRTL} />
            <VerticalChoiceList name="months_12_freq" value={data.section_e.months_12_freq} onChange={handleChange('section_e')} options={FREQ_LIFETIME} isRTL={isRTL} />
          </div>
          <div>
            <FieldLabel code="C.E05" fr="Au cours des 30 DERNIERS JOURS, à quelle fréquence avez-vous fumé la chicha ?" ar="خلال الـ 30 يوماً الأخيرة، كم مرة دخنت الشيشة؟" isRTL={isRTL} />
            <VerticalChoiceList name="days_30_freq" value={data.section_e.days_30_freq} onChange={handleChange('section_e')} options={FREQ_30DAYS_HOOKAH} isRTL={isRTL} />
          </div>
          <div>
            <FieldLabel code="C.E06" fr="Quel âge aviez-vous quand vous avez fumé la chicha pour la première fois ?" ar="كم كان عمرك عندما دخنت الشيشة لأول مرة؟" isRTL={isRTL} />
            <VerticalChoiceList name="age_first_use" value={data.section_e.age_first_use} onChange={handleChange('section_e')} options={AGE_SCALE} isRTL={isRTL} />
          </div>
        </div>
      ),
    },

    // SECTION G
    {
      id: 'section_g',
      letter: 'G',
      title: 'Boissons Alcoolisées',
      titleAr: 'المشروبات الكحولية',
      subtitle: 'Questions sur la bière, le vin, les spiritueux, et les épisodes d’ivresse.',
      subtitleAr: 'أسئلة حول استهلاك البيرة، النبيذ، المشروبات الروحية، وحالات السكر.',
      color: 'bg-red-950',
      content: (
        <div className="space-y-12">
          <GridQuestion
            title="À votre avis, s'il vous était possible d'obtenir les boissons suivantes, cela vous serait-il :"
            titleAr="حسب رأيك، إذا أردت الحصول على المشروبات التالية، هل سيكون ذلك:"
            code="C.G01"
            isRTL={isRTL}
            options={DIFFICULTY_LEVELS}
            values={data.section_g.access_difficulty}
            onChange={(key, val) => updateCheck('section_g', 'access_difficulty', key, val)}
            items={[
              ['beer', '(C.G01a) Bière', 'البيرة'],
              ['cider', '(C.G01b) Cidre', 'عصير التفاح المخمر'],
              ['wine', '(C.G01c) Vin', 'النبيذ'],
              ['spirits', '(C.G01d) Spiritueux / Alcool fort', 'المشروبات الروحية القوية'],
            ]}
          />
          <div>
            <FieldLabel code="C.G03" fr="Au cours de votre vie, combien de fois avez-vous bu de l'alcool ?" ar="خلال حياتك، كم مرة شربت الكحول؟" isRTL={isRTL} />
            <VerticalChoiceList name="lifetime_freq" value={data.section_g.lifetime_freq} onChange={handleChange('section_g')} options={FREQ_LIFETIME} isRTL={isRTL} />
          </div>
          <div>
            <FieldLabel code="C.G04" fr="Au cours des 12 DERNIERS MOIS, combien de fois avez-vous bu de l'alcool ?" ar="خلال الـ 12 شهراً الأخيرة، كم مرة شربت الكحول؟" isRTL={isRTL} />
            <VerticalChoiceList name="months_12_freq" value={data.section_g.months_12_freq} onChange={handleChange('section_g')} options={FREQ_LIFETIME} isRTL={isRTL} />
          </div>
          <div>
            <FieldLabel code="C.G05" fr="Au cours des 30 DERNIERS JOURS, combien de fois avez-vous bu de l'alcool ?" ar="خلال الـ 30 يوماً الأخيرة، كم مرة شربت الكحول؟" isRTL={isRTL} />
            <VerticalChoiceList name="days_30_freq" value={data.section_g.days_30_freq} onChange={handleChange('section_g')} options={FREQ_LIFETIME} isRTL={isRTL} />
          </div>
          <div>
            <FieldLabel code="C.G07" fr="Au cours des 30 DERNIERS JOURS, combien de fois avez-vous bu 5 verres d'alcool ou plus en une même occasion (Binge drinking) ?" ar="خلال الـ 30 يوماً الأخيرة، كم مرة شربت 5 كؤوس أو أكثر في مناسبة واحدة؟" isRTL={isRTL} />
            <VerticalChoiceList name="binge_drinking_30days" value={data.section_g.binge_drinking_30days} onChange={handleChange('section_g')} options={FREQ_BINGE} isRTL={isRTL} />
          </div>
          <div>
            <FieldLabel code="C.G08" fr="Au cours de votre vie, combien de fois avez-vous été ivre (au point de tituber ou d'avoir des difficultés d'élocution) ?" ar="خلال حياتك، كم مرة سكرت (لدرجة الترنح أو صعوبة الكلام)؟" isRTL={isRTL} />
            <VerticalChoiceList name="intoxication_lifetime" value={data.section_g.intoxication_lifetime} onChange={handleChange('section_g')} options={FREQ_LIFETIME} isRTL={isRTL} />
          </div>
          <div>
            <FieldLabel code="C.G09" fr="Quel âge aviez-vous quand vous avez bu votre premier verre d'alcool ?" ar="كم كان عمرك عندما شربت أول كأس كحول؟" isRTL={isRTL} />
            <VerticalChoiceList name="age_first_drink" value={data.section_g.age_first_drink} onChange={handleChange('section_g')} options={AGE_SCALE} isRTL={isRTL} />
          </div>
        </div>
      ),
    },

    // SECTION H
    {
      id: 'section_h',
      letter: 'H',
      title: 'Médicaments Tranquillisants / Sédatifs',
      titleAr: 'المهدئات والمنومات',
      subtitle: 'Questions sur les tranquillisants consommés sans ordonnance médicale.',
      subtitleAr: 'أسئلة حول استهلاك المهدئات بدون وصفة طبية.',
      color: 'bg-purple-950',
      content: (
        <div className="space-y-12">
          <div>
            <FieldLabel code="C.H01" fr="À votre avis, s'il vous était possible d'obtenir des tranquillisants ou sédatifs sans ordonnance, cela vous serait-il :" ar="حسب رأيك، إذا أردت الحصول على مهدئات بدون وصفة طبية، هل سيكون ذلك:" isRTL={isRTL} />
            <VerticalChoiceList name="access_difficulty" value={data.section_h.access_difficulty} onChange={handleChange('section_h')} options={DIFFICULTY_LEVELS} isRTL={isRTL} />
          </div>
          <div>
            <FieldLabel code="C.H03" fr="Au cours de votre vie, combien de fois avez-vous pris des tranquillisants/sédatifs sans ordonnance ?" ar="خلال حياتك، كم مرة تناولت مهدئات بدون وصفة طبية؟" isRTL={isRTL} />
            <VerticalChoiceList name="lifetime_freq" value={data.section_h.lifetime_freq} onChange={handleChange('section_h')} options={FREQ_LIFETIME} isRTL={isRTL} />
          </div>
          <div>
            <FieldLabel code="C.H04" fr="Au cours des 12 DERNIERS MOIS, combien de fois avez-vous pris des tranquillisants/sédatifs sans ordonnance ?" ar="خلال الـ 12 شهراً الأخيرة، كم مرة تناولت مهدئات بدون وصفة طبية؟" isRTL={isRTL} />
            <VerticalChoiceList name="months_12_freq" value={data.section_h.months_12_freq} onChange={handleChange('section_h')} options={FREQ_LIFETIME} isRTL={isRTL} />
          </div>
          <div>
            <FieldLabel code="C.H05" fr="Au cours des 30 DERNIERS JOURS, combien de fois avez-vous pris des tranquillisants/sédatifs sans ordonnance ?" ar="خلال الـ 30 يوماً الأخيرة، كم مرة تناولت مهدئات بدون وصفة طبية؟" isRTL={isRTL} />
            <VerticalChoiceList name="days_30_freq" value={data.section_h.days_30_freq} onChange={handleChange('section_h')} options={FREQ_LIFETIME} isRTL={isRTL} />
          </div>
          <div>
            <FieldLabel code="C.H06" fr="Quel âge aviez-vous quand vous avez pris des tranquillisants sans ordonnance pour la première fois ?" ar="كم كان عمرك عندما تناولت مهدئات بدون وصفة طبية لأول مرة؟" isRTL={isRTL} />
            <VerticalChoiceList name="age_first_use" value={data.section_h.age_first_use} onChange={handleChange('section_h')} options={AGE_SCALE} isRTL={isRTL} />
          </div>
        </div>
      ),
    },

    // SECTION I
    {
      id: 'section_i',
      letter: 'I',
      title: 'Cannabis (Zatla, Marihuana, Haschich)',
      titleAr: 'القنب الهندي (الزطلة، الماريجوانا، الحشيش)',
      subtitle: 'Questions sur la consommation de cannabis sous toutes ses formes.',
      subtitleAr: 'أسئلة حول استهلاك القنب الهندي بجميع أشكاله.',
      color: 'bg-emerald-900',
      content: (
        <div className="space-y-12">
          <div>
            <FieldLabel code="C.I01" fr="À votre avis, s'il vous était possible d'obtenir du cannabis (Zatla), cela vous serait-il :" ar="حسب رأيك، إذا أردت الحصول على الزطلة (القنب)، هل سيكون ذلك:" isRTL={isRTL} />
            <VerticalChoiceList name="access_difficulty" value={data.section_i.access_difficulty} onChange={handleChange('section_i')} options={DIFFICULTY_LEVELS} isRTL={isRTL} />
          </div>
          <div>
            <FieldLabel code="C.I03" fr="Au cours de votre vie, combien de fois avez-vous consommé du cannabis (Zatla) ?" ar="خلال حياتك، كم مرة استهلكت القنب الهندي (الزطلة)؟" isRTL={isRTL} />
            <VerticalChoiceList name="lifetime_freq" value={data.section_i.lifetime_freq} onChange={handleChange('section_i')} options={FREQ_LIFETIME} isRTL={isRTL} />
          </div>
          <div>
            <FieldLabel code="C.I04" fr="Au cours des 12 DERNIERS MOIS, combien de fois avez-vous consommé du cannabis ?" ar="خلال الـ 12 شهراً الأخيرة، كم مرة استهلكت القنب الهندي؟" isRTL={isRTL} />
            <VerticalChoiceList name="months_12_freq" value={data.section_i.months_12_freq} onChange={handleChange('section_i')} options={FREQ_LIFETIME} isRTL={isRTL} />
          </div>
          <div>
            <FieldLabel code="C.I05" fr="Au cours des 30 DERNIERS JOURS, combien de fois avez-vous consommé du cannabis ?" ar="خلال الـ 30 يوماً الأخيرة، كم مرة استهلكت القنب الهندي؟" isRTL={isRTL} />
            <VerticalChoiceList name="days_30_freq" value={data.section_i.days_30_freq} onChange={handleChange('section_i')} options={FREQ_LIFETIME} isRTL={isRTL} />
          </div>
          <div>
            <FieldLabel code="C.I06" fr="Quel âge aviez-vous quand vous avez consommé du cannabis pour la première fois ?" ar="كم كان عمرك عندما استهلكت القنب الهندي لأول مرة؟" isRTL={isRTL} />
            <VerticalChoiceList name="age_first_use" value={data.section_i.age_first_use} onChange={handleChange('section_i')} options={AGE_SCALE} isRTL={isRTL} />
          </div>
        </div>
      ),
    },

    // SECTION J, K, L, M (Autres Substances)
    {
      id: 'section_j',
      letter: 'J',
      title: 'Cocaïne et Crack',
      titleAr: 'الكوكايين والكراك',
      subtitle: 'Questions sur la consommation de cocaïne et ses dérivés.',
      subtitleAr: 'أسئلة حول استهلاك الكوكايين ومشتقاتها.',
      color: 'bg-cyan-950',
      content: (
        <div className="space-y-12">
          <div>
            <FieldLabel code="C.J01" fr="À votre avis, s'il vous était possible d'obtenir de la cocaïne, cela vous serait-il :" ar="حسب رأيك، إذا أردت الحصول على الكوكايين، هل سيكون ذلك:" isRTL={isRTL} />
            <VerticalChoiceList name="access_difficulty" value={data.section_j.access_difficulty} onChange={handleChange('section_j')} options={DIFFICULTY_LEVELS} isRTL={isRTL} />
          </div>
          <div>
            <FieldLabel code="C.J03" fr="Au cours de votre vie, combien de fois avez-vous consommé de la cocaïne ?" ar="خلال حياتك، كم مرة استهلكت الكوكايين؟" isRTL={isRTL} />
            <VerticalChoiceList name="lifetime_freq" value={data.section_j.lifetime_freq} onChange={handleChange('section_j')} options={FREQ_LIFETIME} isRTL={isRTL} />
          </div>
          <div>
            <FieldLabel code="C.J04" fr="Au cours des 12 DERNIERS MOIS, combien de fois avez-vous consommé de la cocaïne ?" ar="خلال الـ 12 شهراً الأخيرة، كم مرة استهلكت الكوكايين؟" isRTL={isRTL} />
            <VerticalChoiceList name="months_12_freq" value={data.section_j.months_12_freq} onChange={handleChange('section_j')} options={FREQ_LIFETIME} isRTL={isRTL} />
          </div>
        </div>
      ),
    },
    {
      id: 'section_k',
      letter: 'K',
      title: 'Ecstasy (MDMA)',
      titleAr: 'الإكستاسي (MDMA)',
      subtitle: 'Questions sur la consommation d’ecstasy / MDMA.',
      subtitleAr: 'أسئلة حول استهلاك الإكستاسي / MDMA.',
      color: 'bg-pink-950',
      content: (
        <div className="space-y-12">
          <div>
            <FieldLabel code="C.K01" fr="À votre avis, s'il vous était possible d'obtenir de l'ecstasy, cela vous serait-il :" ar="حسب رأيك، إذا أردت الحصول على الإكستاسي، هل سيكون ذلك:" isRTL={isRTL} />
            <VerticalChoiceList name="access_difficulty" value={data.section_k.access_difficulty} onChange={handleChange('section_k')} options={DIFFICULTY_LEVELS} isRTL={isRTL} />
          </div>
          <div>
            <FieldLabel code="C.K03" fr="Au cours de votre vie, combien de fois avez-vous consommé de l'ecstasy ?" ar="خلال حياتك، كم مرة استهلكت الإكستاسي؟" isRTL={isRTL} />
            <VerticalChoiceList name="lifetime_freq" value={data.section_k.lifetime_freq} onChange={handleChange('section_k')} options={FREQ_LIFETIME} isRTL={isRTL} />
          </div>
          <div>
            <FieldLabel code="C.K04" fr="Au cours des 12 DERNIERS MOIS, combien de fois avez-vous consommé de l'ecstasy ?" ar="خلال الـ 12 شهراً الأخيرة، كم مرة استهلكت الإكستاسي؟" isRTL={isRTL} />
            <VerticalChoiceList name="months_12_freq" value={data.section_k.months_12_freq} onChange={handleChange('section_k')} options={FREQ_LIFETIME} isRTL={isRTL} />
          </div>
        </div>
      ),
    },
    {
      id: 'section_l',
      letter: 'L',
      title: 'Héroïne et Opioïdes',
      titleAr: 'الهيروين والأفيونيات',
      subtitle: 'Questions sur la consommation d’héroïne ou autres opiacés.',
      subtitleAr: 'أسئلة حول استهلاك الهيروين أو مشتقات الأفيون.',
      color: 'bg-zinc-900',
      content: (
        <div className="space-y-12">
          <div>
            <FieldLabel code="C.L01" fr="À votre avis, s'il vous était possible d'obtenir de l'héroïne, cela vous serait-il :" ar="حسب رأيك، إذا أردت الحصول على الهيروين، هل سيكون ذلك:" isRTL={isRTL} />
            <VerticalChoiceList name="access_difficulty" value={data.section_l.access_difficulty} onChange={handleChange('section_l')} options={DIFFICULTY_LEVELS} isRTL={isRTL} />
          </div>
          <div>
            <FieldLabel code="C.L03" fr="Au cours de votre vie, combien de fois avez-vous consommé de l'héroïne ?" ar="خلال حياتك، كم مرة استهلكت الهيروين؟" isRTL={isRTL} />
            <VerticalChoiceList name="lifetime_freq" value={data.section_l.lifetime_freq} onChange={handleChange('section_l')} options={FREQ_LIFETIME} isRTL={isRTL} />
          </div>
          <div>
            <FieldLabel code="C.L04" fr="Au cours des 12 DERNIERS MOIS, combien de fois avez-vous consommé de l'héroïne ?" ar="خلال الـ 12 شهراً الأخيرة، كم مرة استهلكت الهيروين؟" isRTL={isRTL} />
            <VerticalChoiceList name="months_12_freq" value={data.section_l.months_12_freq} onChange={handleChange('section_l')} options={FREQ_LIFETIME} isRTL={isRTL} />
          </div>
        </div>
      ),
    },
    {
      id: 'section_m',
      letter: 'M',
      title: 'Substances Inhalées (Colle, Solvants)',
      titleAr: 'المواد المستنشقة (السيليسيون، المذيبات)',
      subtitle: "Questions sur l'inhalation de solvants, colle, essence ou gaz.",
      subtitleAr: 'أسئلة حول استنشاق السيليسيون، الغراء، البنزين أو الغاز.',
      color: 'bg-rose-950',
      content: (
        <div className="space-y-12">
          <div>
            <FieldLabel code="C.M01" fr="À votre avis, s'il vous était possible d'obtenir des solvants/colles pour les inhaler, cela vous serait-il :" ar="حسب رأيك، إذا أردت الحصول على السيليسيون/المذيبات للاستنشاق، هل سيكون ذلك:" isRTL={isRTL} />
            <VerticalChoiceList name="access_difficulty" value={data.section_m.access_difficulty} onChange={handleChange('section_m')} options={DIFFICULTY_LEVELS} isRTL={isRTL} />
          </div>
          <div>
            <FieldLabel code="C.M03" fr="Au cours de votre vie, combien de fois avez-vous inhalé des solvants ou colles pour vous droguer ?" ar="خلال حياتك، كم مرة استنشقت السيليسيون أو الغراء للانتشاء؟" isRTL={isRTL} />
            <VerticalChoiceList name="lifetime_freq" value={data.section_m.lifetime_freq} onChange={handleChange('section_m')} options={FREQ_LIFETIME} isRTL={isRTL} />
          </div>
          <div>
            <FieldLabel code="C.M04" fr="Au cours des 12 DERNIERS MOIS, combien de fois avez-vous inhalé des solvants ou colles ?" ar="خلال الـ 12 شهراً الأخيرة، كم مرة استنشقت المواد المذيبة؟" isRTL={isRTL} />
            <VerticalChoiceList name="months_12_freq" value={data.section_m.months_12_freq} onChange={handleChange('section_m')} options={FREQ_LIFETIME} isRTL={isRTL} />
          </div>
        </div>
      ),
    },

    // SECTION N
    {
      id: 'section_n',
      letter: 'N',
      title: 'Nouvelles Substances Psychoactives (NPS)',
      titleAr: 'المؤثرات العقلية الجديدة (NPS)',
      subtitle: 'Questions sur les cannabinoïdes et cathinones de synthèse.',
      subtitleAr: 'أسئلة حول القنب الاصطناعي والمواد المصنعة الجديدة.',
      color: 'bg-teal-950',
      content: (
        <div className="space-y-12">
          <div>
            <FieldLabel code="C.N01" fr="Avez-vous déjà consommé des cannabinoïdes de synthèse (Spice, K2...) ?" ar="هل سبق لك استهلاك القنب الاصطناعي (Spice, K2...)؟" isRTL={isRTL} />
            <VerticalChoiceList name="synthetic_cannabinoids" value={data.section_n.synthetic_cannabinoids} onChange={handleChange('section_n')} options={YES_NO} isRTL={isRTL} />
          </div>
          <div>
            <FieldLabel code="C.N02" fr="Avez-vous déjà consommé des cathinones de synthèse (sels de bain...) ?" ar="هل سبق لك استهلاك الكاثينونات الاصطناعية؟" isRTL={isRTL} />
            <VerticalChoiceList name="synthetic_cathinones" value={data.section_n.synthetic_cathinones} onChange={handleChange('section_n')} options={YES_NO} isRTL={isRTL} />
          </div>
        </div>
      ),
    },

    // SECTION P
    {
      id: 'section_p',
      letter: 'P',
      title: 'Autres Substances et Produits Fictifs',
      titleAr: 'مواد أخرى ومواد وهمية',
      subtitle: 'Questions de contrôle sur diverses substances.',
      subtitleAr: 'أسئلة مراقبة وتأكيد حول مواد متنوعة.',
      color: 'bg-slate-800',
      content: (
        <div className="space-y-12">
          <div>
            <FieldLabel code="C.P01" fr="Au cours de votre vie, avez-vous consommé une substance fictive (Mebrobamate/Relevin) ?" ar="خلال حياتك، هل استهلكت مادة وهمية (Mebrobamate/Relevin)؟" isRTL={isRTL} />
            <VerticalChoiceList name="fictive_substance_consumption" value={data.section_p.fictive_substance_consumption} onChange={handleChange('section_p')} options={YES_NO} isRTL={isRTL} />
          </div>
          <div>
            <FieldLabel code="C.P02" fr="Au cours de votre vie, combien de fois avez-vous pris d'autres médicaments ou drogues illicites ?" ar="خلال حياتك، كم مرة تناولت أدوية أخرى أو مخدرات غير قانونية؟" isRTL={isRTL} />
            <VerticalChoiceList name="lifetime_freq" value={data.section_p.lifetime_freq} onChange={handleChange('section_p')} options={FREQ_LIFETIME} isRTL={isRTL} />
          </div>
        </div>
      ),
    },

    // SECTION Q
    {
      id: 'section_q',
      letter: 'Q',
      title: 'Perception du Risque et Recherche d\'Aide',
      titleAr: 'إدراك المخاطر وطلب المساعدة',
      subtitle: 'Comment évaluez-vous le danger lié aux différentes consommations et vers qui vous tourneriez-vous ?',
      subtitleAr: 'كيف تقيم درجة خطورة الاستهلاك وإلى من قد تلجأ لطلب المساعدة؟',
      color: 'bg-indigo-950',
      content: (
        <div className="space-y-12">
          <GridQuestion
            title="À votre avis, quel est le niveau de risque pour une personne qui :"
            titleAr="حسب رأيك، ما هو مستوى الخطر على شخص يقوم بــ:"
            code="C.Q01"
            isRTL={isRTL}
            options={RISK_LEVELS}
            values={data.section_q.risk_perceptions}
            onChange={(key, val) => updateCheck('section_q', 'risk_perceptions', key, val)}
            items={[
              ['cigs_regular', '(C.Q01a) Fume un ou plusieurs paquets de cigarettes par jour', 'يدخن علبة سجائر أو أكثر يومياً'],
              ['alcohol_weekend', '(C.Q01b) Boit 4 ou 5 verres d\'alcool presque chaque week-end', 'يشرب 4 أو 5 كؤوس كحول كل عطلة أسبوع تقريباً'],
              ['cannabis_try', '(C.Q01c) Essaie le cannabis (Zatla) une ou deux fois', 'يجرب الزطلة مرة أو مرتين'],
              ['cannabis_regular', '(C.Q01d) Fume du cannabis régulièrement', 'يدخن الزطلة بانتظام'],
              ['ecigs_regular', '(C.Q01e) Utilise la cigarette électronique tous les jours', 'يستعمل السيجارة الإلكترونية يومياً'],
            ]}
          />
        </div>
      ),
    },

    // SECTION R
    {
      id: 'section_r',
      letter: 'R',
      title: 'Réseaux Sociaux et Internet',
      titleAr: 'شبكات التواصل الاجتماعي والإنترنت',
      subtitle: 'Questions sur le temps passé sur les réseaux sociaux et son impact sur votre quotidien.',
      subtitleAr: 'أسئلة حول الوقت المخصص لشبكات التواصل وتأثيره على حياتك اليومية.',
      color: 'bg-blue-950',
      content: (
        <div className="space-y-12">
          <GridQuestion
            title="Au cours des 30 DERNIERS JOURS, combien d'heures par jour avez-vous passées sur les réseaux sociaux :"
            titleAr="خلال الـ 30 يوماً الأخيرة، كم ساعة في اليوم قضيتها على شبكات التواصل:"
            code="C.R01"
            isRTL={isRTL}
            options={FREQ_DIGITAL}
            values={data.section_r.hours_per_day_breakdown}
            onChange={(key, val) => updateCheck('section_r', 'hours_per_day_breakdown', key, val)}
            items={[
              ['school_days', "(C.R01a) Les jours d'école (du lundi au vendredi)", 'أيام الدراسة'],
              ['non_school_days', "(C.R01b) Les jours de congé ou week-ends", 'أيام العطل ونهاية الأسبوع'],
            ]}
          />
          <GridQuestion
            title="Dans quelle mesure êtes-vous d'accord avec les affirmations suivantes :"
            titleAr="إلى أي مدى توافق على العبارات التالية:"
            code="C.R02"
            isRTL={isRTL}
            options={AGREEMENT_SCALE_PAPER}
            values={data.section_r.agreement}
            onChange={(key, val) => updateCheck('section_r', 'agreement', key, val)}
            items={[
              ['preoccupied', "(C.R02a) Je ne peux pas m'empêcher de penser aux réseaux sociaux", 'لا أستطيع التوقف عن التفكير في شبكات التواصل'],
              ['neglect', "(C.R02b) J'ai négligé d'autres activités à cause des réseaux sociaux", 'أهملت أنشطة أخرى بسبب شبكات التواصل'],
              ['bad_mood', '(C.R02c) Je me sens irritable ou contrarié(e) si je ne peux pas y accéder', 'أشعر بالغضب أو الانزعاج إذا لم أتمكن من الدخول'],
            ]}
          />
        </div>
      ),
    },

    // SECTION S
    {
      id: 'section_s',
      letter: 'S',
      title: 'Jeux Vidéo (Gaming)',
      titleAr: 'ألعاب الفيديو (Gaming)',
      subtitle: 'Questions sur la pratique des jeux vidéo sur PC, console ou téléphone.',
      subtitleAr: 'أسئلة حول ممارسة ألعاب الفيديو على الهاتف، الحاسوب أو أجهزة الألعاب.',
      color: 'bg-cyan-900',
      content: (
        <div className="space-y-12">
          <div>
            <FieldLabel code="C.S01" fr="Au cours des 30 DERNIERS JOURS, combien d'heures en moyenne par jour avez-vous passé sur les jeux vidéo les JOURS D'ÉCOLE ?" ar="خلال الـ 30 يوماً الأخيرة، كم ساعة في اليوم قضيتها في ألعاب الفيديو أيام الدراسة؟" isRTL={isRTL} />
            <VerticalChoiceList name="hours_per_day_school" value={data.section_s.hours_per_day_school} onChange={handleChange('section_s')} options={FREQ_DIGITAL} isRTL={isRTL} />
          </div>
          <div>
            <FieldLabel code="C.S02" fr="Au cours des 30 DERNIERS JOURS, combien d'heures en moyenne par jour avez-vous passé sur les jeux vidéo les JOURS DE CONGÉ / WEEK-END ?" ar="خلال الـ 30 يوماً الأخيرة، كم ساعة في اليوم قضيتها في ألعاب الفيديو أيام العطل ونهاية الأسبوع؟" isRTL={isRTL} />
            <VerticalChoiceList name="hours_per_day_non_school" value={data.section_s.hours_per_day_non_school} onChange={handleChange('section_s')} options={FREQ_DIGITAL} isRTL={isRTL} />
          </div>
          <GridQuestion
            title="Dans quelle mesure êtes-vous d'accord ou en désaccord avec les avis suivants concernant les jeux vidéo :"
            titleAr="إلى أي مدى أنت ضد أو مع الآراء الموالية عن ألعاب الفيديو؟"
            code="C.S03"
            isRTL={isRTL}
            options={AGREEMENT_SCALE_CS03}
            values={data.section_s.agreement}
            onChange={(key, val) => updateCheck('section_s', 'agreement', key, val)}
            items={[
              ['a', '(C.S03a) Je pense que je passe trop de temps sur les jeux vidéo', 'أعتقد أني أقضي وقتاً كبيراً في ألعاب الفيديو'],
              ['b', '(C.S03b) Je deviens de mauvaise humeur si je ne peux pas jouer', 'أصبح سيء المزاج إذا لم أتمكن من اللعب'],
              ['c', '(C.S03c) Mes parents me reprochent de trop jouer', 'يعاتبني والداي على قضاء وقت طويل في اللعب'],
            ]}
          />
        </div>
      ),
    },

    // SECTION T
    {
      id: 'section_t',
      letter: 'T',
      title: 'Jeux d\'Argent et de Hasard',
      titleAr: 'ألعاب الحظ والمراهنات',
      subtitle: 'Questions sur les jeux d\'argent (Promosport, paris sportifs en ligne, cartes, loterie...).',
      subtitleAr: 'أسئلة حول ألعاب الحظ والرهانات الرياضية والمقامرة على الإنترنت أو في المحلات.',
      color: 'bg-orange-950',
      content: (
        <div className="space-y-12">
          <div>
            <FieldLabel code="C.T01" fr="Combien de fois avez-vous joué à des jeux d'argent durant les 12 DERNIERS MOIS ?" ar="كم مرة لعبت القمار / شاركت في مراهنات خلال الـ 12 شهراً الأخيرة؟" isRTL={isRTL} />
            <VerticalChoiceList name="months_12_freq" value={data.section_t.months_12_freq} onChange={handleChange('section_t')} options={FREQ_LIFETIME} isRTL={isRTL} />
          </div>
          <GridQuestion
            title="Au cours des 12 DERNIERS MOIS, à quelle fréquence avez-vous joué à ces jeux d’argent EN RÉEL (kiosques, locaux...) :"
            titleAr="خلال الـ 12 شهراً الأخيرة، كم مرة شاركت في هذه الألعاب واقعياً (محلات، كشك...):"
            code="C.T02"
            isRTL={isRTL}
            options={FREQ_GAMBLING_GRID}
            values={data.section_t.offline_games}
            onChange={(key, val) => updateCheck('section_t', 'offline_games', key, val)}
            items={[
              ['promosport', '(C.T02a) Promosport / Paris sportifs réels', 'بروموسبور / رهانات رياضية واقعية'],
              ['cards_dice', '(C.T02b) Jeux de cartes ou de dés avec argent', 'ألعاب الورق أو النرد بالمال'],
              ['lottery', '(C.T02c) Loterie / Grattage (Hadh...)', 'اليانصيب / أوراق الحك'],
            ]}
          />
          <GridQuestion
            title="Au cours des 12 DERNIERS MOIS, à quelle fréquence avez-vous joué à des jeux d’argent EN LIGNE (Internet, téléphone) :"
            titleAr="خلال الـ 12 شهراً الأخيرة، كم مرة شاركت في هذه الألعاب على الإنترنت (هاتف، حاسوب):"
            code="C.T03"
            isRTL={isRTL}
            options={FREQ_GAMBLING_GRID}
            values={data.section_t.online_games}
            onChange={(key, val) => updateCheck('section_t', 'online_games', key, val)}
            items={[
              ['online_sports', '(C.T03a) Paris sportifs en ligne (sites web, applications)', 'مراهنات رياضية عبر الإنترنت'],
              ['online_casino', '(C.T03b) Casino / Poker en ligne', 'كازينو أو بوكر عبر الإنترنت'],
            ]}
          />
          <div>
            <FieldLabel code="C.T04" fr="Avez-vous déjà ressenti le besoin de parier des sommes d'argent de plus en plus importantes ?" ar="هل شعرت يوماً بالحاجة إلى المراهنة بمبالغ مالية متزايدة؟" isRTL={isRTL} />
            <VerticalChoiceList name="felt_need_increase" value={data.section_t.felt_need_increase} onChange={handleChange('section_t')} options={YES_NO} isRTL={isRTL} />
          </div>
          <div>
            <FieldLabel code="C.T05" fr="Avez-vous déjà menti à vos parents ou à vos amis sur l'argent que vous aviez parié ?" ar="هل كذبت يوماً على والديك أو أصدقائك حول الأموال التي راهنت بها؟" isRTL={isRTL} />
            <VerticalChoiceList name="lied_about_it" value={data.section_t.lied_about_it} onChange={handleChange('section_t')} options={YES_NO} isRTL={isRTL} />
          </div>
          <CT06Question
            title="Questions d'évaluation sur les habitudes de jeu :"
            titleAr="أسئلة تقييمية حول عادات المقامرة واللعب بالمال:"
            code="C.T06"
            isRTL={isRTL}
            values={data.section_t.gambling_problems}
            onChange={(key, val) => updateCheck('section_t', 'gambling_problems', key, val)}
            items={[
              ['a', '(C.T06a) Combien de fois avez-vous rejoué pour vous refaire après avoir perdu ?', 'كم مرة أعدت اللعب لتعويض الخسارة؟'],
              ['b', "(C.T06b) Combien de fois avez-vous dépensé plus d'argent que prévu dans les paris ?", 'كم مرة أنفقت مالاً أكثر مما خططت له في الرهان؟'],
              ['c', "(C.T06c) Combien de fois vous êtes-vous senti coupable d'avoir parié ?", 'كم مرة شعرت بالذنب بسبب المراهنة؟'],
              ['d', "(C.T06d) Le jeu d'argent a-t-il déjà causé des disputes avec vos proches ?", 'هل تسببت ألعاب الحظ في خلافات مع أقاربك؟'],
              ['e', "(C.T06e) Avez-vous déjà emprunté de l'argent pour parier ?", 'هل اقترضت يوماً المال للمراهنة؟'],
            ]}
          />
        </div>
      ),
    },

    // SECTION U
    {
      id: 'section_u',
      letter: 'U',
      title: 'Violence et Sécurité',
      titleAr: 'العنف والسلامة',
      subtitle: 'Questions sur les bagarres physiques, blessures et sentiment de sécurité.',
      subtitleAr: 'أسئلة حول المشاجرات الجسدية، الإصابات والشعور بالأمان.',
      color: 'bg-red-900',
      content: (
        <div className="space-y-12">
          <div>
            <FieldLabel code="C.U01" fr="Au cours des 12 derniers mois, combien de fois vous êtes-vous battu(e) physiquement avec d'autres personnes ?" ar="كم مرة تشاجرت جسدياً خلال الـ 12 شهراً الماضية؟" isRTL={isRTL} />
            <VerticalChoiceList name="fights_12months" value={data.section_u.fights_12months} onChange={handleChange('section_u')} options={FIGHT_FREQUENCY} isRTL={isRTL} />
          </div>
          <div>
            <FieldLabel code="C.U02" fr="Quelles étaient les circonstances de la dernière bagarre ?" ar="ما هي ظروف الشجار الأخير؟" isRTL={isRTL} />
            <VerticalChoiceList
              name="fight_circumstances"
              value={data.section_u.fight_circumstances}
              onChange={handleChange('section_u')}
              options={[
                ['1', "Je me battais avec quelqu'un (j'étais l'initiateur)", 'كنت أتشاجر مع شخص (أنا من بدأ)', 1],
                ['2', "Quelqu'un m'a agressé(e) et je me suis défendu(e)", 'اعتدى علي شخص ودافعت عن نفسي', 2],
                ['3', "C'était une bagarre de groupe", 'كان شجاراً جماعياً', 3],
                ['4', "Je ne me suis pas battu(e)", 'لم أتشاجر', 4],
              ]}
              isRTL={isRTL}
            />
          </div>
          <div>
            <FieldLabel code="C.U03" fr="Où s'est déroulée la dernière bagarre ?" ar="أين حدث الشجار الأخير؟" isRTL={isRTL} />
            <VerticalChoiceList
              name="fight_location"
              value={data.section_u.fight_location}
              onChange={handleChange('section_u')}
              options={[
                ['1', "Dans l'établissement scolaire", 'داخل المؤسسة التربوية', 1],
                ['2', "Aux alentours du lycée / dans la rue", 'بمحيط المدرسة / في الشارع', 2],
                ['3', "Dans le quartier / près de chez moi", 'في الحي / قرب المنزل', 3],
                ['4', "Ailleurs", 'في مكان آخر', 4],
                ['5', "Non applicable (pas de bagarre)", 'غير منطبق', 5],
              ]}
              isRTL={isRTL}
            />
          </div>
          <div>
            <FieldLabel code="C.U04" fr="Le personnel éducatif est-il intervenu lors de cette bagarre ?" ar="هل تدخل الإطار التربوي لفض هذا الشجار؟" isRTL={isRTL} />
            <VerticalChoiceList name="staff_intervention" value={data.section_u.staff_intervention} onChange={handleChange('section_u')} options={YES_NO_DK} isRTL={isRTL} />
          </div>
        </div>
      ),
    },

    // SECTION V
    {
      id: 'section_v',
      letter: 'V',
      title: 'Niveau de Stress Perçu (PSS-4)',
      titleAr: 'مستوى التوتر المدرك (PSS-4)',
      subtitle: 'Questions standardisées sur la gestion des émotions et des situations difficiles.',
      subtitleAr: 'أسئلة معيارية حول التعامل مع الضغوط والمواقف الصعبة خلال الشهر الماضي.',
      color: 'bg-violet-950',
      content: (
        <div className="space-y-12">
          <div>
            <FieldLabel code="C.V01" fr="Durant le mois passé, combien de fois avez-vous eu le sentiment de ne pas pouvoir contrôler les aspects importants de votre vie ?" ar="خلال الشهر الماضي، كم مرة شعرت بعدم القدرة على التحكم في الأمور المهمة في حياتك؟" isRTL={isRTL} />
            <VerticalChoiceList name="a" value={data.section_v.a} onChange={handleChange('section_v')} options={STRESS_FREQ} isRTL={isRTL} />
          </div>
          <div>
            <FieldLabel code="C.V02" fr="Durant le mois passé, combien de fois avez-vous eu confiance en votre capacité à gérer vos problèmes personnels ?" ar="خلال الشهر الماضي، كم مرة شعرت بالثقة في قدرتك على التعامل مع مشاكلك الشخصية؟" isRTL={isRTL} />
            <VerticalChoiceList name="b" value={data.section_v.b} onChange={handleChange('section_v')} options={STRESS_FREQ} isRTL={isRTL} />
          </div>
          <div>
            <FieldLabel code="C.V03" fr="Durant le mois passé, combien de fois avez-vous senti que les choses allaient selon vos désirs ?" ar="خلال الشهر الماضي، كم مرة شعرت بأن الأمور تسير وفق رغباتك؟" isRTL={isRTL} />
            <VerticalChoiceList name="c" value={data.section_v.c} onChange={handleChange('section_v')} options={STRESS_FREQ} isRTL={isRTL} />
          </div>
          <div>
            <FieldLabel code="C.V04" fr="Durant le mois passé, combien de fois avez-vous senti que les difficultés s’accumulaient au point de ne plus pouvoir les surmonter ?" ar="خلال الشهر الماضي، كم مرة شعرت بأن الصعوبات تتراكم لدرجة أنك لا تستطيع التغلب عليها؟" isRTL={isRTL} />
            <VerticalChoiceList name="d" value={data.section_v.d} onChange={handleChange('section_v')} options={STRESS_FREQ} isRTL={isRTL} />
          </div>
        </div>
      ),
    },

    // SECTION Z
    {
      id: 'section_z',
      letter: 'Z',
      title: 'Validation de l\'Honnêteté',
      titleAr: 'تأكيد الصدق والصراحة',
      subtitle: 'Ces deux dernières questions nous aident à garantir la validité scientifique de l\'étude.',
      subtitleAr: 'السؤالان الأخيران يساعداننا على ضمان الصدق العلمي للدراسة.',
      color: 'bg-emerald-950',
      content: (
        <div className="space-y-12">
          <div>
            <FieldLabel code="C.Z01" fr="Dans quelle mesure avez-vous répondu honnêtement aux questions concernant votre consommation d'alcool ?" ar="إلى أي مدى كنت صادقاً في إجاباتك المتعلقة باستهلاك الكحول؟" isRTL={isRTL} />
            <VerticalChoiceList
              name="honesty_level"
              value={data.section_z.honesty_level}
              onChange={handleChange('section_z')}
              options={[
                ['1', "J'ai déjà déclaré ma consommation avec honnêteté", 'صرحت باستهلاكي بكل صدق', 1],
                ['2', "Oui, sans aucun doute, j'ai répondu honnêtement", 'نعم، بكل تأكيد أجبت بصدق', 2],
                ['3', "Probablement oui", 'على الأرجح نعم', 3],
                ['4', "Probablement pas", 'على الأرجح لا', 4],
                ['5', "Non, je n'ai pas été honnête", 'لا، لم أكن صادقاً', 5],
              ]}
              isRTL={isRTL}
            />
          </div>
          <div>
            <FieldLabel code="C.Z02" fr="Si vous aviez consommé du cannabis (Zatla), l'auriez-vous dit dans ce questionnaire ?" ar="لو أنك استهلكت القنب الهندي (الزطلة)، هل كنت ستصرح بذلك في هذا الاستبيان؟" isRTL={isRTL} />
            <VerticalChoiceList
              name="honesty_cannabis"
              value={data.section_z.honesty_cannabis}
              onChange={handleChange('section_z')}
              options={[
                ['1', "J'ai déjà déclaré en avoir consommé", 'صرحت بالفعل باستهلاكي له', 1],
                ['2', "Certainement oui", 'نعم بكل تأكيد', 2],
                ['3', "Probablement oui", 'على الأرجح نعم', 3],
                ['4', "Probablement non", 'على الأرجح لا', 4],
                ['5', "Certainement non", 'بالتأكيد لا', 5],
              ]}
              isRTL={isRTL}
            />
          </div>
        </div>
      ),
    },
  ];

  const currentSection = SECTIONS[step];

  return (
    <div className={`min-h-screen bg-slate-100 py-10 px-4 sm:px-6 lg:px-8 font-sans ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <ChoiceInteractionStyles />

      <div className="max-w-4xl mx-auto">
        {/* Top bar with back, lang switch, and active report info */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white text-slate-700 font-bold text-sm rounded-xl border border-slate-200 shadow-sm hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft size={16} className={isRTL ? 'rotate-180' : ''} />
            {isRTL ? 'رجوع' : 'Retour'}
          </button>

          <div className="flex items-center gap-3">
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

      {/* Location Modal */}
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
"""

with open('frontend/src/components/QuestionnaireForm.jsx', 'w', encoding='utf-8') as f:
    f.write(header + '\n' + form_body)

print("Successfully written merged QuestionnaireForm.jsx!")
