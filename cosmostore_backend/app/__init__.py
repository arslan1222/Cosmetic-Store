import os

from flask import Flask
from dotenv import load_dotenv

from app.config import config_map
from app.extensions import (
    db,
    login_manager,
    bcrypt,
    mail,
    cors,
)


# ==================================================
# LOAD ENVIRONMENT VARIABLES
# ==================================================

load_dotenv()


def create_app(config_name=None):

    app = Flask(__name__)

    # ==================================================
    # CONFIGURATION
    # ==================================================

    config_name = config_name or os.environ.get(
        "FLASK_ENV",
        "development"
    )

    app.config.from_object(
        config_map.get(
            config_name,
            config_map["default"]
        )
    )

    # ==================================================
    # SESSION CONFIGURATION
    # ==================================================

    # Allow Flask-Login session cookie to be used
    # by the React frontend.
    app.config["SESSION_COOKIE_HTTPONLY"] = True

    # localhost:5173 -> localhost:5000
    app.config["SESSION_COOKIE_SAMESITE"] = "Lax"

    # Development is running on HTTP
    app.config["SESSION_COOKIE_SECURE"] = False

    # Remember-me cookie
    app.config["REMEMBER_COOKIE_HTTPONLY"] = True
    app.config["REMEMBER_COOKIE_SAMESITE"] = "Lax"
    app.config["REMEMBER_COOKIE_SECURE"] = False

    # ==================================================
    # DIRECTORIES
    # ==================================================

    os.makedirs(
        app.config["UPLOAD_FOLDER"],
        exist_ok=True
    )

    os.makedirs(
        app.config["ML_MODEL_DIR"],
        exist_ok=True
    )

    # ==================================================
    # EXTENSIONS
    # ==================================================

    db.init_app(app)

    login_manager.init_app(app)

    bcrypt.init_app(app)

    mail.init_app(app)

    # ==================================================
    # CORS
    # ==================================================

    cors_origins = app.config.get(
        "CORS_ORIGINS",
        [
            "https://smart-cosmetic-e-commerce-system.onrender.com",
            "http://localhost:5173",
            "http://localhost:3000",
        ]
    )

    # If CORS_ORIGINS comes from .env as a string,
    # convert it to a list.
    if isinstance(cors_origins, str):
        cors_origins = [
            origin.strip()
            for origin in cors_origins.split(",")
            if origin.strip()
        ]

    cors.init_app(
        app,
        resources={
            r"/api/*": {
                "origins": cors_origins,
                "supports_credentials": True,
            }
        }
    )

    # ==================================================
    # FLASK-LOGIN
    # ==================================================

    # Never redirect API requests to /login.
    # Return JSON 401 instead.
    @login_manager.unauthorized_handler
    def unauthorized():

        return {
            "success": False,
            "message": "Authentication required."
        }, 401

    # ==================================================
    # USER LOADER
    # ==================================================

    from app.models import User

    @login_manager.user_loader
    def load_user(user_id):

        try:
            return db.session.get(
                User,
                int(user_id)
            )
        except (TypeError, ValueError):
            return None

    # ==================================================
    # BLUEPRINTS
    # ==================================================

    from app.routes.auth import auth_bp
    from app.routes.products import products_bp
    from app.routes.cart import cart_bp
    from app.routes.orders import orders_bp
    from app.routes.admin import admin_bp
    from app.routes.payments import payments_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(products_bp)
    app.register_blueprint(cart_bp)
    app.register_blueprint(orders_bp)
    app.register_blueprint(admin_bp)
    app.register_blueprint(payments_bp)

    # ==================================================
    # HEALTH
    # ==================================================

    @app.route("/api/health", methods=["GET"])
    def health():

        from app.ml.fraud_predictor import is_model_trained

        return {
            "success": True,
            "status": "ok",
            "service": "CosmoStore API",
            "fraud_model_trained": is_model_trained(),
        }

    # ==================================================
    # 404 ERROR
    # ==================================================

    @app.errorhandler(404)
    def not_found(e):

        return {
            "success": False,
            "message": "Resource not found."
        }, 404

    # ==================================================
    # 500 ERROR
    # ==================================================

    @app.errorhandler(500)
    def server_error(e):

        app.logger.exception(
            "Internal server error"
        )

        return {
            "success": False,
            "message": "Internal server error."
        }, 500

    return app
