from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime

app = Flask(__name__)
# Bật CORS để cho phép web game bắn dữ liệu sang server Render
CORS(app)

# Lưu kết quả mới nhất trong RAM của Render
latest_data = {
    "ket_qua": "Chưa có dữ liệu",
    "phien": "0",
    "thoi_gian": datetime.now().strftime("%d-%m-%Y %H:%M:%S UTC+7"),
    "tong": 0,
    "xuc_xac_1": 0,
    "xuc_xac_2": 0,
    "xuc_xac_3": 0
}

@app.route("/", methods=["GET"])
def home():
    """Endpoint chính: Trả về đúng định dạng JSON như trong ảnh"""
    return jsonify(latest_data)

@app.route("/update", methods=["POST"])
def update():
    """Nhận dữ liệu tự động từ tab game bắn sang"""
    global latest_data
    content = request.get_json(silent=True)
    if content:
        latest_data = content
        print(f"🔥 Cập nhật phiên #{content.get('phien')}: [{content.get('xuc_xac_1')}-{content.get('xuc_xac_2')}-{content.get('xuc_xac_3')}] => {content.get('ket_qua')}")
        return jsonify({"status": "success"}), 200
    return jsonify({"status": "error", "message": "No data"}), 400

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
