from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto") #Telling passlib the hashiong algorithm which is bcrypt in our case

def hash(password: str) -> str:
    """
    Hash a password using bcrypt.
    """
    return pwd_context.hash(password)

def verify(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password) # when verifying a password, the algorithm is identified automatically: