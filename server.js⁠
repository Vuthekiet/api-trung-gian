const express = require('express');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;
const API_GOC = 'https://ent-glenn-terrain-project.trycloudflare.com/sicbo/sunwin';

// Bộ nhớ lưu 50 phiên gần nhất
let historyData = [];

async function fetchAndSaveData() {
  try {
    const response = await axios.get(API_GOC, { timeout: 2500 });
    const data = response.data;

    if (!data || !data.success || !data.phien) return;

    // Kiểm tra xem phiên đã tồn tại chưa
    const exists = historyData.some(item => item.phien === data.phien);

    if (!exists) {
      console.log(`[+] Mới: ${data.phien}`);
      
      // Đưa phiên mới lên đầu mảng
      historyData.unshift(data);

      // Giữ đúng 50 phiên (xóa bớt phiên cũ ở cuối)
      if (historyData.length > 50) {
        historyData.pop();
      }
    }
  } catch (error) {
    console.log('Chờ API gốc...');
  }
}

// Chạy quét 3 giây/lần
setInterval(fetchAndSaveData, 3000);

// API 1: Lấy danh sách 50 phiên gần nhất
app.get('/sicbo/sunwin/history', (req, res) => {
  res.json({
    success: true,
    total: historyData.length,
    data: historyData
  });
});

// API 2: Lấy phiên mới nhất
app.get('/sicbo/sunwin/latest', (req, res) => {
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
