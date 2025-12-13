// ============================================
// 🔮 塔羅占卜 & 八字命盤 - GAS 後端
// LINE Messaging API + Flex Message 圖文卡片
// ============================================

// ⚠️ 請填入你的 LINE 設定
const LINE_CHANNEL_TOKEN = '你的 Channel Access Token';
const LINE_USER_ID = '你的 User ID';

// 塔羅牌圖片 URL（使用 emoji 圖片服務）
const TAROT_IMAGES = {
  '愚者': 'https://em-content.zobj.net/source/apple/391/playing-card-black-joker_1f0cf.png',
  '魔術師': 'https://em-content.zobj.net/source/apple/391/top-hat_1f3a9.png',
  '女祭司': 'https://em-content.zobj.net/source/apple/391/crescent-moon_1f319.png',
  '女皇': 'https://em-content.zobj.net/source/apple/391/crown_1f451.png',
  '皇帝': 'https://em-content.zobj.net/source/apple/391/castle_1f3f0.png',
  '教皇': 'https://em-content.zobj.net/source/apple/391/church_26ea.png',
  '戀人': 'https://em-content.zobj.net/source/apple/391/two-hearts_1f495.png',
  '戰車': 'https://em-content.zobj.net/source/apple/391/racing-car_1f3ce-fe0f.png',
  '力量': 'https://em-content.zobj.net/source/apple/391/lion_1f981.png',
  '隱士': 'https://em-content.zobj.net/source/apple/391/mountain_26f0-fe0f.png',
  '命運之輪': 'https://em-content.zobj.net/source/apple/391/ferris-wheel_1f3a1.png',
  '正義': 'https://em-content.zobj.net/source/apple/391/balance-scale_2696-fe0f.png',
  '倒吊人': 'https://em-content.zobj.net/source/apple/391/upside-down-face_1f643.png',
  '死神': 'https://em-content.zobj.net/source/apple/391/butterfly_1f98b.png',
  '節制': 'https://em-content.zobj.net/source/apple/391/amphora_1f3fa.png',
  '惡魔': 'https://em-content.zobj.net/source/apple/391/smiling-face-with-horns_1f608.png',
  '高塔': 'https://em-content.zobj.net/source/apple/391/tokyo-tower_1f5fc.png',
  '星星': 'https://em-content.zobj.net/source/apple/391/glowing-star_1f31f.png',
  '月亮': 'https://em-content.zobj.net/source/apple/391/full-moon_1f315.png',
  '太陽': 'https://em-content.zobj.net/source/apple/391/sun_2600-fe0f.png',
  '審判': 'https://em-content.zobj.net/source/apple/391/postal-horn_1f4ef.png',
  '世界': 'https://em-content.zobj.net/source/apple/391/globe-showing-asia-australia_1f30f.png'
};

// 預設塔羅圖片
const DEFAULT_TAROT_IMAGE = 'https://em-content.zobj.net/source/apple/391/crystal-ball_1f52e.png';

// 八字五行圖片
const ELEMENT_IMAGES = {
  '木': 'https://em-content.zobj.net/source/apple/391/deciduous-tree_1f333.png',
  '火': 'https://em-content.zobj.net/source/apple/391/fire_1f525.png',
  '土': 'https://em-content.zobj.net/source/apple/391/mountain_26f0-fe0f.png',
  '金': 'https://em-content.zobj.net/source/apple/391/coin_1fa99.png',
  '水': 'https://em-content.zobj.net/source/apple/391/water-wave_1f30a.png'
};

// ============================================
// 接收請求
// ============================================
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    console.log('收到請求:', JSON.stringify(data));
    
    switch (data.action) {
      case 'sendTarot':
        return handleSendTarot(data.result);
      
      case 'sendBazi':
        return handleSendBazi(data.result);
      
      case 'testNotify':
        return handleTestNotify();
      
      default:
        return jsonResponse({ success: false, error: '未知的 action' });
    }
  } catch (error) {
    console.error('doPost 錯誤:', error);
    return jsonResponse({ success: false, error: error.message });
  }
}

function doGet(e) {
  return ContentService.createTextOutput(
    '🔮 塔羅占卜 & 八字命盤 GAS 後端運作中！\n' +
    '支援功能：塔羅占卜、八字命盤、LINE Flex Message'
  );
}

