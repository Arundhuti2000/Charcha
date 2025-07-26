from jose import JWTError, jwt
from datetime import datetime, timedelta
from . import schemas, database, models
from fastapi import Depends, status, HTTPException
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

oauth2_scheme = OAuth2PasswordBearer(tokenUrl='login')

#SECRET_KEY
#Algorithm
#Expiration_Time


SECRET_KEY = "021385sd31vf53sd4azg1vfedr51vbf85rteg1vd53v1d5xv18saw3v1d3x2v123dx1sv5ws3av135sda5v1cx35v185sdv3a"
ALGORITHM= "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

def create_access_token(data: dict):
    to_encode=data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire}) # take the to_encode and add the extra property expiration time which we want to encode into our jwt token 

    encoded_jwt=jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

    return encoded_jwt

def verify_access_token(token: str, credentials_exception):

    try:
        payload=jwt.decode(token, SECRET_KEY, ALGORITHM)
        id:str=payload.get("user_id")
        print("id from payload", id)
        if id is None:
            raise credentials_exception
        #it will validate if the id we got matches our token schema we defined (rn we're only using id to create the token so our token data schema is only id)
        token_data = schemas.TokenData(id=str(id))
    except JWTError:
        raise credentials_exception
    print(token_data)
    return token_data
    
def get_current_user(token:str = Depends(oauth2_scheme),db: Session = Depends(database.get_db)):
    credentials_exception= HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=f"Could not validate credentials", headers={"WWW-Authenticate":"Bearer"})


    token = verify_access_token(token, credentials_exception)
    user=db.query(models.User).filter(models.User.id == token.id).first()
    return user

