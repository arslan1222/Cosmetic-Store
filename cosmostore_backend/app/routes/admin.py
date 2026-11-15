from datetime import datetime, timedelta

from flask import Blueprint, request
from flask_login import login_required, current_user
from sqlalchemy import func

from app.extensions import db, mail
from app.models import (
    User, Product, Order, OrderItem, Store, FraudCheck, Category,
    RoleEnum, OrderStatusEnum, StoreStatusEnum, Notification,
)
from app.ml.fraud_predictor import get_metrics
from app.utils import api_response, role_required
from flask_mail import Message

admin_bp = Blueprint("admin", __name__, url_prefix="/api/admin")


# --------------------------------------------------------------------- Users
@admin_bp.route("/users", methods=["GET"])
@login_required
@role_required(RoleEnum.ADMIN)
def list_users():
    role = request.args.get("role")
    query = User.query
    if role:
        query = query.filter_by(role=role)
    users = query.order_by(User.created_at.desc()).all()
    return api_response(True, data=[u.to_dict(include_sensitive=True) for u in users])


@admin_bp.route("/users/<int:user_id>/toggle-active", methods=["PUT"])
@login_required
@role_required(RoleEnum.ADMIN)
def toggle_user_active(user_id):
    user = User.query.get_or_404(user_id)
    user.is_active_account = not user.is_active_account
    db.session.commit()
    status = "activated" if user.is_active_account else "deactivated"
    return api_response(True, f"User {status}.", data=user.to_dict())


# ------------------------------------------------------------------ Vendors
@admin_bp.route("/stores", methods=["GET"])
@login_required
@role_required(RoleEnum.ADMIN)
def list_all_stores():
    stores = Store.query.order_by(Store.created_at.desc()).all()
    return api_response(True, data=[s.to_dict() for s in stores])


@admin_bp.route("/stores/<int:store_id>/status", methods=["PUT"])
@login_required
@role_required(RoleEnum.ADMIN)
def set_store_status(store_id):
    store = Store.query.get_or_404(store_id)
    data = request.get_json(force=True, silent=True) or {}
    new_status = data.get("status")
    if new_status not in [s.value for s in StoreStatusEnum]:
        return api_response(False, "Invalid status.", status=400)
    store.status = StoreStatusEnum(new_status)
    db.session.commit()

    db.session.add(Notification(
        user_id=store.owner_id,
        title="Store status updated",
        message=f"Your store '{store.store_name}' is now '{new_status}'.",
    ))
    db.session.commit()
    return api_response(True, "Store status updated.", data=store.to_dict())


# ----------------------------------------------------------------- Products
@admin_bp.route("/products", methods=["GET"])
@login_required
@role_required(RoleEnum.ADMIN)
def admin_list_products():
    products = Product.query.order_by(Product.created_at.desc()).all()
    return api_response(True, data=[p.to_dict() for p in products])


# ------------------------------------------------------------------- Orders
@admin_bp.route("/orders", methods=["GET"])
@login_required
@role_required(RoleEnum.ADMIN)
def admin_list_orders():
    status = request.args.get("status")
    query = Order.query
    if status:
        query = query.filter_by(status=status)
    orders = query.order_by(Order.created_at.desc()).all()
    return api_response(True, data=[o.to_dict() for o in orders])


@admin_bp.route("/orders/<int:order_id>/status", methods=["PUT"])
@login_required
@role_required(RoleEnum.ADMIN)
def update_order_status(order_id):
    order = Order.query.get_or_404(order_id)
    data = request.get_json(force=True, silent=True) or {}
    new_status = data.get("status")
    if new_status not in [s.value for s in OrderStatusEnum]:
        return api_response(False, "Invalid status.", status=400)
    order.status = OrderStatusEnum(new_status)
    db.session.commit()

    db.session.add(Notification(
        user_id=order.customer_id,
        title="Order status update",
        message=f"Your order {order.order_number} is now '{new_status}'.",
    ))
    db.session.commit()
    return api_response(True, "Order status updated.", data=order.to_dict())


# ------------------------------------------------------- Fraud review center
@admin_bp.route("/fraud/flagged-orders", methods=["GET"])
@login_required
@role_required(RoleEnum.ADMIN)
def flagged_orders():
    orders = (
        Order.query.filter_by(status=OrderStatusEnum.HELD_FOR_REVIEW)
        .order_by(Order.created_at.desc())
        .all()
    )
    return api_response(True, data=[o.to_dict() for o in orders])


