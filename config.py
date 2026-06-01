from pymongo import MongoClient
import os

MONGODB_API_URL = os.getenv("MONGODB_API_URL")      
db = MongoClient(MONGODB_API_URL)