// ============================================
// 塔羅占卜 - Flex Message
// ============================================
function handleSendTarot(result) {
  const card = result.card;
  const scores = result.scores;
  const date = result.date || new Date().toLocaleDateString('zh-TW');
  
  // 取得牌面圖片
  const cardImage = TAROT_IMAGES[card.name] || DEFAULT_TAROT_IMAGE;
  
  // 建立 Flex Message
  const flexMessage = {
    type: 'flex',
    altText: `🔮 塔羅占卜結果：${card.name}`,
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
      hero: {
        type: 'image',
        url: cardImage,
        size: 'full',
        aspectRatio: '1:1',
        aspectMode: 'fit',
        backgroundColor: '#2d2d44'
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
                text: card.name,
                size: 'xxl',
                weight: 'bold',
                color: '#ffffff',
                align: 'center'
              },
              {
                type: 'text',
                text: card.enName,
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
              createScoreBox('⭐ 整體', scores.overall),
              createScoreBox('💕 愛情', scores.love),
              createScoreBox('💼 事業', scores.career),
              createScoreBox('💰 財運', scores.wealth)
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
            contents: card.keywords.map(k => ({
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
            }))
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
                text: card.meaning,
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
                text: card.advice,
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
  
  const result2 = sendLineFlexMessage(flexMessage);
  return jsonResponse({ success: result2.success });
}

// 建立分數方塊
function createScoreBox(label, score) {
  let color = '#27ae60'; // 綠色 (高)
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
        text: score.toString(),
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
  const bazi = result.bazi;
  const elements = result.elements;
  const dayMaster = result.dayMaster;
  const traits = result.traits;
  const gender = result.gender === 'male' ? '男' : '女';
  
  // 取得日主五行圖片
  const elementImage = ELEMENT_IMAGES[traits.element] || DEFAULT_TAROT_IMAGE;
  
  // 建立 Flex Message
  const flexMessage = {
    type: 'flex',
    altText: `📜 八字命盤分析：${dayMaster}${gender}命`,
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
            text: `日主：${dayMaster} | ${gender}命`,
            color: '#888888',
            size: 'sm',
            margin: 'sm'
          }
        ]
      },
      hero: {
        type: 'image',
        url: elementImage,
        size: 'full',
        aspectRatio: '2:1',
        aspectMode: 'fit',
        backgroundColor: '#2d2d44'
      },
      body: {
        type: 'box',
        layout: 'vertical',
        backgroundColor: '#16213e',
        paddingAll: '20px',
        contents: [
          // 四柱
          {
            type: 'text',
            text: '【 四 柱 八 字 】',
            color: '#d4af37',
            size: 'sm',
            weight: 'bold',
            align: 'center'
          },
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
              createElementBox('🌳木', elements['木']),
              createElementBox('🔥火', elements['火']),
              createElementBox('⛰️土', elements['土']),
              createElementBox('🪙金', elements['金']),
              createElementBox('💧水', elements['水'])
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
                text: `日主「${dayMaster}」屬${traits.element}。${traits.trait}`,
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
                text: `開運顏色：${traits.color}\n有利五行：${traits.lucky}`,
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
  
  const result2 = sendLineFlexMessage(flexMessage);
  return jsonResponse({ success: result2.success });
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
        text: pillar.stem,
        size: 'xl',
        weight: 'bold',
        color: '#e74c3c',
        align: 'center',
        margin: 'sm'
      },
      {
        type: 'text',
        text: pillar.branch,
        size: 'xl',
        weight: 'bold',
        color: '#27ae60',
        align: 'center',
        margin: 'sm'
      },
      {
        type: 'text',
        text: `${pillar.stemElement}/${pillar.branchElement}`,
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
        text: count.toString(),
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
  const url = 'https://api.line.me/v2/bot/message/push';
  
  const payload = {
    to: LINE_USER_ID,
    messages: [flexMessage]
  };
  
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
    const response = UrlFetchApp.fetch(url, options);
    const code = response.getResponseCode();
    
    if (code === 200) {
      console.log('✅ LINE Flex Message 發送成功');
      return { success: true };
    } else {
      console.error('❌ LINE 發送失敗:', response.getContentText());
      return { success: false, error: response.getContentText() };
    }
  } catch (error) {
    console.error('❌ LINE 發送錯誤:', error);
    return { success: false, error: error.message };
  }
}

// 發送純圖片訊息（備用）
function sendLineImage(imageUrl, previewUrl) {
  const url = 'https://api.line.me/v2/bot/message/push';
  
  const payload = {
    to: LINE_USER_ID,
    messages: [{
      type: 'image',
      originalContentUrl: imageUrl,
      previewImageUrl: previewUrl || imageUrl
    }]
  };
  
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
    const response = UrlFetchApp.fetch(url, options);
    return { success: response.getResponseCode() === 200 };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// ============================================
// 測試通知
// ============================================
function handleTestNotify() {
  // 測試 Flex Message
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
      hero: {
        type: 'image',
        url: DEFAULT_TAROT_IMAGE,
        size: 'full',
        aspectRatio: '1:1',
        aspectMode: 'fit',
        backgroundColor: '#2d2d44'
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
            text: '塔羅占卜 & 八字命盤',
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
    message: result.success ? '測試訊息已發送（含圖片）' : result.error 
  });
}

// 手動測試用
function testSendFlexMessage() {
  handleTestNotify();
}

// ============================================
// 工具函數
// ============================================
function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
