const express = require('express');
const axios = require('axios');
const cors = require('cors'); // Import CORS

const app = express();
const PORT = process.env.PORT || 3000;

// BẬT CORS CHO TẤT CẢ DOMAIN TRUY CẬP (SỬA LỖI CHẶN REQUEST TRÊN BROWSER)
app.use(cors());

// LƯU Ý: Link Cloudflare Tunnel ngẫu nhiên rất hay đổi. 
// Đảm bảo bạn cập nhật URL mới nhất khi chạy lại tool gốc bên máy cá nhân!
const API_GOC = 'https://ent-glenn-terrain-project.trycloudflare.com/sicbo/hitclub';

let historyData = [];

async function fetchAndSaveData() {
  try {
    const response = await axios.get(API_GOC, { timeout: 3500 });
    const data = response.data;

    if (!data || !data.phien) return;

    const exists = historyData.some(item => item.phien === data.phien);

    if (!exists) {
      console.log(`[+] Mới: ${data.phien}`);
      historyData.unshift(data);

      if (historyData.length > 50) {
        historyData.pop();
      }
    }
  } catch (error) {
    console.log('Chờ API gốc (Check lại URL TryCloudflare)...');
  }
}

// Quét 3 giây/lần
setInterval(fetchAndSaveData, 3000);

// API 1: Lấy danh sách 50 phiên gần nhất
app.get('/sicbo/sunwin/history', (req, res) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.json({
    success: true,
    total: historyData.length,
    data: historyData
  });
});

// API 2: Lấy phiên mới nhất
app.get('/sicbo/sunwin/latest', (req, res) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.json({
    success: true,
    data: historyData[0] || null
  });
});

app.get('/', (req, res) => {
  res.send('API Trung Gian đang hoạt động!');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
