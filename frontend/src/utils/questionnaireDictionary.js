// Comprehensive MedSPAD Questionnaire Translation & Human-Readable Formatter

export const MEDSPAD_SECTIONS = {
    A: {
        code: 'A',
        title: "Informations Générales & Scolarité",
        desc: "Données démographiques, contexte de vie et climat scolaire",
        color: "from-blue-600 to-indigo-600",
        iconColor: "text-blue-400"
    },
    B: {
        code: 'B',
        title: "Famille & Situation Socio-Économique",
        desc: "Niveau d'instruction parental, profession et cadre familial",
        color: "from-indigo-600 to-violet-600",
        iconColor: "text-indigo-400"
    },
    C: {
        code: 'C',
        title: "Usage de Tabac (Cigarettes)",
        desc: "Expérimentation, fréquence à 30 jours et âge d'initiation",
        color: "from-amber-600 to-orange-600",
        iconColor: "text-amber-400"
    },
    D: {
        code: 'D',
        title: "Cigarettes Électroniques (Vape)",
        desc: "Pratique du vapotage, accès et fréquence d'utilisation",
        color: "from-cyan-600 to-blue-600",
        iconColor: "text-cyan-400"
    },
    E: {
        code: 'E',
        title: "Chicha / Narguilé",
        desc: "Usage au cours de la vie, des 12 mois et des 30 derniers jours",
        color: "from-orange-600 to-amber-700",
        iconColor: "text-orange-400"
    },
    G: {
        code: 'G',
        title: "Consommation d'Alcool & Binge Drinking",
        desc: "Fréquence, ivresses, accès et modes de consommation",
        color: "from-rose-600 to-pink-600",
        iconColor: "text-rose-400"
    },
    H: {
        code: 'H',
        title: "Tranquillisants & Sédatifs",
        desc: "Médicaments consommés sans prescription médicale",
        color: "from-purple-600 to-violet-700",
        iconColor: "text-purple-400"
    },
    I: {
        code: 'I',
        title: "Usage de Cannabis (Zatla, Herbe)",
        desc: "Initiation, fréquence, types et problèmes liés",
        color: "from-emerald-600 to-teal-700",
        iconColor: "text-emerald-400"
    },
    J: {
        code: 'J',
        title: "Cocaïne & Crack",
        desc: "Expérimentation, accès et usage de stimulants",
        color: "from-red-600 to-rose-700",
        iconColor: "text-red-400"
    },
    K: {
        code: 'K',
        title: "Ecstasy / MDMA",
        desc: "Consommation de substances de synthèse en milieu festif",
        color: "from-fuchsia-600 to-pink-700",
        iconColor: "text-fuchsia-400"
    },
    L: {
        code: 'L',
        title: "Héroïne & Opiacés",
        desc: "Usage d'opiacés et voies d'administration",
        color: "from-red-800 to-stone-900",
        iconColor: "text-red-300"
    },
    M: {
        code: 'M',
        title: "Inhalants & Solvants (Colles)",
        desc: "Usage de produits volatils à visée psychoactive",
        color: "from-yellow-600 to-amber-700",
        iconColor: "text-yellow-400"
    },
    N: {
        code: 'N',
        title: "Nouvelles Substances Psychoactives (NPS)",
        desc: "Cannabinoïdes et cathinones synthétiques",
        color: "from-slate-700 to-slate-900",
        iconColor: "text-slate-300"
    },
    P: {
        code: 'P',
        title: "Substances Fictives & Validité",
        desc: "Contrôles d'attention et consommation de produits pièges",
        color: "from-indigo-800 to-slate-900",
        iconColor: "text-indigo-300"
    },
    Q: {
        code: 'Q',
        title: "Perception des Risques & Sources d'Aide",
        desc: "Dangerosité perçue et recours en cas de problème",
        color: "from-sky-600 to-blue-700",
        iconColor: "text-sky-400"
    },
    R: {
        code: 'R',
        title: "Jeux Vidéo & Réseaux Sociaux",
        desc: "Temps d'écran quotidien et sentiment de dépendance",
        color: "from-teal-600 to-cyan-700",
        iconColor: "text-teal-400"
    },
    S: {
        code: 'S',
        title: "Usage d'Internet & Smartphone",
        desc: "Volume d'heures d'utilisation et impact quotidien",
        color: "from-blue-700 to-indigo-800",
        iconColor: "text-blue-300"
    },
    T: {
        code: 'T',
        title: "Jeux de Hasard et d'Argent (JHA)",
        desc: "Paris sportifs, jeux en ligne et mise d'argent",
        color: "from-emerald-700 to-green-800",
        iconColor: "text-emerald-300"
    },
    U: {
        code: 'U',
        title: "Climat Scolaire, Bagarres & Harcèlement",
        desc: "Violences physiques, blessures et sentiment de sécurité",
        color: "from-rose-700 to-red-900",
        iconColor: "text-rose-400"
    },
    V: {
        code: 'V',
        title: "Santé Mentale, Stress & Estime de Soi",
        desc: "Bien-être psychologique, anxiété et dépression",
        color: "from-violet-700 to-purple-900",
        iconColor: "text-violet-300"
    },
    Z: {
        code: 'Z',
        title: "Indicateurs de Validité & Sincérité",
        desc: "Contrôles de cohérence et sincérité déclarée",
        color: "from-slate-800 to-slate-950",
        iconColor: "text-slate-400"
    }
};

