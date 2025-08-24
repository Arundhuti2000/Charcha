from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    database_hostname: str 
    database_port: str
    database_username: str 
    database_password: str
    database_name: str
    secret_key: str 
    algorithm: str
    access_token_expire_minutes: int

    azure_storage_account_name: str
    azure_storage_account_key: str
    azure_storage_container_name: str = "post-images"
    azure_storage_url: str = ""

    max_image_size_mb: int = 5
    allowed_image_types: list = ["image/jpeg", "image/png", "image/gif", "image/webp"]

    class Config:
        env_file = ".env"

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        if not self.azure_storage_url:
            self.azure_storage_url = f"https://{self.azure_storage_account_name}.blob.core.windows.net"

settings = Settings()