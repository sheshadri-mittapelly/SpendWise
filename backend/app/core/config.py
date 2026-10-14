from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    APP_NAME : str = "SpendWise APP"
    APP_VERSION : str = "1.0.0"
    DEBUG : bool = True

    DATABASE_URL : str

    JWT_SECRET_KEY : str
    JWT_ALGORITHM : str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES : int = 30

    GOOGLE_CLIENT_ID : str = ""
    GOOGLE_CLIENT_SECRET : str = ""
    GOOGLE_REDIRECT_URI : str = ""

    model_config = SettingsConfigDict(env_file=".env",case_sensitive=True,extra="ignore")

settings = Settings()
