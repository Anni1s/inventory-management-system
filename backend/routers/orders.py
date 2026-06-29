from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas, database

router = APIRouter(
    prefix="/orders",
    tags=["Orders"]
)

@router.post("/", response_model=schemas.OrderResponse, status_code=201)
def create_order(order: schemas.OrderCreate, db: Session = Depends(database.get_db)):
    # 1. Verify customer
    customer = db.query(models.Customer).filter(models.Customer.id == order.customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    # 2. Check stock and calculate total
    total_amount = 0.0
    order_items_to_create = []

    for item in order.items:
        product = db.query(models.Product).filter(models.Product.id == item.product_id).first()
        if not product:
            raise HTTPException(status_code=404, detail=f"Product with ID {item.product_id} not found")
        
        if product.quantity < item.quantity:
            raise HTTPException(
                status_code=400, 
                detail=f"Insufficient stock for product '{product.name}'. Available: {product.quantity}, Requested: {item.quantity}"
            )
        
        # Calculate subtotal and deduct stock
        subtotal = product.price * item.quantity
        total_amount += subtotal
        
        # Deduct stock temporarily in this session
        product.quantity -= item.quantity
        
        # Prepare order item
        order_items_to_create.append(
            models.OrderItem(
                product_id=product.id,
                quantity=item.quantity,
                price_at_purchase=product.price
            )
        )

    # 3. Create order
    db_order = models.Order(
        customer_id=order.customer_id,
        total_amount=total_amount
    )
    
    db.add(db_order)
    db.flush() # Get order ID without committing yet

    # 4. Attach items
    for oi in order_items_to_create:
        oi.order_id = db_order.id
        db.add(oi)

    # 5. Commit all changes
    try:
        db.commit()
        db.refresh(db_order)
        return db_order
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="An error occurred while placing the order")

@router.get("/", response_model=List[schemas.OrderResponse])
def get_orders(skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db)):
    orders = db.query(models.Order).offset(skip).limit(limit).all()
    return orders

@router.get("/{order_id}", response_model=schemas.OrderResponse)
def get_order(order_id: int, db: Session = Depends(database.get_db)):
    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order

@router.delete("/{order_id}", status_code=204)
def delete_order(order_id: int, db: Session = Depends(database.get_db)):
    # Note: Depending on business rules, you might want to return the stock back to the products.
    # We will simply delete the order here and cascade delete order items. 
    # Let's restore the stock!
    db_order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not db_order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    for item in db_order.items:
        product = db.query(models.Product).filter(models.Product.id == item.product_id).first()
        if product:
            product.quantity += item.quantity
            
    db.delete(db_order)
    db.commit()
    return None
