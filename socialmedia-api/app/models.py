from .database import Base
from sqlalchemy import Column, Integer, String, Boolean, TIMESTAMP, ForeignKey
from sqlalchemy.orm import relationship
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
    owner = relationship("User") 

class User(Base):
    __tablename__ = 'users'

    id=Column(Integer, primary_key=True, nullable=False)
    email=Column(String(100), nullable=False, unique=True)
    password=Column(String(100),nullable=False)
    created_at=Column(TIMESTAMP(timezone=True), server_default='now()',nullable=False)
    phone_number=Column(String(15), nullable=True)

    followers = relationship(
        "Followers", 
        foreign_keys="Followers.following_id", 
        back_populates="following_user",
        cascade="all, delete-orphan"
    )
    
    # Users - this user is following (this user is following them)
    following = relationship(
        "Followers", 
        foreign_keys="Followers.follower_id", 
        back_populates="follower_user",
        cascade="all, delete-orphan"
    )
    

class Votes(Base):
    __tablename__ = 'votes'
    post_id=Column(Integer, ForeignKey("posts.id", ondelete="CASCADE") ,primary_key=True, nullable=False)
    user_id=Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True, nullable=False)
    dir = Column(Integer, nullable=False)

class Followers(Base):
    __tablename__ = 'followers'

    follower_id=Column(Integer, ForeignKey("users.id", ondelete='CASCADE'),primary_key=True,nullable=False)
    following_id=Column(Integer,ForeignKey("users.id", ondelete='CASCADE'), primary_key=True,nullable=False)
    created_at = Column(TIMESTAMP(timezone=True), server_default='now()', nullable=False)


    # The user who is doing the following
    follower_user = relationship(
        "User", 
        foreign_keys=[follower_id], 
        back_populates="following"
    )
    
    # The user who is being followed
    following_user = relationship(
        "User", 
        foreign_keys=[following_id], 
        back_populates="followers"
    )
    __table_args__ = (
        # This will be handled by the database constraint we created in migration
    )