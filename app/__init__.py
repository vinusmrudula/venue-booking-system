import os
from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS
from app.config import config_by_name
from app.models import db
from app.utils.email_service import mail
from app.routes import auth_bp, venues_bp, bookings_bp, admin_bp

def create_app(config_name=None):
    """
    Application Factory pattern:
    Creates and configures the Flask application instance.
    """
    if config_name is None:
        config_name = os.getenv('FLASK_ENV', 'development')

    # Serve frontend assets from the project root (index.html, js, css, assets)
    root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
    static_dir = root_dir

    app = Flask(__name__, static_folder=static_dir, static_url_path='')
    
    # Load configuration
    app.config.from_object(config_by_name.get(config_name, config_by_name['default']))

    # 1. Enable Cross-Origin Resource Sharing (CORS)
    # This ensures the frontend team using plain JavaScript fetch() won't get blocked by CORS!
    CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True)

    # 2. Initialize Extensions
    db.init_app(app)
    mail.init_app(app)

    # 3. Register Blueprints (Modular API routes)
    app.register_blueprint(auth_bp)
    app.register_blueprint(venues_bp)
    app.register_blueprint(bookings_bp)
    app.register_blueprint(admin_bp)

    # 4. Root & Static documentation route
    @app.route('/')
    def index():
        """Serve the frontend application."""
        return send_from_directory(app.static_folder, 'index.html')

    @app.route('/static/<path:filename>')
    @app.route('/Venue Booking/<path:filename>')
    def serve_nested_static(filename):
        """Serve static files requested with nested path prefixes."""
        return send_from_directory(app.static_folder, filename)

    # 5. Health Check endpoint
    @app.route('/api/health', methods=['GET'])
    def health_check():
        return jsonify({
            'success': True,
            'status': 'healthy',
            'service': 'Venue Booking System Backend',
            'version': '1.0.0'
        }), 200

    # 6. Global JSON Error Handlers (Ensures plain JS frontend always receives valid JSON)
    @app.errorhandler(400)
    def bad_request(error):
        return jsonify({
            'success': False,
            'error_code': 'BAD_REQUEST',
            'message': str(error.description if hasattr(error, 'description') else 'Bad request')
        }), 400

    @app.errorhandler(404)
    def not_found(error):
        return jsonify({
            'success': False,
            'error_code': 'NOT_FOUND',
            'message': 'Requested resource or API endpoint not found.'
        }), 404

    @app.errorhandler(405)
    def method_not_allowed(error):
        return jsonify({
            'success': False,
            'error_code': 'METHOD_NOT_ALLOWED',
            'message': 'HTTP method not allowed on this endpoint.'
        }), 405

    @app.errorhandler(500)
    def internal_error(error):
        return jsonify({
            'success': False,
            'error_code': 'SERVER_ERROR',
            'message': 'An internal server error occurred.'
        }), 500

    return app

