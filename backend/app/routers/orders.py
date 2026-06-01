from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app import models, schemas

router = APIRouter()


@router.post("", response_model=schemas.OrderResponse, status_code=status.HTTP_201_CREATED)
def create_order(order: schemas.OrderCreate, db: Session = Depends(get_db)):
    customer = db.query(models.Customer).filter(models.Customer.id == order.customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    if not order.items:
        raise HTTPException(status_code=400, detail="Order must contain at least one item")

    resolved = []
    for item in order.items:
        product = db.query(models.Product).filter(models.Product.id == item.product_id).first()
        if not product:
            raise HTTPException(status_code=404, detail=f"Product {item.product_id} not found")
        if product.quantity < item.quantity:
            raise HTTPException(
                status_code=400,
                detail=f"Insufficient stock for '{product.name}' — available: {product.quantity}",
            )
        resolved.append((product, item.quantity))

    total_amount = sum(product.price * qty for product, qty in resolved)

    db_order = models.Order(customer_id=order.customer_id, total_amount=total_amount)
    db.add(db_order)
    db.flush()

    for product, qty in resolved:
        db.add(
            models.OrderItem(
                order_id=db_order.id,
                product_id=product.id,
                quantity=qty,
                unit_price=product.price,
            )
        )
        product.quantity -= qty

    db.commit()
    db.refresh(db_order)
    return db_order


@router.get("", response_model=List[schemas.OrderResponse])
def get_orders(db: Session = Depends(get_db)):
    return db.query(models.Order).order_by(models.Order.created_at.desc()).all()


@router.get("/{order_id}", response_model=schemas.OrderResponse)
def get_order(order_id: int, db: Session = Depends(get_db)):
    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order


@router.delete("/{order_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_order(order_id: int, db: Session = Depends(get_db)):
    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    for item in order.items:
        item.product.quantity += item.quantity

    db.delete(order)
    db.commit()
