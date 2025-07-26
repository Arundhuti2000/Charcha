from .database import Base
from sqlalchemy import Column, Integer, String, Boolean, TIMESTAMP, ForeignKey
class Post(Base):
    __tablename__ = 'posts'

    id=Column(Integer, primary_key=True, nullable=False)
    title=Column(String(100), nullable=False)
    content= Column(String(1000),nullable=False)
    published=Column(Boolean, server_default='True',nullable=True) #it wont add default in db, if the table already exists, sqlalchemy it doesn't change anything or modify in an already present table.
    rating= Column(Integer,nullable=False)
    created_at=Column(TIMESTAMP(timezone=True), server_default='now()',nullable=False)
    category=Column(String(50), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable= False)

class User(Base):
    __tablename__ = 'users'

    id=Column(Integer, primary_key=True, nullable=False)
    email=Column(String(100), nullable=False, unique=True)
    password=Column(String(100),nullable=False)
    created_at=Column(TIMESTAMP(timezone=True), server_default='now()',nullable=False)
    phone_number=Column(String(15), nullable=True)