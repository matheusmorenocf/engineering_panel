import os
import pickle
import threading
import base64
from email.mime.text import MIMEText
from googleapiclient.discovery import build
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from django.conf import settings
from django.template.loader import render_to_string

class EmailService:
    SCOPES = [
        'https://www.googleapis.com/auth/gmail.send',
        'https://www.googleapis.com/auth/gmail.readonly',
        'https://www.googleapis.com/auth/gmail.modify'
    ]

    def __init__(self):
        self.creds = None
        self.service = None
        self._authenticate()

    def _authenticate(self):
        """Gerencia o token de acesso para a API"""
        token_path = getattr(settings, 'GOOGLE_TOKEN_FILE', 'token.pickle')
        creds_path = getattr(settings, 'GOOGLE_CREDENTIALS_FILE', 'credentials.json')

        if os.path.exists(token_path):
            with open(token_path, 'rb') as token:
                self.creds = pickle.load(token)

        # Se não houver credenciais válidas, pede login
        if not self.creds or not self.creds.valid:
            if self.creds and self.creds.expired and self.creds.refresh_token:
                self.creds.refresh(Request())
            else:
                flow = InstalledAppFlow.from_client_secrets_file(creds_path, self.SCOPES)
                # Se estiver em servidor remoto, use run_console() ou configure o redirecionamento
                self.creds = flow.run_local_server(port=8080)
            
            # Salva as credenciais para a próxima vez
            with open(token_path, 'wb') as token:
                pickle.dump(self.creds, token)

        self.service = build('gmail', 'v1', credentials=self.creds)

    def _send_raw_email(self, to, subject, html_body):
        """Método privado para envio"""
        if not self.service: return
        
        message = MIMEText(html_body, 'html')
        message['to'] = to
        message['subject'] = subject
        
        raw = base64.urlsafe_b64encode(message.as_bytes()).decode()
        try:
            self.service.users().messages().send(userId='me', body={'raw': raw}).execute()
        except Exception as e:
            print(f"Erro ao enviar e-mail: {e}")

    def list_unread_emails(self, max_results=10):
        """Exemplo de como RECEBER/Ler e-mails não lidos"""
        if not self.service: return []
        
        try:
            results = self.service.users().messages().list(
                userId='me', q='is:unread', maxResults=max_results
            ).execute()
            messages = results.get('messages', [])
            
            emails_data = []
            for msg in messages:
                txt = self.service.users().messages().get(userId='me', id=msg['id']).execute()
                # Aqui você extrairia o snippet ou o body
                emails_data.append(txt['snippet'])
            return emails_data
        except Exception as e:
            print(f"Erro ao ler e-mails: {e}")
            return []

    @classmethod
    def send_async_notification(cls, subject, to_emails, template_name, context):
        """Dispara e-mail em background usando templates HTML"""
        try:
            template_path = f'emails/{template_name}.html'
            html_content = render_to_string(template_path, context)
            
            def task():
                # Instancia o serviço dentro da thread para evitar problemas de concorrência
                service_instance = cls()
                emails = to_emails if isinstance(to_emails, list) else [to_emails]
                for email in emails:
                    service_instance._send_raw_email(email, subject, html_content)
            
            threading.Thread(target=task, daemon=True).start()
        except Exception as e:
            print(f"Falha ao iniciar thread de e-mail: {e}")

    @classmethod
    def notify_new_item(cls, instance):
        """Alerta de novo registro no Controle Físico"""
        recipients = [u.email for u in instance.location.responsibles.all() if u.email]
        if not recipients: return

        context = {
            'id': instance.control_id,
            'product': instance.product,
            'loc': f"{instance.location.name} ({instance.physical_location or 'N/A'})",
            'user': instance.current_responsible.get_full_name() or instance.current_responsible.username,
            'customer': instance.customer or "Consumidor Final"
        }
        
        cls.send_async_notification(
            subject=f"📦 Novo Registro: {instance.control_id}",
            to_emails=recipients,
            template_name='new_item_alert',
            context=context
        )