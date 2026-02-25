const axios = require('axios');

async function testAuth() {
  try {
    console.log('=== 测试注册 API ===');
    const registerResponse = await axios.post('http://localhost:4000/api/auth/register', {
      username: 'testuser',
      email: 'test@example.com',
      password: '123456'
    });
    console.log('注册响应:', registerResponse.data);
    
    console.log('\n=== 测试登录 API ===');
    const loginResponse = await axios.post('http://localhost:4000/api/auth/login', {
      email: 'test@example.com',
      password: '123456'
    });
    console.log('登录响应:', loginResponse.data);
    
  } catch (error) {
    console.error('错误:', error.response ? error.response.data : error.message);
  }
}

testAuth();