from pydantic import BaseModel, EmailStr, field_validator




class User(BaseModel):
    username: str 
    email: EmailStr
    account_id: int
    
    

    @field_validator("account_id")
    @classmethod
    def validate_account_id(cls, value):
        if value <= 0:
            raise ValueError(f"account_id must be a positive integer not {value}")
        return value
    

user1 = User(username = "Benedo", email = "a@gmail.com", account_id = 1)
user1_json = user1.model_dump_json()
print(user1_json)