@admin_bp.route("/fraud/orders/<int:order_id>/decision", methods=["PUT"])
@login_required
@role_required(RoleEnum.ADMIN)
def fraud_decision(order_id):
    order = Order.query.get_or_404(order_id)
    if not order.fraud_check:
        return api_response(False, "No fraud check found for this order.", status=404)

    data = request.get_json(force=True, silent=True) or {}
    decision = data.get("decision")  # 'approved' or 'rejected'
    if decision not in ("approved", "rejected"):
        return api_response(False, "decision must be 'approved' or 'rejected'.", status=400)

    order.fraud_check.admin_decision = decision
    order.fraud_check.reviewed_by = current_user.id
    order.fraud_check.reviewed_at = datetime.utcnow()

    if decision == "approved":
        order.status = OrderStatusEnum.CONFIRMED
        msg = f"Good news! Your order {order.order_number} passed review and is now confirmed."
    else:
        order.status = OrderStatusEnum.REJECTED
        # restock items
        for item in order.items:
            if item.product:
                item.product.stock_quantity += item.quantity
        msg = f"Your order {order.order_number} could not be verified and has been rejected. Contact support."

    db.session.add(Notification(user_id=order.customer_id, title="Fraud review decision", message=msg))
    db.session.commit()

    return api_response(True, f"Order {decision}.", data=order.to_dict())


@admin_bp.route("/fraud/model-metrics", methods=["GET"])
@login_required
@role_required(RoleEnum.ADMIN)
def fraud_model_metrics():
    metrics = get_metrics()
    if not metrics:
        return api_response(False, "Fraud model has not been trained yet.", status=404)
    return api_response(True, data=metrics)


@admin_bp.route("/fraud/checks", methods=["GET"])
@login_required
@role_required(RoleEnum.ADMIN)
def all_fraud_checks():
    checks = FraudCheck.query.order_by(FraudCheck.created_at.desc()).limit(200).all()
    return api_response(True, data=[c.to_dict() for c in checks])


# ---------------------------------------------------------------- Analytics
@admin_bp.route("/analytics/summary", methods=["GET"])
@login_required
@role_required(RoleEnum.ADMIN)
def analytics_summary():
    total_users = User.query.filter_by(role=RoleEnum.CUSTOMER).count()
    total_vendors = User.query.filter_by(role=RoleEnum.VENDOR).count()
    total_products = Product.query.count()
    total_orders = Order.query.count()

    total_sales = db.session.query(func.coalesce(func.sum(Order.grand_total), 0)).filter(
        Order.status.in_([OrderStatusEnum.CONFIRMED, OrderStatusEnum.SHIPPED, OrderStatusEnum.DELIVERED])
    ).scalar()

    flagged_count = Order.query.filter_by(status=OrderStatusEnum.HELD_FOR_REVIEW).count()
    rejected_count = Order.query.filter_by(status=OrderStatusEnum.REJECTED).count()
    total_fraud_checks = FraudCheck.query.count()

    last_30_days = datetime.utcnow() - timedelta(days=30)
    daily_sales = (
        db.session.query(
            func.date(Order.created_at).label("day"),
            func.sum(Order.grand_total).label("total"),
        )
        .filter(Order.created_at >= last_30_days)
        .group_by(func.date(Order.created_at))
        .order_by(func.date(Order.created_at))
        .all()
    )

    orders_by_status = (
        db.session.query(Order.status, func.count(Order.id)).group_by(Order.status).all()
    )

    return api_response(True, data={
        "total_customers": total_users,
        "total_vendors": total_vendors,
        "total_products": total_products,
        "total_orders": total_orders,
        "total_sales": float(total_sales or 0),
        "flagged_orders": flagged_count,
        "rejected_orders": rejected_count,
        "total_fraud_checks": total_fraud_checks,
        "fraud_rate_percent": round((flagged_count / total_orders * 100), 2) if total_orders else 0,
        "daily_sales_last_30_days": [{"day": str(d), "total": float(t or 0)} for d, t in daily_sales],
        "orders_by_status": {s.value: c for s, c in orders_by_status},
    })


@admin_bp.route("/categories/<int:category_id>", methods=["PUT"])
@login_required
@role_required(RoleEnum.ADMIN)
def admin_update_category(category_id):
    category = Category.query.get_or_404(category_id)
    data = request.get_json(force=True, silent=True) or {}
    for field in ("name", "description"):
        if field in data:
            setattr(category, field, data[field])
    db.session.commit()
    return api_response(True, "Category updated.", data=category.to_dict())
