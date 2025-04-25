// server/services/notificationService.js
const admin = require('firebase-admin');
const serviceAccount = require('../config/firebase-credentials.json');

// Firebase-i inicializasiya et
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

/**
 * FCM vasitəsilə bildiriş göndərir
 * @param {string} token - İstifadəçinin device tokeni
 * @param {string} title - Bildiriş başlığı
 * @param {string} body - Bildiriş mətni
 * @param {Object} data - Əlavə məlumatlar (optional)
 */
const sendNotification = async (token, title, body, data = {}) => {
  try {
    const message = {
      notification: {
        title,
        body
      },
      data,
      token
    };
    
    const response = await admin.messaging().send(message);
    console.log(`Notification sent successfully to ${token}:`, response);
    return response;
  } catch (error) {
    console.error(`Error sending notification to ${token}:`, error);
    throw error;
  }
};

/**
 * Çoxlu istifadəçilərə bildiriş göndərmək üçün
 * @param {Array} tokens - İstifadəçi tokenlərinin siyahısı
 * @param {string} title - Bildiriş başlığı
 * @param {string} body - Bildiriş mətni
 * @param {Object} data - Əlavə məlumatlar (optional)
 */
const sendMulticastNotification = async (tokens, title, body, data = {}) => {
  if (!tokens.length) {
    console.log('No tokens provided for multicast');
    return;
  }

  try {
    const messages = tokens.map((token) => ({
      notification: {
        title,
        body,
      },
      data,
      token,
    }));

    const responses = await Promise.all(
      messages.map((message) => admin.messaging().send(message))
    );

    const successCount = responses.filter((response) => response).length;
    const failureCount = responses.length - successCount;

    console.log(`${successCount} messages were sent successfully`);
    if (failureCount > 0) {
      console.log(`${failureCount} messages failed to send`);
    }

    return { successCount, failureCount };
  } catch (error) {
    console.error('Error sending multicast messages:', error);
    throw error;
  }
};

module.exports = {
  sendNotification,
  sendMulticastNotification
};