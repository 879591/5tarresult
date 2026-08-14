# 5tarResult Premium UI
Files:
- index.html
- style.css
- script.js
- logo.svg

This version follows the supplied UI reference: dark navy header, colorful hero, login card, quick categories, dashboard panels, jobs, study material, mock tests, results, AI help and founder credit.

Supabase:
- Uses the publishable key in script.js.
- Email/password login and signup are wired.
- Phone OTP code is included; enable Phone provider + SMS provider in Supabase before using it.
- Public sections remain accessible without login.
- Save Job / Mock Test actions request login.

Important:
For production, add your live Vercel domain under Supabase Authentication > URL Configuration and use HTTPS.
