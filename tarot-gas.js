// ============================================
// 🔮 塔羅占卜 & 八字命盤 - GAS 後端 v2
// LINE Messaging API + Flex Message 圖文卡片
// ============================================

// ⚠️ 請填入你的 LINE 設定
const LINE_CHANNEL_TOKEN = '你的 Channel Access Token';
const LINE_USER_ID = '你的 User ID';

// ============================================
// 接收請求
// ============================================
function doPost(e) {
  console.log('=== doPost 開始 ===');
  
  try {
    const rawData = e.postData.contents;
    console.log('原始資料:', rawData);
    
    const data = JSON.parse(rawData);
    console.log('解析後 action:', data.action);
    
    switch (data.action) {
      case 'sendTarot':
        console.log('→ 處理塔羅占卜');
        return handleSendTarot(data.result);
      
      case 'sendBazi':
        console.log('→ 處理八字命盤');
        return handleSendBazi(data.result);
      
      case 'testNotify':
        console.log('→ 處理測試通知');
        return handleTestNotify();
      
      default:
        console.log('→ 未知的 action:', data.action);
        return jsonResponse({ success: false, error: '未知的 action' });
    }
  } catch (error) {
    console.error('doPost 錯誤:', error.message);
    console.error('錯誤堆疊:', error.stack);
    return jsonResponse({ success: false, error: error.message });
  }
}

function doGet(e) {
  return ContentService.createTextOutput(
    '🔮 塔羅占卜 & 八字命盤 GAS 後端 v2 運作中！\n' +
    '支援功能：塔羅占卜、八字命盤、LINE Flex Message'
  );
}

// ============================================
// 塔羅占卜 - Flex Message
// ============================================
function handleSendTarot(result) {
  console.log('=== handleSendTarot 開始 ===');
  console.log('收到結果:', JSON.stringify(result));
  
  if (!result || !result.card) {
    console.error('錯誤：沒有卡片資料');
    return jsonResponse({ success: false, error: '沒有卡片資料' });
  }
  
  const card = result.card;
  const scores = result.scores || { overall: 70, love: 70, career: 70, wealth: 70 };
  const date = result.date || new Date().toLocaleDateString('zh-TW');
  
  console.log('卡片名稱:', card.name);
  console.log('分數:', JSON.stringify(scores));
  
  // 建立 Flex Message
  const flexMessage = createTarotFlexMessage(card, scores, date);
  console.log('Flex Message 建立完成');
  
  // 發送
  const sendResult = sendLineFlexMessage(flexMessage);
  console.log('發送結果:', JSON.stringify(sendResult));
  
  return jsonResponse({ success: sendResult.success });
}

