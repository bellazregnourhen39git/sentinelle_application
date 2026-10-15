import os
import traceback
os.environ.setdefault('DJANGO_SETTINGS_MODULE','Sentinelle.settings')
import django
django.setup()
from django.conf import settings
from django.core.mail import send_mail

print('EMAIL_BACKEND=', settings.EMAIL_BACKEND)
print('EMAIL_HOST=', settings.EMAIL_HOST)
print('EMAIL_PORT=', settings.EMAIL_PORT)
print('EMAIL_HOST_USER=', settings.EMAIL_HOST_USER)
print('DEFAULT_FROM_EMAIL=', settings.DEFAULT_FROM_EMAIL)

try:
    res = send_mail('Sentinelle test','If you see this, SMTP works', settings.DEFAULT_FROM_EMAIL, [settings.EMAIL_HOST_USER], fail_silently=False)
    print('send_mail returned:', res)
except Exception as e:
    traceback.print_exc()
    print('EXCEPTION_STR:', str(e))
