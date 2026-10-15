import os
import sys
import secrets
from datetime import timedelta
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Sentinelle.settings')
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
import django
django.setup()
from django.utils import timezone
from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from django.contrib.auth import get_user_model
from api.models import AuditLog
import hashlib
import hmac

User = get_user_model()

def resend(email):
    user = User.objects.filter(email=email).first()
    if not user:
        # create a pending user if not exists
        user = User.objects.create_user(username=email.split('@')[0], email=email, password=None, role='PRACTITIONER', is_active=False, status='PENDING')
        print('Created placeholder user:', user.email)
    else:
        if user.is_active:
            print('User is already active — will still create a new invite token.')

    token = secrets.token_urlsafe(32)
    expiration = timezone.now() + timedelta(hours=24)
    hashed = hmac.new(settings.SECRET_KEY.encode(), token.encode(), hashlib.sha256).hexdigest()
    user.invite_token = hashed
    user.token_expiration = expiration
    user.status = 'PENDING'
    user.is_active = False
    user.save()

    frontend_url = os.environ.get('FRONTEND_URL', 'http://localhost:5173')
    invitation_link = f"{frontend_url}/set-password?token={token}"

    email_subject = "Invitation à rejoindre la plateforme MedSPAD Tunisie 2026"
    email_body = (
        f"Cher(e) {user.username},\n\n"
        "Vous avez été officiellement invité(e) à rejoindre la plateforme Sentinelle (MedSPAD Tunisie 2026).\n"
        "Ce portail sécurisé vous permet de contribuer à la veille sanitaire nationale.\n\n"
        f"Veuillez cliquer sur le lien suivant pour configurer votre mot de passe et activer votre compte :\n"
        f"{invitation_link}\n\n"
        "Ce lien est personnel et expirera dans 24 heures.\n\n"
        "Cordialement,\n"
        "L'équipe d'administration Sentinelle"
    )

    html_body = (
        f"<p>Cher(e) {user.username},</p>"
        "<p>Vous avez été officiellement invité(e) à rejoindre la plateforme Sentinelle (MedSPAD Tunisie 2026)."
        "Ce portail sécurisé vous permet de contribuer à la veille sanitaire nationale.</p>"
        f"<p>Veuillez cliquer sur le lien suivant pour configurer votre mot de passe et activer votre compte :</p>"
        f"<p><a href=\"{invitation_link}\">{invitation_link}</a></p>"
        "<p>Ce lien est personnel et expirera dans 24 heures.</p>"
        "<p>Cordialement,<br/>L'équipe d'administration Sentinelle</p>"
    )

    try:
        from_email = f"Sentinelle <{settings.DEFAULT_FROM_EMAIL}>"
        msg = EmailMultiAlternatives(
            subject=email_subject,
            body=email_body,
            from_email=from_email,
            to=[email],
            headers={'List-Unsubscribe': f"<mailto:{settings.DEFAULT_FROM_EMAIL}?subject=unsubscribe>"}
        )
        msg.attach_alternative(html_body, 'text/html')
        if getattr(settings, 'EMAIL_REPLY_TO', None):
            msg.extra_headers = msg.extra_headers or {}
            msg.extra_headers['Reply-To'] = settings.EMAIL_REPLY_TO
        sent = msg.send(fail_silently=False)
        print('send_mail returned:', sent)
        print('New token (plaintext):', token)
        # Log the resend in AuditLog
        try:
            AuditLog.objects.create(
                user=None,
                action=f"RESENT_INVITE: {email}",
                ip_address='127.0.0.1'
            )
        except Exception:
            # don't fail the script for logging errors
            pass
    except Exception as e:
        print('Error sending mail:', e)

if __name__ == '__main__':
    email = sys.argv[1] if len(sys.argv) > 1 else 'salma.mohamed.students@gmail.com'
    resend(email)
