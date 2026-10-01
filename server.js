const express = require('express');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

// Link API gốc mới
const API_GOC = 'https://gossip-marriage-anime-variance.trycloudflare.com/api/txmd5';

// Mảng bộ nhớ lưu tối đa 1000 phiên gần nhất
let historyData = [];

async function fetchAndSaveData() {
  try {
    const response = await axios.get(API_GOC, { timeout: 2500 });
    const resData = response.data;

    // Kiểm tra API trả về thành công và có object data bên trong
    if (!resData || !resData.success || !resData.data || !resData.data.phien) {
      return;
    }

    const item = resData.data; // Dữ liệu phiên thực sự nằm trong resData.data

    // Kiểm tra xem phiên này đã có trong lịch sử chưa
    const exists = historyData.some(entry => entry.phien === item.phien);

    if (!exists) {
      console.log(`[+] Đã lưu phiên mới: #${item.phien}`);
      
      // Đưa phiên mới lên đầu mảng
      historyData.unshift(item);

      // Giữ đúng 1000 phiên (xóa bớt phiên cũ nhất ở cuối mảng)
      if (historyData.length > 1000) {
        historyData.pop();
      }
    }
  } catch (error) {
    console.log('Đang chờ kết nối tới API gốc...');
  }
}

// Chạy quét API gốc mỗi 3 giây/lần
setInterval(fetchAndSaveData, 3000);

// API 1: Lấy danh sách tối đa 1000 phiên gần nhất
app.get('/api/txmd5/history', (req, res) => {
  res.json({
    success: true,
    total: historyData.length,
    data: historyData
  });
});

// API 2: Lấy duy nhất 1 phiên mới nhất
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
