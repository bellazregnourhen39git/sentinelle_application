FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends build-essential libpq-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt ./
RUN pip install --upgrade pip \
    && pip install -r requirements.txt gunicorn psycopg2-binary

COPY . ./

EXPOSE 8000

CMD ["sh", "-c", "python manage.py migrate && python manage.py collectstatic --noinput && python manage.py shell -c \"from api.models import User, Governorate, SchoolEstablishment; u,_=User.objects.get_or_create(email='msi@sentinelle.tn',defaults={'username':'msi','role':'SUPER_ADMIN','status':'ACTIVE','is_active':True}); u.set_password('msi'); u.save(); gov,_=Governorate.objects.get_or_create(name='Sfax'); sch,_=SchoolEstablishment.objects.get_or_create(name='Lycée Habib Thameur',governorate=gov); u2,_=User.objects.get_or_create(email='medbouzid1234567@gmail.com',defaults={'username':'medbouzid1234567','role':'PRACTITIONER','status':'ACTIVE','is_active':True}); u2.set_password('lolalola'); u2.governorate=gov; u2.establishment=sch; u2.save(); print('Seed done')\" && gunicorn --bind 0.0.0.0:8000 Sentinelle.wsgi:application"]