// Global Option Translation Maps
export const COMMON_OPTION_LABELS = {
    // Frequency Lifetime / 12 Months
    "1": "Jamais",
    "2": "1 à 2 fois",
    "3": "3 à 5 fois",
    "4": "6 à 9 fois",
    "5": "10 à 19 fois",
    "6": "20 à 39 fois",
    "7": "40 fois ou plus",

    // Yes / No
    "true": "Oui",
    "false": "Non",
    "oui": "Oui",
    "non": "Non",
    "M": "Masculin (Garçon)",
    "F": "Féminin (Fille)",

    // Difficulty
    "diff_1": "Impossible à obtenir",
    "diff_2": "Très difficile",
    "diff_3": "Assez difficile",
    "diff_4": "Assez facile",
    "diff_5": "Très facile",
    "diff_6": "Je ne sais pas",

    // Household
    "father": "Père",
    "mother": "Mère",
    "stepfather": "Beau-père",
    "stepmother": "Belle-mère",
    "brothers_sisters": "Frères / Sœurs",
    "grandparents": "Grands-parents",
    "other_relatives": "Autres membres de la famille",
    "alone": "Seul(e)",
    "foster": "Foyer d'accueil / Internat",
    "friends": "Amis / Colocataires"
};

// Question Definitions with Full Question Text & Labels
export const QUESTIONS_METADATA = {
    // Section A
    gender: {
        code: "C.A01",
        label: "Quel est votre genre ?",
        options: { "M": "Masculin (Garçon)", "F": "Féminin (Fille)" }
    },
    birth_month: {
        code: "C.A02m",
        label: "Mois de naissance",
        options: {
            "1": "Janvier", "2": "Février", "3": "Mars", "4": "Avril",
            "5": "Mai", "6": "Juin", "7": "Juillet", "8": "Août",
            "9": "Septembre", "10": "Octobre", "11": "Novembre", "12": "Décembre"
        }
    },
    birth_year: {
        code: "C.A02a",
        label: "Année de naissance",
        formatter: (val) => val ? `${val} (${2026 - parseInt(val)} ans)` : 'Non renseigné'
    },
    activities_frequency: {
        code: "C.A03",
        label: "Fréquence hebdomadaire des activités de loisirs",
        subItems: {
            sports: "Pratique d'un sport ou exercice physique",
            reading: "Lecture de livres pour le plaisir",
            going_out: "Sorties le soir avec des amis",
            hobbies: "Jeux vidéo et loisirs numériques",
            park: "Promenade dans les parcs ou espaces verts",
            internet: "Navigation sur Internet et réseaux sociaux",
            tv: "Télévision, séries ou films"
        },
        options: {
            "1": "Jamais",
            "2": "Moins d'1 fois/semaine",
            "3": "1 à 2 fois/semaine",
            "4": "3 à 4 fois/semaine",
            "5": "5 fois ou plus/semaine"
        }
    },
    academic_performance: {
        code: "C.A08",
        label: "Quel est votre niveau de rendement scolaire global ?",
        options: {
            "1": "En dessous de la moyenne (< 10/20)",
            "2": "Moyen (entre 10 et 12/20)",
            "3": "Au-dessus de la moyenne (> 12/20)"
        }
    },
    household_members: {
        code: "C.A09",
        label: "Personnes vivant habituellement avec vous dans le foyer",
        formatter: (val) => {
            if (!Array.isArray(val) || val.length === 0) return 'Aucun ou non précisé';
            return val.map(m => COMMON_OPTION_LABELS[m] || m).join(', ');
        }
    },
    parents_absence_reason: {
        code: "C.A10",
        label: "Motif principal de séparation ou d'absence d'un parent",
        options: {
            "1": "Décès d'un ou des deux parents",
            "2": "Divorce ou séparation",
            "3": "Migration / Travail à l'étranger",
            "4": "Autre motif"
        }
    },
    parents_absence_reason_other: {
        code: "C.A10_AUTRE",
        label: "Précision de l'autre motif d'absence parentale"
    },
    nights_out_30days: {
        code: "C.A11",
        label: "Combien de soirs êtes-vous sorti(e) pour vous amuser au cours des 30 derniers jours ?",
        options: {
            "1": "Aucun soir", "2": "1 soir", "3": "2 soirs", "4": "3 soirs",
            "5": "4 soirs", "6": "5 soirs", "7": "6 soirs", "8": "7 soirs ou plus"
        }
    },
    school_appreciation: {
        code: "C.A12",
        label: "Comment appréciez-vous l'ambiance générale dans votre lycée ?",
        options: {
            "1": "J'aime beaucoup", "2": "J'aime bien", "3": "Neutre / Moyen",
            "4": "Je n'aime pas tellement", "5": "Je déteste"
        }
    },
    family_relationship_satisfaction: {
        code: "C.A13",
        label: "Degré de satisfaction des relations avec vos proches",
        subItems: {
            a: "Relations avec votre père",
            b: "Relations avec votre mère",
            c: "Relations avec vos frères et sœurs",
            d: "Relations avec vos amis proches",
            e: "Ambiance générale dans votre famille"
        },
        options: {
            "1": "Très satisfait(e)",
            "2": "Plutôt satisfait(e)",
            "3": "Plutôt insatisfait(e)",
            "4": "Très insatisfait(e)",
            "5": "Non applicable"
        }
    },
    school_absences: {
        code: "C.A14",
        label: "Nombre de jours d'absence scolaire au cours des 30 derniers jours",
        subItems: {
            a: "Pour cause de maladie",
            b: "Absence non justifiée / Fuite des cours",
            c: "Obligations familiales ou personnelles",
            d: "Autre raison"
        },
        options: {
            "1": "Aucune fois (0 jour)",
            "2": "1 à 2 jours",
            "3": "3 à 5 jours",
            "4": "6 à 9 jours",
            "5": "10 jours ou plus"
        }
    },

    // Section B
    father_education: {
        code: "C.B01",
        label: "Plus haut niveau d'études atteint par le père",
        options: {
            "1": "Non scolarisé", "2": "Primaire (incomplet)", "3": "Primaire (terminé)",
            "4": "Collège (incomplet)", "5": "Collège (terminé)", "6": "Secondaire (sans BAC)",
            "7": "Secondaire (titulaire du BAC)", "8": "Études Supérieures (Universitaire)",
            "9": "Formation Professionnelle", "10": "Ne sait pas", "11": "Non applicable"
        }
    },
    mother_education: {
        code: "C.B02",
        label: "Plus haut niveau d'études atteint par la mère",
        options: {
            "1": "Non scolarisée", "2": "Primaire (incomplet)", "3": "Primaire (terminé)",
            "4": "Collège (incomplet)", "5": "Collège (terminé)", "6": "Secondaire (sans BAC)",
            "7": "Secondaire (titulaire du BAC)", "8": "Études Supérieures (Universitaire)",
            "9": "Formation Professionnelle", "10": "Ne sait pas", "11": "Non applicable"
        }
    },
    father_job: {
        code: "C.B03",
        label: "Situation professionnelle actuelle du père",
        options: {
            "1": "Travaille à plein temps", "2": "Travaille à temps partiel",
            "3": "Sans emploi / Ne travaille pas", "4": "Retraité", "5": "Je ne sais pas", "6": "Non applicable"
        }
    },
    mother_job: {
        code: "C.B04",
        label: "Situation professionnelle actuelle de la mère",
        options: {
            "1": "Travaille à plein temps", "2": "Travaille à temps partiel",
            "3": "Femme au foyer / Sans emploi", "4": "Retraitée", "5": "Je ne sais pas", "6": "Non applicable"
        }
    },
    economic_status: {
        code: "C.B05",
        label: "Évaluation de la situation financière de la famille par rapport aux autres",
        options: {
            "1": "Bien meilleure", "2": "Un peu meilleure", "3": "À peu près pareille",
            "4": "Un peu moins bonne", "5": "Bien moins bonne", "6": "Je ne sais pas"
        }
    },
    private_room: {
        code: "C.B06",
        label: "Avez-vous une chambre individuelle à la maison ?",
        options: { "1": "Oui", "2": "Non" }
    },

    // Substances (C, D, E, G, H, I, J, K, L, M)
    access_difficulty: {
        code: "ACCES",
        label: "Facilité ou difficulté perçue à se procurer le produit",
        options: {
            "1": "Impossible à obtenir", "2": "Très difficile", "3": "Assez difficile",
            "4": "Assez facile", "5": "Très facile", "6": "Je ne sais pas"
        }
    },
    social_circle: {
        code: "PAIRS",
        label: "Consommation parmi les amis et l'entourage proche",
        subItems: {
            friends: "Parmi vos meilleurs amis",
            classmates: "Parmi vos camarades de classe",
            family: "Dans votre cercle familial"
        },
        options: {
            "1": "Aucun",
            "2": "Quelques-uns",
            "3": "La majorité",
            "4": "Tous",
            "5": "Je ne sais pas"
        }
    },
    lifetime_freq: {
        code: "FREQ_VIE",
        label: "Fréquence de consommation au cours de la vie entière",
        options: {
            "1": "Jamais (0 fois)", "2": "1 à 2 fois", "3": "3 à 5 fois",
            "4": "6 à 9 fois", "5": "10 à 19 fois", "6": "20 à 39 fois", "7": "40 fois ou plus"
        }
    },
    months_12_freq: {
        code: "FREQ_12M",
        label: "Fréquence de consommation au cours des 12 derniers mois",
        options: {
            "1": "Jamais", "2": "1 à 2 fois", "3": "3 à 5 fois",
            "4": "6 à 9 fois", "5": "10 à 19 fois", "6": "20 à 39 fois", "7": "40 fois ou plus"
        }
    },
    days_30_freq: {
        code: "FREQ_30J",
        label: "Fréquence de consommation au cours des 30 derniers jours",
        options: {
            "1": "Jamais au cours des 30 derniers jours",
            "2": "Moins d'une fois par semaine",
            "3": "1 à 2 fois par semaine",
            "4": "3 à 5 fois par semaine",
            "5": "Tous les jours ou presque",
            "6": "Plusieurs fois par jour"
        }
    },
    age_first_use: {
        code: "AGE_INIT",
        label: "Âge à la première consommation",
        options: {
            "1": "Jamais consommé", "2": "9 ans ou moins", "3": "10 ans",
            "4": "11 ans", "5": "12 ans", "6": "13 ans", "7": "14 ans",
            "8": "15 ans", "9": "16 ans ou plus"
        }
    },
    age_daily_use: {
        code: "AGE_QUOT",
        label: "Âge au début de la consommation quotidienne",
        options: {
            "1": "Jamais consommé quotidiennement", "2": "9 ans ou moins", "3": "10 ans",
            "4": "11 ans", "5": "12 ans", "6": "13 ans", "7": "14 ans",
            "8": "15 ans", "9": "16 ans ou plus"
        }
    },

    // Section G (Alcool spécifique)
    binge_drinking_30days: {
        code: "C.G07",
        label: "Consommation excessive ponctuelle (≥ 5 verres en une occasion)",
        options: {
            "1": "Aucune fois", "2": "1 fois", "3": "2 fois",
            "4": "3 à 5 fois", "5": "6 à 9 fois", "6": "10 fois ou plus"
        }
    },
    intoxication_lifetime: {
        code: "C.G08",
        label: "Nombre d'ivresses au cours de la vie entière",
        options: {
            "1": "Jamais", "2": "1 à 2 fois", "3": "3 à 5 fois",
            "4": "6 à 9 fois", "5": "10 à 19 fois", "6": "20 à 39 fois", "7": "40 fois ou plus"
        }
    },
    intoxication_12months: {
        code: "C.G09",
        label: "Nombre d'ivresses au cours des 12 derniers mois",
        options: {
            "1": "Jamais", "2": "1 à 2 fois", "3": "3 à 5 fois",
            "4": "6 à 9 fois", "5": "10 à 19 fois", "6": "20 à 39 fois", "7": "40 fois ou plus"
        }
    },
    intoxication_30days: {
        code: "C.G10",
        label: "Nombre d'ivresses au cours des 30 derniers jours",
        options: {
            "1": "Jamais", "2": "1 à 2 fois", "3": "3 à 5 fois",
            "4": "6 à 9 fois", "5": "10 fois ou plus"
        }
    },

    // Section P (Piège & NPS)
    fictive_substance_consumption: {
        code: "C.P01",
        label: "Consommation de la substance 'Relevin' (Question piège)",
        options: { "1": "Oui (Déclaré)", "2": "Non (Jamais consommé)" }
    },

    // Section Z (Honnêteté)
    honesty_level: {
        code: "C.Z01",
        label: "Franchise et sincérité déclarée lors de ce questionnaire",
        options: {
            "1": "Oui, tout à fait sincèrement",
            "2": "Oui, pour la très grande majorité",
            "3": "Moyennement sincère",
            "4": "Non, pas vraiment",
            "5": "Non, pas du tout sincère"
        }
    },
    honesty_cannabis: {
        code: "C.Z02",
        label: "Déclaration hypothétique de consommation de cannabis",
        options: {
            "1": "Oui, je l'ai déjà déclaré",
            "2": "Oui, sans aucune hésitation",
            "3": "Probablement oui",
            "4": "Probablement pas",
            "5": "Certainement pas"
        }
    },
    honesty_heroin: {
        code: "C.Z03",
        label: "Déclaration hypothétique de consommation d'héroïne",
        options: {
            "1": "Oui, je l'ai déjà déclaré",
            "2": "Oui, sans aucune hésitation",
            "3": "Probablement oui",
            "4": "Probablement pas",
            "5": "Certainement pas"
        }
    }
};

