import os
from datetime import timedelta
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

BASE_DIR = os.path.abspath(os.path.dirname(__file__))


def get_database_uri():
    raw_url = os.getenv('DATABASE_URL')

    instance_dir = os.path.join(os.path.dirname(BASE_DIR), 'instance')
    os.makedirs(instance_dir, exist_ok=True)
    sqlite_db_path = os.path.join(instance_dir, 'venue_booking.db').replace('\\', '/')
    sqlite_uri = f"sqlite:///{sqlite_db_path}"

    if not raw_url:
        return sqlite_uri

    raw_url = raw_url.strip()

    if raw_url.startswith('mysql://'):
        raw_url = raw_url.replace('mysql://', 'mysql+pymysql://', 1)
    elif raw_url.startswith('postgres://'):
        return raw_url.replace('postgres://', 'postgresql://', 1)
    elif raw_url.startswith('sqlite:'):
        return raw_url

    if raw_url.startswith('mysql+pymysql://'):
        # Use the complete host, username, password, and port from DATABASE_URL.
        # Do not test localhost or silently switch to SQLite in production.
        if os.getenv('FLASK_ENV', 'development').lower() == 'production':
            return raw_url

        try:
            from sqlalchemy.engine import make_url
            import pymysql

            parsed = make_url(raw_url)
            pymysql.connect(
                host=parsed.host,
                port=parsed.port or 3306,
                user=parsed.username,
                password=parsed.password,
                database=parsed.database,
                connect_timeout=5,
                ssl={'ssl_verify_cert': True, 'ssl_verify_identity': True}
            ).close()
            return raw_url
        except Exception:
            return sqlite_uri

    return raw_url



class Config:
    """Base configuration with sensible defaults."""
    SECRET_KEY = os.getenv('SECRET_KEY', 'default-venue-secret-key-123')
    
    SQLALCHEMY_DATABASE_URI = get_database_uri()
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # Engine options configured based on database type
    if SQLALCHEMY_DATABASE_URI.startswith('sqlite'):
        SQLALCHEMY_ENGINE_OPTIONS = {}
    else:
        SQLALCHEMY_ENGINE_OPTIONS = {
            'pool_recycle': int(os.getenv('DB_POOL_RECYCLE', '280')),
            'pool_pre_ping': True,
            'pool_size': int(os.getenv('DB_POOL_SIZE', '10')),
            'max_overflow': int(os.getenv('DB_MAX_OVERFLOW', '20'))
        }
    
    # JWT Authentication configuration
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'jwt-venue-booking-key')
    JWT_EXPIRATION_HOURS = int(os.getenv('JWT_EXPIRATION_HOURS', '24'))
    
    # College domain validation
    ALLOWED_EMAIL_DOMAIN = os.getenv('ALLOWED_EMAIL_DOMAIN', '@coeptech.ac.in')
    
    # Mail configuration
    MAIL_SERVER = os.getenv('MAIL_SERVER', 'smtp.gmail.com')
    MAIL_PORT = int(os.getenv('MAIL_PORT', '587'))
    MAIL_USE_TLS = os.getenv('MAIL_USE_TLS', 'True').lower() in ('true', '1', 't')
    MAIL_USERNAME = os.getenv('MAIL_USERNAME', '')
    MAIL_PASSWORD = os.getenv('MAIL_PASSWORD', '')
    MAIL_DEFAULT_SENDER = os.getenv('MAIL_DEFAULT_SENDER', 'noreply@coeptech.ac.in')
    MAIL_SUPPRESS_SEND = os.getenv('MAIL_SUPPRESS_SEND', 'True').lower() in ('true', '1', 't')

    # Super-Admin Approvers for new Admin profile registration
    ADMIN_REGISTRATION_APPROVERS = [
        'vinaynm25.aiml@coeptech.ac.in',
        'vazeba25.comp@coeptech.ac.in',
        'vhankalasph25.comp@coeptech.ac.in'
    ]


class DevelopmentConfig(Config):
    """Development environment specific settings."""
    DEBUG = True


class TestingConfig(Config):
    """Testing environment: uses in-memory SQLite and mock mail for fast, serverless unit testing."""
    TESTING = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'
    SQLALCHEMY_ENGINE_OPTIONS = {}
    MAIL_SUPPRESS_SEND = True
    WTF_CSRF_ENABLED = False


class ProductionConfig(Config):
    """Production environment configuration."""
    DEBUG = False
    TESTING = False
    MAIL_SUPPRESS_SEND = False


# Map configuration names
config_by_name = {
    'development': DevelopmentConfig,
    'testing': TestingConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig
}
