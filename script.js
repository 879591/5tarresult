function openLogin(){
...
}
const SUPABASE_URL = 'https://satumsjfmpbjofhixkdi.supabase.co';
const SUPABASE_KEY = 'sb_publishable_3tW--DUKTpPokk7hSbqbQg_2hoEbANM';

let supabaseClient = null;

async function initSupabase() {
  try {
    const { createClient } =
      await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');

    supabaseClient = createClient(
      SUPABASE_URL,
      SUPABASE_KEY
    );

    console.log('✅ Supabase connected');

    const { data } = await supabaseClient.auth.getSession();

    if (data.session) {
      console.log('✅ User logged in:', data.session.user.email);
    }

  } catch (error) {
    console.error('❌ Supabase connection error:', error);
  }
}

function openLogin() {
  document.getElementById('modal').classList.add('show');
}

function closeLogin() {
  document.getElementById('modal').classList.remove('show');
}

async function demoLogin() {

  const emailInput = document.getElementById('email');
  const msg = document.getElementById('msg');

  const email = emailInput.value.trim();

  if (!email) {
    msg.textContent = '❌ Email डालें';
    return;
  }

  if (!supabaseClient) {
    msg.textContent = '⏳ Supabase connect हो रहा है...';
    await initSupabase();
  }

  try {

    msg.textContent = '⏳ Login link भेजा जा रहा है...';

    const { error } =
      await supabaseClient.auth.signInWithOtp({
        email: email,
        options: {
          emailRedirectTo: window.location.href
        }
      });

    if (error) throw error;

    msg.textContent =
      '✅ Login link आपके email पर भेज दिया गया है।';

  } catch (error) {

    console.error(error);

    msg.textContent =
      '❌ ' + error.message;
  }
}

async function logout() {

  if (!supabaseClient) return;

  await supabaseClient.auth.signOut();

  location.reload();
}

function startQuiz() {

  const q = document.getElementById('quizBox');

  q.innerHTML = `
    <div class="question">

      <b>Q1. भारत का संविधान कब लागू हुआ?</b>

      <button onclick="answer()">
        26 जनवरी 1950
      </button>

      <button onclick="wrong()">
        15 अगस्त 1947
      </button>

      <button onclick="wrong()">
        26 नवंबर 1949
      </button>

      <p id="result"></p>

    </div>
  `;

  q.scrollIntoView({
    behavior: 'smooth'
  });
}

function answer() {

  document.getElementById('result').textContent =
    '✅ सही उत्तर!';
}

function wrong() {

  document.getElementById('result').textContent =
    '❌ गलत उत्तर — सही उत्तर 26 जनवरी 1950 है।';
}

window.addEventListener('load', initSupabase);
