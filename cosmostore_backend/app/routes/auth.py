from datetime import datetime

from flask import Blueprint, request
from flask_login import (
    login_user,
    logout_user,
    login_required,
    current_user,
)

from app.extensions import db
from app.models import User, RoleEnum, Notification
from app.utils import api_response, is_valid_email


auth_bp = Blueprint(
    "auth",
    __name__,
    url_prefix="/api/auth"
)


# =====================================================
# REGISTER
# =====================================================

@auth_bp.route("/register", methods=["POST"])
def register():

    data = request.get_json(
        force=True,
        silent=True
    ) or {}

    full_name = (data.get("full_name") or "").strip()
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""
    phone = data.get("phone")

    role = data.get(
        "role",
        RoleEnum.CUSTOMER.value
    )

    # -------------------------------------------------
    # Validation
    # -------------------------------------------------

    if not full_name or not email or not password:
        return api_response(
            False,
            "full_name, email and password are required.",
            status=400
        )

    if not is_valid_email(email):
        return api_response(
            False,
            "Please provide a valid email address.",
            status=400
        )

    if len(password) < 6:
        return api_response(
            False,
            "Password must be at least 6 characters.",
            status=400
        )

    if role not in (
        RoleEnum.CUSTOMER.value,
        RoleEnum.VENDOR.value
    ):
        return api_response(
            False,
            "role must be 'customer' or 'vendor'.",
            status=400
        )

    # -------------------------------------------------
    # Check existing user
    # -------------------------------------------------

    if User.query.filter_by(email=email).first():
        return api_response(
            False,
            "An account with this email already exists.",
            status=409
        )

    # -------------------------------------------------
    # Create user
    # -------------------------------------------------

    user = User(
        full_name=full_name,
        email=email,
        phone=phone,
        role=RoleEnum(role),
        account_age_days=0,
    )

    user.set_password(password)

    db.session.add(user)
    db.session.commit()

    # -------------------------------------------------
    # Welcome notification
    # -------------------------------------------------

    welcome = Notification(
        user_id=user.id,
        title="Welcome to CosmoStore!",
        message="Your account has been created successfully.",
    )

    db.session.add(welcome)
    db.session.commit()

    return api_response(
        True,
        "Registration successful. You can now log in.",
        data=user.to_dict(),
        status=201
    )


# =====================================================
# LOGIN
# =====================================================

@auth_bp.route("/login", methods=["POST"])
def login():

    data = request.get_json(
        force=True,
        silent=True
    ) or {}

    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    remember = bool(
        data.get("remember", False)
    )

    # -------------------------------------------------
    # Find user
    # -------------------------------------------------

    user = User.query.filter_by(
        email=email
    ).first()

    # -------------------------------------------------
    # Check credentials
    # -------------------------------------------------

    if not user or not user.check_password(password):

        if user:
            user.failed_login_attempts = (
                user.failed_login_attempts or 0
            ) + 1

            db.session.commit()

        return api_response(
            False,
            "Invalid email or password.",
            status=401
        )

    # -------------------------------------------------
    # Check account status
    # -------------------------------------------------

    if not user.is_active_account:
        return api_response(
            False,
            "This account has been deactivated. Contact support.",
            status=403
        )

    # -------------------------------------------------
    # Reset failed attempts
    # -------------------------------------------------

    user.failed_login_attempts = 0
    db.session.commit()

    # -------------------------------------------------
    # Create Flask-Login session
    # -------------------------------------------------

    login_user(
        user,
        remember=remember,
        fresh=True
    )

    return api_response(
        True,
        "Login successful.",
        data=user.to_dict()
    )


# =====================================================
# LOGOUT
# =====================================================

@auth_bp.route("/logout", methods=["POST"])
@login_required
def logout():

    logout_user()

    return api_response(
        True,
        "Logged out successfully."
    )


# =====================================================
# CURRENT USER
# =====================================================

@auth_bp.route("/me", methods=["GET"])
@login_required
def me():

    return api_response(
        True,
        data=current_user.to_dict(
            include_sensitive=True
        )
    )


# =====================================================
# UPDATE PROFILE
# =====================================================

@auth_bp.route("/profile", methods=["PUT"])
@login_required
def update_profile():

    data = request.get_json(
        force=True,
        silent=True
    ) or {}

    for field in (
        "full_name",
        "phone",
        "address",
        "city"
    ):
        if field in data:
            setattr(
                current_user,
                field,
                data[field]
            )

    current_user.updated_at = datetime.utcnow()

    db.session.commit()

    return api_response(
        True,
        "Profile updated.",
        data=current_user.to_dict()
    )


# =====================================================
# CHANGE PASSWORD
# =====================================================

@auth_bp.route("/change-password", methods=["PUT"])
@login_required
def change_password():

    data = request.get_json(
        force=True,
        silent=True
    ) or {}

    old_password = data.get(
        "old_password",
        ""
    )

    new_password = data.get(
        "new_password",
        ""
    )

    if not current_user.check_password(old_password):
        return api_response(
            False,
            "Current password is incorrect.",
            status=400
        )

    if len(new_password) < 6:
        return api_response(
            False,
            "New password must be at least 6 characters.",
            status=400
        )

    current_user.set_password(new_password)

    db.session.commit()

    return api_response(
        True,
        "Password updated successfully."
    )


# =====================================================
# NOTIFICATIONS
# =====================================================

@auth_bp.route("/notifications", methods=["GET"])
@login_required
def list_notifications():

    notes = (
        current_user.notifications
        .order_by(
            Notification.created_at.desc()
        )
        .limit(50)
        .all()
    )

    return api_response(
        True,
        data=[
            notification.to_dict()
            for notification in notes
        ]
    )


# =====================================================
# MARK NOTIFICATION AS READ
# =====================================================

@auth_bp.route(
    "/notifications/<int:note_id>/read",
    methods=["PUT"]
)
@login_required
def mark_notification_read(note_id):

    note = Notification.query.filter_by(
        id=note_id,
        user_id=current_user.id
    ).first()

    if not note:
        return api_response(
            False,
            "Notification not found.",
            status=404
        )

    note.is_read = True

    db.session.commit()

    return api_response(
        True,
        "Marked as read."
    )