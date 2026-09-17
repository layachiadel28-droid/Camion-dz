const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const OpenAI = require('openai');

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.post('/chat', async (req, res) => {
  const message = req.body?.message;

  if (!message || !String(message).trim()) {
    return res.status(400).json({ error: 'الرسالة مطلوبة.' });
  }

  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({ error: 'OPENAI_API_KEY غير موجود. أضفه في ملف .env' });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'أنت مساعد ذكي عربي لصناعة النقل والخدمات اللوجستية. ساعد المستخدم في إدارة الرحلات، متابعة الشاحنات، تنظيم التشغيل، ورفع كفاءة الشركة.',
        },
        {
          role: 'user',
          content: `${message}\n\nالسياق: التطبيق هو "كاميون DZ" لإدارة شاحنات، رحلات، اشتراكات، وتتبع GPS.`,
        },
      ],
      temperature: 0.7,
    });

    const reply = completion.choices?.[0]?.message?.content?.trim() || 'لا يوجد رد.';
    return res.json({ reply });
  } catch (error) {
    console.error('OpenAI error:', error);
    return res.status(500).json({
      error: error?.message || 'حدث خطأ أثناء الاتصال بـ OpenAI.',
    });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
