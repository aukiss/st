部署说明：
1) 推到 GitHub，Netlify → Import from Git
   - Build command：留空
   - Publish directory：public
   - Functions directory：netlify/functions
2) 环境变量（Site settings → Environment variables）：
   - OPENAI_BASE_URL（你的中转地址，例如 https://api.videocaptioner.cn/v1）
   - OPENAI_API_KEY
   - （可选）OPENAI_MODEL=gpt-4o-mini
3) 登录：
   - 老师：17826182908 / mayi223462123
   - 学生：密码=手机号（清单见 netlify/functions/_lib/users_fixed.json）
