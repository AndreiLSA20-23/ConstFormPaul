import json

def load_json(file_path: str) -> dict:
  with open(file_path, "r") as file:
    return json.load(file)

def save_json(file_path: str, data: dict):
  with open(file_path, "w") as file:
    json.dump(data, file, indent=4)
