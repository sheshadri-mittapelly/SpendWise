from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.db.databases import get_db
import jwt
from app.core.config import settings
from app.models import User

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET_KEY,
            algorithms=[settings.JWT_ALGORITHM],
        )
        print("JWT PAYLOAD:", payload)

        user_id = payload.get("sub")
        print("USER ID FROM TOKEN:", user_id)

        if user_id is None:
            raise credentials_exception

        user_id = int(user_id)

    except jwt.ExpiredSignatureError:
        print("JWT ERROR: Token expired")
        raise credentials_exception

    except jwt.InvalidTokenError as error:
        print("JWT ERROR:", str(error))
        raise credentials_exception

    except (ValueError, TypeError) as error:
        print("JWT USER ID ERROR:", str(error))
        raise credentials_exception

    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise credentials_exception

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive",
        )

    return user