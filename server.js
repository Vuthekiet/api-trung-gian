const express = require('express');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

const API_GOC = 'https://wtxmd52.tele68.com/v1/txmd5/sessions';

let historyData = [];
let lastRawResponse = null; // Lưu lại dữ liệu thô gần nhất để debug
let lastError = null;       // Lưu lại lỗi gần nhất

async function fetchAndSaveData() {
  try {
    const response = await axios.get(API_GOC, {
      timeout: 5000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
        'Accept': 'application/json, text/plain, */*'
      }
    });

    lastRawResponse = response.data; // Lưu lại dữ liệu thô
    lastError = null;

    // Tự động nhận diện trường dữ liệu (phien / session / id)
    let item = response.data;
    if (response.data && response.data.data) {
      item = response.data.data;
    }

    // Lấy mã phiên (hỗ trợ cả phien, session, id)
    const phienId = item.phien || item.session || item.session_id || item.id;

    if (phienId) {
      const exists = historyData.some(entry => {
        const currentId = entry.phien || entry.session || entry.session_id || entry.id;
        return currentId === phienId;
      });

      if (!exists) {
        console.log(`[+] Đã lưu phiên mới: #${phienId}`);
        historyData.unshift(item);

        if (historyData.length > 1000) {
          historyData.pop();
        }
      }
    }
  } catch (error) {
    lastError = error.message;
    console.log('Lỗi kết nối API gốc:', error.message);
  }
}

// Quét 3 giây/lần
setInterval(fetchAndSaveData, 3000);

// API Lịch sử 1000 phiên
app.get('/api/txmd5/history', (req, res) => {
  res.json({
    success: true,
    total: historyData.length,
    data: historyData
  });
});

// API Phiên mới nhất
app.get('/api/txmd5/latest', (req, res) => {
  res.json({
    success: true,
    data: historyData[0] || null
  });
});

// ROUTE DEBUG: Xem dữ liệu thô API gốc trả về cho Render
app.get('/debug', (req, res) => {
  res.json({
    last_error: lastError,
    raw_response_from_api_goc: lastRawResponse
  });
});

app.get('/', (req, res) => {
  res.send('API Trung Gian TXMD5 đang chạy!');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
