# pylint: disable=unused-import
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBasic, HTTPBasicCredentials
from pydantic import BaseModel, ValidationError, field_validator
import gspread
from google.oauth2.service_account import Credentials
import threading
import logging
import secrets

# 配置日誌
logging.basicConfig(level=logging.INFO)

app = FastAPI()

# CORS 設定：允許所有來源
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 允許所有來源，生產環境應限制為前端域名
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ 使用者帳號密碼清單（可自行修改）
USERS = {
    "FRC9427": "942794272023",
    "Eric": "20080706",
    "Jarod": "20080610",
    "visitor":"94272023"
}

security = HTTPBasic()

# ✅ 驗證帳號密碼函式
def verify_user(credentials: HTTPBasicCredentials = Depends(security)):
    username = credentials.username.strip()
    password = credentials.password.strip()
    correct_password = USERS.get(username)

    if not correct_password or not secrets.compare_digest(password, correct_password):
        raise HTTPException(status_code=401, detail="Unauthorized")

    return username


# 更新後的資料模型
class ScoutingData(BaseModel):
    match: int = 0
    team_number: int = 0
    auto_L1: int = 0
    auto_L2: int = 0
    auto_L3: int = 0
    auto_L4: int = 0
    teleop_L1: int = 0
    teleop_L2: int = 0
    teleop_L3: int = 0
    teleop_L4: int = 0
    cage_level: str = "none"
    processor: int = 0
    net: int = 0
    fouls: int = 0
    major_fouls: int = 0
    notes: str = ""

    @field_validator("*", mode="before")
    @classmethod
    def convert_to_int_or_str(cls, v, info):
        field_name = info.field_name
        field = cls.model_fields[field_name]
        if v == "" or v is None:
            return field.default
        if field.annotation == int:
            return int(v)
        return v

# 寫入 Google Sheets
def append_to_sheets(data):
    row = [
        data.match,
        data.team_number, data.auto_L1, data.auto_L2, data.auto_L3, data.auto_L4,
        data.teleop_L1, data.teleop_L2, data.teleop_L3, data.teleop_L4,
        data.cage_level, data.processor, data.net, data.fouls,
        data.major_fouls, data.notes
    ]
    logging.info(f"Appending row: {row}")
    sheet.append_row(row)
    logging.info("Data written successfully to Google Sheets.")

# 連接 Google Sheets
try:
    creds = Credentials.from_service_account_file("service_account.json", scopes=[
        "https://www.googleapis.com/auth/spreadsheets",
        "https://www.googleapis.com/auth/drive"
    ])
    client = gspread.authorize(creds)
    SPREADSHEET_ID = "1hQeJuhzA7hE7norBIg3acR4eNtIIO4veg371V8lko3I"  # 請確認此 ID
    sheet = client.open_by_key(SPREADSHEET_ID).sheet1
    logging.info("Connected to Google Sheets successfully.")
except Exception as e:
    logging.error(f"Failed to connect to Google Sheets: {e}")
    raise HTTPException(status_code=500, detail=f"Failed to initialize Google Sheets: {e}")

@app.get("/")
def read_root():
    return {"message": "Hello, FRC Scouting API is running!"}

@app.get("/submit/")
async def submit_get():
    return {"message": "Use POST method to submit scouting data."}

# ✅ 加入驗證的 POST /submit/ API
@app.post("/submit/")
async def submit_data(data: ScoutingData, username: str = Depends(verify_user)):
    logging.info(f"User '{username}' submitted data: {data}")
    try:
        append_to_sheets(data)
        return {"message": "Data successfully written to Google Sheets!"}
    except ValidationError as ve:
        logging.error(f"Validation error: {ve.errors()}")
        raise HTTPException(status_code=422, detail=ve.errors())
    except Exception as e:
        logging.error(f"Error writing to Google Sheets: {e}")
        raise HTTPException(status_code=500, detail=str(e))