// 建立塔羅 Flex Message
function createTarotFlexMessage(card, scores, date) {
  // 關鍵詞處理
  const keywords = card.keywords || ['神秘', '未知'];
  const keywordBoxes = keywords.slice(0, 4).map(function(k) {
    return {
      type: 'box',
      layout: 'vertical',
      contents: [{
        type: 'text',
        text: k,
        size: 'xs',
        color: '#9b59b6',
        align: 'center'
      }],
      backgroundColor: '#2d2d44',
      cornerRadius: 'md',
      paddingAll: '8px',
      flex: 1,
      margin: 'sm'
    };
  });
  
  return {
    type: 'flex',
    altText: '🔮 塔羅占卜結果：' + card.name,
    contents: {
      type: 'bubble',
      size: 'giga',
      header: {
        type: 'box',
        layout: 'vertical',
        backgroundColor: '#1a1a2e',
        paddingAll: '20px',
        contents: [
          {
            type: 'text',
            text: '🔮 每日塔羅占卜',
            color: '#d4af37',
            size: 'lg',
            weight: 'bold'
          },
          {
            type: 'text',
            text: date,
            color: '#888888',
            size: 'sm',
            margin: 'sm'
          }
        ]
      },
      body: {
        type: 'box',
        layout: 'vertical',
        backgroundColor: '#16213e',
        paddingAll: '20px',
        contents: [
          // 牌名
          {
            type: 'box',
            layout: 'vertical',
            contents: [
              {
                type: 'text',
                text: card.icon || '🃏',
                size: '3xl',
                align: 'center'
              },
              {
                type: 'text',
                text: card.name,
                size: 'xxl',
                weight: 'bold',
                color: '#ffffff',
                align: 'center',
                margin: 'md'
              },
              {
                type: 'text',
                text: card.enName || 'Tarot Card',
                size: 'sm',
                color: '#888888',
                align: 'center',
                margin: 'sm'
              }
            ]
          },
          // 分隔線
          {
            type: 'separator',
            margin: 'lg',
            color: '#333355'
          },
          // 運勢分數
          {
            type: 'box',
            layout: 'horizontal',
            margin: 'lg',
            contents: [
              createScoreBox('⭐整體', scores.overall),
              createScoreBox('💕愛情', scores.love),
              createScoreBox('💼事業', scores.career),
              createScoreBox('💰財運', scores.wealth)
            ]
          },
          // 分隔線
          {
            type: 'separator',
            margin: 'lg',
            color: '#333355'
          },
          // 關鍵詞
          {
            type: 'box',
            layout: 'horizontal',
            margin: 'lg',
            contents: keywordBoxes
          },
          // 牌義
          {
            type: 'box',
            layout: 'vertical',
            margin: 'lg',
            contents: [
              {
                type: 'text',
                text: '📖 牌義解讀',
                color: '#d4af37',
                size: 'sm',
                weight: 'bold'
              },
              {
                type: 'text',
                text: card.meaning || '等待揭曉...',
                color: '#cccccc',
                size: 'sm',
                wrap: true,
                margin: 'sm'
              }
            ]
          },
          // 建議
          {
            type: 'box',
            layout: 'vertical',
            margin: 'lg',
            contents: [
              {
                type: 'text',
                text: '💡 今日建議',
                color: '#d4af37',
                size: 'sm',
                weight: 'bold'
              },
              {
                type: 'text',
                text: card.advice || '保持正向心態！',
                color: '#cccccc',
                size: 'sm',
                wrap: true,
                margin: 'sm'
              }
            ]
          }
        ]
      },
      footer: {
        type: 'box',
        layout: 'vertical',
        backgroundColor: '#0f0f1a',
        paddingAll: '15px',
        contents: [
          {
            type: 'text',
            text: '🔮 塔羅占卜 by AI 命理師',
            color: '#666666',
            size: 'xs',
            align: 'center'
          }
        ]
      }
    }
  };
}

// 建立分數方塊
function createScoreBox(label, score) {
  var color = '#27ae60'; // 綠色 (高)
  if (score < 50) {
    color = '#e74c3c'; // 紅色 (低)
  } else if (score < 75) {
    color = '#f39c12'; // 橙色 (中)
  }
  
  return {
    type: 'box',
    layout: 'vertical',
    flex: 1,
    contents: [
      {
        type: 'text',
        text: label,
        size: 'xxs',
        color: '#888888',
        align: 'center'
      },
      {
        type: 'text',
        text: String(score),
        size: 'lg',
        weight: 'bold',
        color: color,
        align: 'center',
        margin: 'sm'
      }
    ]
  };
}

// ============================================
// 八字命盤 - Flex Message
// ============================================
function handleSendBazi(result) {
  console.log('=== handleSendBazi 開始 ===');
  console.log('收到結果:', JSON.stringify(result));
  
  if (!result || !result.bazi) {
    console.error('錯誤：沒有八字資料');
    return jsonResponse({ success: false, error: '沒有八字資料' });
  }
  
  const bazi = result.bazi;
  const elements = result.elements || { '木': 2, '火': 1, '土': 2, '金': 1, '水': 2 };
  const dayMaster = result.dayMaster || '甲';
  const traits = result.traits || { element: '木', trait: '正直向上', color: '綠色', lucky: '水、木' };
  const gender = result.gender === 'male' ? '男' : '女';
  
  console.log('日主:', dayMaster);
  console.log('五行:', JSON.stringify(elements));
  
  // 建立 Flex Message
  const flexMessage = createBaziFlexMessage(bazi, elements, dayMaster, traits, gender);
  console.log('Flex Message 建立完成');
  
  // 發送
  const sendResult = sendLineFlexMessage(flexMessage);
  console.log('發送結果:', JSON.stringify(sendResult));
  
  return jsonResponse({ success: sendResult.success });
}

