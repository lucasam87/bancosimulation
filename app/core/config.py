from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Banking System"
    API_V1_STR: str = "/api/v1"
    
    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = "password"
    POSTGRES_DB: str = "banking"
    # Provide a default valid URL for build steps or local fallback if env not set, 
    # but Vercel should provide DATABASE_URL
    DATABASE_URL: str = "postgresql://postgres:password@localhost/banking" 
    
    SECRET_KEY: str = "supersecretkey" # Change in production!
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    class Config:
        case_sensitive = True
        # env_file = ".env" # Optional, Vercel injects env vars directly

settings = Settings()
