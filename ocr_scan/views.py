import os
import pytesseract
from PIL import Image
from rest_framework.decorators import api_view, parser_classes, permission_classes
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
import requests
import base64
from dotenv import load_dotenv
import json
from io import BytesIO
try:
    import fitz  # PyMuPDF
    HAS_PDF_SUPPORT = True
except ImportError:
    HAS_PDF_SUPPORT = False

load_dotenv()

# OpenRouter Configuration
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
HAS_AI = OPENROUTER_API_KEY and "sk-or" in OPENROUTER_API_KEY

@api_view(['POST'])
@parser_classes([MultiPartParser, FormParser])
@permission_classes([AllowAny])
def upload_scan(request):
    file_obj = request.data.get('file')
    if not file_obj:
        return Response({'error': 'No file uploaded'}, status=status.HTTP_400_BAD_REQUEST)

    # Initialize return variables
    extracted_data = {'language_used': 'fr', 'is_valid': True, 'section_a': {'gender': 'M', 'birth_year': 2011}}
    raw_text = ""
    engine_used = "OpenRouter AI (Multi-Page)"
    fallback_image = None

    try:
        pages_to_ai = []
        
        # 1. Process File (PDF or Image)
        if file_obj.name.lower().endswith('.pdf'):
            if not HAS_PDF_SUPPORT:
                return Response({'error': 'PDF support not ready.'}, status=400)
            
            pdf_data = file_obj.read()
            pdf_document = fitz.open(stream=pdf_data, filetype="pdf")
            num_pages = len(pdf_document)
            
            all_images = []
            for i in range(1, min(num_pages, 25)): # Skip cover (index 0)
                page = pdf_document.load_page(i)
                pix = page.get_pixmap(matrix=fitz.Matrix(1.3, 1.3))
                img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
                all_images.append(img)
                if i == 1: fallback_image = img
            
            # Stitch images in groups of 4 to stay under the 8-image limit
            chunk_size = 4
            for i in range(0, len(all_images), chunk_size):
                chunk = all_images[i:i + chunk_size]
                widths, heights = zip(*(img.size for img in chunk))
                combined = Image.new('RGB', (max(widths), sum(heights)))
                y_offset = 0
                for img in chunk:
                    combined.paste(img, (0, y_offset))
                    y_offset += img.size[1]
                
                buffered = BytesIO()
                combined.save(buffered, format="JPEG", quality=70)
                img_str = base64.b64encode(buffered.getvalue()).decode()
                pages_to_ai.append({
                    "type": "image_url",
                    "image_url": {"url": f"data:image/jpeg;base64,{img_str}"}
                })
        else:
            image = Image.open(file_obj)
            fallback_image = image
            buffered = BytesIO()
            image.save(buffered, format="JPEG", quality=75)
            img_str = base64.b64encode(buffered.getvalue()).decode()
            pages_to_ai.append({
                "type": "image_url",
                "image_url": {"url": f"data:image/jpeg;base64,{img_str}"}
            })

        # 2. Call AI
        if HAS_AI and pages_to_ai:
            try:
                prompt = """
                Tu es un expert MedSPAD. Analyse ces planches (4 pages chacune).
                Extrais TOUTES les sections de A à Z en JSON.
                
                JSON REQUIS :
                {
                    "section_a": { ... },
                    "section_b": { ... },
                    ...
                    "section_z": { ... }
                }
                Réponds UNIQUEMENT avec le JSON pur.
                """
                
                response = requests.post(
                    url="https://openrouter.ai/api/v1/chat/completions",
                    headers={"Authorization": f"Bearer {OPENROUTER_API_KEY}", "Content-Type": "application/json"},
                    data=json.dumps({
                        "model": "openrouter/free", # Automatically pick the best free model
                        "messages": [{"role": "user", "content": [{"type": "text", "text": prompt}] + pages_to_ai}]
                    }),
                    timeout=90
                )
                
                res_json = response.json()
                if 'choices' in res_json:
                    content = res_json['choices'][0]['message']['content']
                    raw_text = content
                    try:
                        start = content.find('{')
                        end = content.rfind('}')
                        ai_extracted = json.loads(content[start:end+1])
                        
                        # Merge into review structure
                        for k, v in ai_extracted.items():
                            if k.startswith('section_') and isinstance(v, dict):
                                extracted_data[k] = v
                    except:
                        pass
                else:
                    raw_text = f"AI Error: {res_json.get('error', {}).get('message', 'Unknown Error')}"
            except Exception as e:
                raw_text = f"AI Connection Failed: {str(e)}"

        if not raw_text and fallback_image:
            raw_text = pytesseract.image_to_string(fallback_image)

        return Response({
            'extracted_data': extracted_data,
            'raw_text_extracted': raw_text,
            'engine': engine_used
        })

    except Exception as e:
        return Response({'error': str(e)}, status=500)