// 建立八字 Flex Message
function createBaziFlexMessage(bazi, elements, dayMaster, traits, gender) {
  return {
    type: 'flex',
    altText: '📜 八字命盤分析：' + dayMaster + gender + '命',
    contents: {
      type: 'bubble',
      size: 'giga',
      header: {
        type: 'box',
        layout: 'vertical',
        backgroundColor: '#1a1a2e',
        paddingAll: '20px',
        contents: [
          {
            type: 'text',
            text: '📜 八字命盤分析',
            color: '#d4af37',
            size: 'lg',
            weight: 'bold'
          },
          {
            type: 'text',
            text: '日主：' + dayMaster + ' | ' + gender + '命',
            color: '#888888',
            size: 'sm',
            margin: 'sm'
          }
        ]
      },
      body: {
        type: 'box',
        layout: 'vertical',
        backgroundColor: '#16213e',
        paddingAll: '20px',
        contents: [
          // 四柱標題
          {
            type: 'text',
            text: '【 四 柱 八 字 】',
            color: '#d4af37',
            size: 'sm',
            weight: 'bold',
            align: 'center'
          },
          // 四柱
          {
            type: 'box',
            layout: 'horizontal',
            margin: 'lg',
            contents: [
              createPillarBox('年柱', bazi.year),
              createPillarBox('月柱', bazi.month),
              createPillarBox('日柱', bazi.day),
              createPillarBox('時柱', bazi.hour)
            ]
          },
          // 分隔線
          {
            type: 'separator',
            margin: 'lg',
            color: '#333355'
          },
          // 五行分析
          {
            type: 'text',
            text: '【 五 行 分 析 】',
            color: '#d4af37',
            size: 'sm',
            weight: 'bold',
            align: 'center',
            margin: 'lg'
          },
          {
            type: 'box',
            layout: 'horizontal',
            margin: 'md',
            contents: [
              createElementBox('🌳木', elements['木'] || 0),
              createElementBox('🔥火', elements['火'] || 0),
              createElementBox('⛰️土', elements['土'] || 0),
              createElementBox('🪙金', elements['金'] || 0),
              createElementBox('💧水', elements['水'] || 0)
            ]
          },
          // 分隔線
          {
            type: 'separator',
            margin: 'lg',
            color: '#333355'
          },
          // 日主分析
          {
            type: 'box',
            layout: 'vertical',
            margin: 'lg',
            contents: [
              {
                type: 'text',
                text: '👤 日主特質',
                color: '#d4af37',
                size: 'sm',
                weight: 'bold'
              },
              {
                type: 'text',
                text: '日主「' + dayMaster + '」屬' + traits.element + '。' + traits.trait,
                color: '#cccccc',
                size: 'sm',
                wrap: true,
                margin: 'sm'
              }
            ]
          },
          // 開運建議
          {
            type: 'box',
            layout: 'vertical',
            margin: 'lg',
            contents: [
              {
                type: 'text',
                text: '🎯 開運建議',
                color: '#d4af37',
                size: 'sm',
                weight: 'bold'
              },
              {
                type: 'text',
                text: '開運顏色：' + traits.color + '\n有利五行：' + traits.lucky,
                color: '#cccccc',
                size: 'sm',
                wrap: true,
                margin: 'sm'
              }
            ]
          }
        ]
      },
      footer: {
        type: 'box',
        layout: 'vertical',
        backgroundColor: '#0f0f1a',
        paddingAll: '15px',
        contents: [
          {
            type: 'text',
            text: '📜 八字命盤 by AI 命理師',
            color: '#666666',
            size: 'xs',
            align: 'center'
          }
        ]
      }
    }
  };
}

// 建立柱子方塊
function createPillarBox(title, pillar) {
  return {
    type: 'box',
    layout: 'vertical',
    flex: 1,
    backgroundColor: '#2d2d44',
    cornerRadius: 'md',
    paddingAll: '10px',
    margin: 'sm',
    contents: [
      {
        type: 'text',
        text: title,
        size: 'xxs',
        color: '#888888',
        align: 'center'
      },
      {
        type: 'text',
        text: pillar.stem || '?',
        size: 'xl',
        weight: 'bold',
        color: '#e74c3c',
        align: 'center',
        margin: 'sm'
      },
      {
        type: 'text',
        text: pillar.branch || '?',
        size: 'xl',
        weight: 'bold',
        color: '#27ae60',
        align: 'center',
        margin: 'sm'
      },
      {
        type: 'text',
        text: (pillar.stemElement || '?') + '/' + (pillar.branchElement || '?'),
        size: 'xxs',
        color: '#666666',
        align: 'center',
        margin: 'sm'
      }
    ]
  };
}

// 建立五行方塊
function createElementBox(label, count) {
  return {
    type: 'box',
    layout: 'vertical',
    flex: 1,
    contents: [
      {
        type: 'text',
        text: label,
        size: 'xs',
        align: 'center'
      },
      {
        type: 'text',
        text: String(count),
        size: 'lg',
        weight: 'bold',
        color: count === 0 ? '#e74c3c' : '#ffffff',
        align: 'center',
        margin: 'sm'
      }
    ]
  };
}

