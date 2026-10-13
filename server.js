const express = require('express');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

// Thay link API gốc của bạn vào đây (link cloudflare hoặc link trực tiếp từ tele68)
const API_GOC = 'https://gossip-marriage-anime-variance.trycloudflare.com/api/txmd5';

let historyData = [];

async function fetchAndSaveData() {
  try {
    const response = await axios.get(API_GOC, {
      timeout: 5000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
        'Accept': 'application/json, text/plain, */*'
      }
    });

    const resData = response.data;
    if (!resData) return;

    // Lấy danh sách phiên từ trường "list" hoặc "data"
    let items = [];
    if (Array.isArray(resData.list)) {
      items = resData.list;
    } else if (Array.isArray(resData.data)) {
      items = resData.data;
    } else if (Array.isArray(resData)) {
      items = resData;
    } else if (resData.data) {
      items = [resData.data];
    }

    let addedCount = 0;

    // Quét từng phiên trong danh sách trả về
    for (const item of items) {
      const sessionId = item.id || item._id || item.phien;
      if (!sessionId) continue;

      // Kiểm tra trùng lặp
      const exists = historyData.some(entry => {
        const entryId = entry.id || entry._id || entry.phien;
        return entryId === sessionId;
      });

      if (!exists) {
        historyData.push(item);
        addedCount++;
      }
    }

    if (addedCount > 0) {
      // Sắp xếp phiên mới nhất (id lớn nhất) lên đầu
      historyData.sort((a, b) => {
        const idA = Number(a.id || a.phien) || 0;
        const idB = Number(b.id || b.phien) || 0;
        return idB - idA;
      });

      // Giữ tối đa 1000 phiên gần nhất
      if (historyData.length > 1000) {
        historyData = historyData.slice(0, 1000);
      }

      console.log(`[+] Đã nạp thêm ${addedCount} phiên mới! Tổng hiện có: ${historyData.length}`);
    }
  } catch (error) {
    console.log('Chờ kết nối API gốc:', error.message);
  }
}

// Quét 3 giây / lần
setInterval(fetchAndSaveData, 3000);

// API 1: Xem toàn bộ lịch sử (tối đa 1000 phiên)
app.get('/api/txmd5/history', (req, res) => {
  res.json({
    success: true,
    total: historyData.length,
    data: historyData
  });
});

// API 2: Xem duy nhất phiên mới nhất
app.get('/api/txmd5/latest', (req, res) => {
  res.json({
    success: true,
    data: historyData[0] || null
  });
});

app.get('/', (req, res) => {
  res.send('API Trung Gian TXMD5 đang hoạt động 24/7!');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
