from rest_framework.decorators import api_view, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
import json

try:
    import pytesseract
    from PIL import Image
    HAS_OCR = True
except ImportError:
    HAS_OCR = False

@api_view(['POST'])
@parser_classes([MultiPartParser, FormParser])
def upload_scan(request):
    """
    Receives an image/PDF of a questionnaire and runs OCR to extract data.
    """
    if 'file' not in request.data:
        return Response({'detail': 'No file provided.'}, status=400)
    
    file_obj = request.data['file']
    
    recognized_text = "MOCK OCR TEXT"
    if HAS_OCR:
        try:
            image = Image.open(file_obj)
            # pytesseract.pytesseract.tesseract_cmd = r'C:\\Program Files\\Tesseract-OCR\\tesseract.exe'
            recognized_text = pytesseract.image_to_string(image, lang='fra')
        except Exception as e:
            recognized_text = f"OCR Error: {e}"

    # In a fully trained ML setup, we parse checkboxes and positional text.
    # We return a dummy payload mapped perfectly to the API structure.
    
    dummy_extracted_data = {
        "language_used": "FR",
        "section_a": {
            "gender": "M",
            "birth_month": 5,
            "birth_year": 2008,
            "academic_performance": "10_12",
            "parents_absence_reason": "none",
            "nights_out_30days": "2",
            "activities_frequency": {"sports": "daily"},
            "school_absences": {"sick": "none"},
            "household_members": ["mother", "father"],
            "family_relationship_satisfaction": {"mother": "very_satisfied"},
            "parents_absence_reason_other": ""
        },
        "section_b": {
            "father_education": "university",
            "mother_education": "secondary_bac",
            "father_job": "full_time",
            "mother_job": "full_time",
            "economic_status": "identical"
        },
        "section_c": {
            "access_difficulty": "easy",
            "family_smoke": "yes",
            "friends_smoke": "yes",
            "lifetime_freq": "3_5",
            "months_12_freq": "1_2",
            "days_30_freq": "1_5_day",
            "age_first_use": "14",
            "age_daily_use": "15"
        },
        "section_d": {
            "access_difficulty": "easy",
            "family_vape": "no",
            "friends_vape": "yes",
            "lifetime_freq": "6_9",
            "months_12_freq": "3_5",
            "days_30_freq": "ge1_week",
            "age_first_use": "14",
            "age_daily_use": "15"
        },
        "section_e": {
            "access_difficulty": "easy",
            "family_hookah": "no",
            "friends_hookah": "yes",
            "lifetime_freq": "never",
            "months_12_freq": "never",
            "days_30_freq": "never",
            "age_first_use": "never",
            "age_daily_use": "never"
        },
        "section_g": {"access_difficulty": {}, "family_use": "no", "friends_use": "no", "lifetime_freq": "never", "months_12_freq": "never", "days_30_freq": "never", "days_30_by_type": {}, "binge_drinking_30days": "0", "intoxication_lifetime": "never", "intoxication_12months": "never", "intoxication_30days": "never", "age_first_drink": "never", "age_first_intoxication": "never"},
        "section_h": {"access_difficulty": "", "family_use": "no", "friends_use": "no", "lifetime_freq": "never", "months_12_freq": "never", "days_30_freq": "never", "age_first_use": "never"},
        "section_i": {"access_difficulty": "", "family_use": "no", "friends_use": "no", "lifetime_freq": "never", "months_12_freq": "never", "days_30_freq": "never", "age_first_use": "never", "cannabis_types_12months": {}, "cannabis_problems_12months": {}},
        "section_j": {"access_difficulty": "", "family_use": "no", "friends_use": "no", "lifetime_freq": "never", "months_12_freq": "never", "days_30_freq": "never", "age_first_use": "never"},
        "section_k": {"access_difficulty": "", "family_use": "no", "friends_use": "no", "lifetime_freq": "never", "months_12_freq": "never", "days_30_freq": "never", "age_first_use": "never"},
        "section_l": {"access_difficulty": "", "family_use": "no", "friends_use": "no", "lifetime_freq": "never", "months_12_freq": "never", "days_30_freq": "never", "age_first_use": "never"},
        "section_m": {"access_difficulty": "", "family_use": "no", "friends_use": "no", "lifetime_freq": "never", "months_12_freq": "never", "days_30_freq": "never", "age_first_use": "never"},
        "section_n": {"lifetime_freq": "never", "months_12_freq": "never", "days_30_freq": "never", "age_first_use": "never", "forms": {}, "synthetic_cannabinoids": "no", "synthetic_cathinones": "no"},
        "section_p": {"lifetime_freq": "never", "months_12_freq": "never", "days_30_freq": "never", "age_first_use": "never", "substances": {}},
        "section_q": {"risk_perceptions": {}, "help_sources": {}, "friend_use_risk": "probably_no"},
        "section_r": {"hours_per_day": "none", "agreement": {}},
        "section_s": {"hours_per_day": "none", "days_per_week": "0", "agreement": {}},
        "section_t": {"months_12_freq": "never", "offline_games": {}, "online_games": {}, "felt_need_increase": "no", "lied_about_it": "no", "gambling_problems": {}},
        "section_u": {"fights_12months": "0", "fight_circumstances": "", "fight_location": "", "staff_intervention": "no", "fight_consequences": [], "bullied": "no", "theft_victim": "no", "serious_injury_12months": "none"},
        "section_v": {"control": "never", "confidence": "never", "success": "never", "difficulties": "never"},
        "section_z": {"honesty_level": "completely", "honesty_cannabis": "definitely_no"}
    }
    
    return Response({
        'status': 'success',
        'raw_text_extracted': recognized_text[:200], # Preview of raw OCR
        'extracted_data': dummy_extracted_data
    })