// ============================================
// LINE Messaging API
// ============================================
function sendLineFlexMessage(flexMessage) {
  console.log('=== sendLineFlexMessage 開始 ===');
  console.log('LINE_USER_ID:', LINE_USER_ID ? '已設定' : '未設定');
  console.log('LINE_CHANNEL_TOKEN:', LINE_CHANNEL_TOKEN ? '已設定 (長度:' + LINE_CHANNEL_TOKEN.length + ')' : '未設定');
  
  const url = 'https://api.line.me/v2/bot/message/push';
  
  const payload = {
    to: LINE_USER_ID,
    messages: [flexMessage]
  };
  
  console.log('Payload to:', payload.to);
  
  const options = {
    method: 'post',
    contentType: 'application/json',
    headers: {
      'Authorization': 'Bearer ' + LINE_CHANNEL_TOKEN
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };
  
  try {
    console.log('準備發送 LINE 訊息...');
    const response = UrlFetchApp.fetch(url, options);
    const code = response.getResponseCode();
    const content = response.getContentText();
    
    console.log('LINE 回應代碼:', code);
    console.log('LINE 回應內容:', content);
    
    if (code === 200) {
      console.log('✅ LINE Flex Message 發送成功');
      return { success: true };
    } else {
      console.error('❌ LINE 發送失敗:', content);
      return { success: false, error: content };
    }
  } catch (error) {
    console.error('❌ LINE 發送錯誤:', error.message);
    return { success: false, error: error.message };
  }
}

// ============================================
// 測試通知
// ============================================
function handleTestNotify() {
  console.log('=== handleTestNotify 開始 ===');
  
  const flexMessage = {
    type: 'flex',
    altText: '🔮 塔羅占卜測試通知',
    contents: {
      type: 'bubble',
      header: {
        type: 'box',
        layout: 'vertical',
        backgroundColor: '#1a1a2e',
        paddingAll: '20px',
        contents: [
          {
            type: 'text',
            text: '🔮 系統測試',
            color: '#d4af37',
            size: 'lg',
            weight: 'bold',
            align: 'center'
          }
        ]
      },
      body: {
        type: 'box',
        layout: 'vertical',
        backgroundColor: '#16213e',
        paddingAll: '20px',
        contents: [
          {
            type: 'text',
            text: '✅ GAS 後端連接成功！',
            color: '#27ae60',
            size: 'lg',
            weight: 'bold',
            align: 'center'
          },
          {
            type: 'text',
            text: '塔羅占卜 & 八字命盤 v2',
            color: '#888888',
            size: 'sm',
            align: 'center',
            margin: 'md'
          },
          {
            type: 'text',
            text: 'LINE Flex Message 圖文卡片功能正常',
            color: '#cccccc',
            size: 'sm',
            align: 'center',
            wrap: true,
            margin: 'lg'
          }
        ]
      },
      footer: {
        type: 'box',
        layout: 'vertical',
        backgroundColor: '#0f0f1a',
        paddingAll: '15px',
        contents: [
          {
            type: 'text',
            text: new Date().toLocaleString('zh-TW'),
            color: '#666666',
            size: 'xs',
            align: 'center'
          }
        ]
      }
    }
  };
  
  const result = sendLineFlexMessage(flexMessage);
  
  return jsonResponse({ 
    success: result.success, 
    message: result.success ? '測試訊息已發送' : result.error 
  });
}

// 手動測試用
function testSendFlexMessage() {
  console.log('=== 手動測試開始 ===');
  handleTestNotify();
}

// 測試塔羅發送
function testSendTarot() {
  console.log('=== 測試塔羅發送 ===');
  
  const mockResult = {
    card: {
      id: 0,
      name: '愚者',
      enName: 'The Fool',
      icon: '🃏',
      keywords: ['新開始', '冒險', '純真', '自由'],
      meaning: '愚者代表著新的開始和無限的可能性。它象徵著勇於冒險、保持純真的心態。',
      advice: '今天適合嘗試新事物，保持開放的心態。'
    },
    scores: { overall: 85, love: 70, career: 80, wealth: 65 },
    date: new Date().toLocaleDateString('zh-TW')
  };
  
  handleSendTarot(mockResult);
}

// ============================================
// 工具函數
// ============================================
function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
