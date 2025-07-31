from abc import ABC, abstractmethod
from typing import Generic, TypeVar, List, Optional, Dict, Any
from sqlalchemy.orm import Session

# TypeVar creates a placeholder for any type, like a  variable that can represent any type
T = TypeVar('T') # T can be Post, User, Votes, or any other type


# Generic[T] makes a class generic it can work with different types
class IBaseRepository(Generic[T], ABC):
    @abstractmethod
    def create(self, **kwargs) -> T:
        pass
    
    @abstractmethod
    def get_by_id(self, id: int) -> Optional[T]:
        pass
    
    @abstractmethod
    def get_all(self, skip: int = 0, limit: int = 100) -> List[T]:
        pass
    
    @abstractmethod
    def update(self, id: int, **kwargs) -> Optional[T]:
        pass
    
    @abstractmethod
    def delete(self, id: int) -> bool:
        pass

class BaseRepository(IBaseRepository[T]):
    def __init__(self, db: Session, model_class):#with model class we can do thissuper().__init__(db, Post)  # Tell base class: use Post model
        self.db = db
        self.model_class = model_class
    
    def create(self, **kwargs) -> T:
        """Create a new entity"""
        db_obj = self.model_class(**kwargs)
        self.db.add(db_obj)
        self.db.commit()
        self.db.refresh(db_obj)
        return db_obj
    
    def get_by_id(self, id: int) -> Optional[T]:
        """Get entity by ID"""
        return self.db.query(self.model_class).filter(self.model_class.id == id).first() #model_class will be Post, Users, Votes table... eg: post = db.query(models.Post).filter(models.Post.id == id).first()
        
    def get_all(self, skip: int = 0, limit: int = 100) -> List[T]:
        """Get all entities with pagination"""
        return self.db.query(self.model_class).offset(skip).limit(limit).all()
    
    def update(self, id: int, **kwargs) -> Optional[T]:
        """Update entity by ID"""
        db_obj = self.get_by_id(id)
        if db_obj:
            for key, value in kwargs.items():
                if hasattr(db_obj, key):
                    setattr(db_obj, key, value)
            self.db.commit()
            self.db.refresh(db_obj)
        return db_obj
    
    def delete(self, id: int) -> bool:
        """Delete entity by ID"""
        db_obj = self.get_by_id(id)
        if db_obj:
            self.db.delete(db_obj)
            self.db.commit()
            return True
        return False
    
    def exists(self, id: int) -> bool:
        """Check if entity exists"""
        return self.db.query(self.model_class).filter(self.model_class.id == id).first() is not None