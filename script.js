function openLogin(){
  document.getElementById('modal').classList.add('show');
}

function closeLogin(){
  document.getElementById('modal').classList.remove('show');
}

function demoLogin(){
  const email = document.getElementById('email').value;
  document.getElementById('msg').textContent =
    email ? 'Demo login ready. Supabase Auth अगला step है.' : 'Email डालें.';
}

function startQuiz(){
  const q = document.getElementById('quizBox');

  q.innerHTML = `
    <div class="question">
      <b>Q1. भारत का संविधान कब लागू हुआ?</b>
      <button onclick="answer()">26 जनवरी 1950</button>
      <button onclick="wrong()">15 अगस्त 1947</button>
      <button onclick="wrong()">26 नवंबर 1949</button>
      <p id="result"></p>
    </div>
  `;

  q.scrollIntoView({behavior:'smooth'});
}

function answer(){
  document.getElementById('result').textContent = '✅ सही उत्तर!';
}

function wrong(){
  document.getElementById('result').textContent =
    '❌ गलत उत्तर — सही उत्तर 26 जनवरी 1950 है।';
}