/**
 * Helper to get clean, human-readable question title and formatted answer
 */
export const formatQuestionAndAnswer = (sectionKey, fieldKey, rawValue) => {
    const fieldMeta = QUESTIONS_METADATA[fieldKey];
    
    let questionCode = fieldMeta?.code || fieldKey.toUpperCase().replace(/_/g, '.');
    let questionLabel = fieldMeta?.label || fieldKey.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    let formattedAnswer = rawValue;

    if (rawValue === null || rawValue === undefined || rawValue === '') {
        formattedAnswer = 'Non renseigné';
    } else if (fieldMeta?.formatter) {
        formattedAnswer = fieldMeta.formatter(rawValue);
    } else if (fieldMeta?.options && fieldMeta.options[String(rawValue)]) {
        formattedAnswer = fieldMeta.options[String(rawValue)];
    } else if (COMMON_OPTION_LABELS[String(rawValue).toLowerCase()]) {
        formattedAnswer = COMMON_OPTION_LABELS[String(rawValue).toLowerCase()];
    } else if (typeof rawValue === 'boolean') {
        formattedAnswer = rawValue ? 'Oui' : 'Non';
    } else if (typeof rawValue === 'object') {
        if (Array.isArray(rawValue)) {
            formattedAnswer = rawValue.length > 0 
                ? rawValue.map(v => COMMON_OPTION_LABELS[String(v).toLowerCase()] || v).join(', ') 
                : 'Aucun élément sélectionné';
        } else {
            // Object / Map (Matrix sub-items)
            const entries = Object.entries(rawValue);
            if (entries.length === 0) {
                formattedAnswer = 'Aucune donnée renseignée';
            } else {
                formattedAnswer = entries.map(([subKey, subVal]) => {
                    const subLabel = fieldMeta?.subItems?.[subKey] || subKey.toUpperCase();
                    const valLabel = fieldMeta?.options?.[String(subVal)] 
                        || COMMON_OPTION_LABELS[String(subVal).toLowerCase()] 
                        || (subVal === true ? 'Oui' : (subVal === false ? 'Non' : subVal));
                    return `${subLabel} : ${valLabel || 'Non précisé'}`;
                }).join(' • ');
            }
        }
    } else {
        formattedAnswer = String(rawValue).replace(/_/g, ' ');
    }

    return {
        code: questionCode,
        label: questionLabel,
        value: formattedAnswer,
        rawValue: rawValue
    };
};
