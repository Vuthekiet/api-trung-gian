const express = require('express');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

// Link API gốc TXMD5
const API_GOC = 'https://gossip-marriage-anime-variance.trycloudflare.com/api/txmd5';

// Mảng lưu 1000 phiên
let historyData = [];

async function fetchAndSaveData() {
  try {
    // Thêm Headers giả lập trình duyệt thật để tránh bị Cloudflare chặn
    const response = await axios.get(API_GOC, {
      timeout: 5000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7'
      }
    });

    const resData = response.data;

    // Kiểm tra cấu trúc dữ liệu trả về từ API gốc
    if (resData && resData.success && resData.data && resData.data.phien) {
      const item = resData.data;

      // Kiểm tra xem phiên này đã lưu chưa
      const exists = historyData.some(entry => entry.phien === item.phien);

      if (!exists) {
        console.log(`[+] Đã lưu phiên mới: #${item.phien}`);
        
        // Đưa phiên mới lên đầu mảng
        historyData.unshift(item);

        // Giữ đúng 1000 phiên
        if (historyData.length > 1000) {
          historyData.pop();
        }
      }
    }
  } catch (error) {
    console.log('Lỗi kết nối API gốc (Cloudflare):', error.message);
  }
}

// Chạy quét API gốc mỗi 3 giây/lần
setInterval(fetchAndSaveData, 3000);

// API 1: Lấy danh sách 1000 phiên gần nhất
app.get('/api/txmd5/history', (req, res) => {
  res.json({
    success: true,
    total: historyData.length,
    data: historyData
  });
});

// API 2: Lấy phiên mới nhất
app.get('/api/txmd5/latest', (req, res) => {
  res.json({
    success: true,
    data: historyData[0] || null
  });
});

// Trang chủ kiểm tra server
app.get('/', (req, res) => {
  res.send('API Trung Gian TXMD5 đang hoạt động 24/7!');
});

app.listen(PORT, () => {
  console.log(`Server đang chạy tại port ${PORT}`);
});
