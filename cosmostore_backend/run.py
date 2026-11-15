from app import create_app
from app.extensions import db
from flask_cors import CORS

app = create_app()

CORS(
    app,
    resources={r"/api/*": {
        "origins": [
            "http://localhost:5173",
            "https://smart-cosmetic-e-commerce-system.onrender.com"
        ]
    }},
    supports_credentials=True
)

# ✅ Runs on import — so Gunicorn triggers it too
with app.app_context():
    db.create_all()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
