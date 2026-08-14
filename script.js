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

    console.log('✅ 5tarResult: Supabase Connected');

    const { data } = await supabaseClient.auth.getSession();

    if (data.session) {
      console.log('Logged in:', data.session.user.email);
    }

  } catch (error) {
    console.error('Supabase error:', error);
  }
}


// =========================
// LOGIN MODAL
// =========================

function openLogin() {
  const modal = document.getElementById('modal');

  if (modal) {
    modal.classList.add('show');
  }
}

function closeLogin() {
  const modal = document.getElementById('modal');

  if (modal) {
    modal.classList.remove('show');
  }
}


// =========================
// LOGIN WITH EMAIL
// =========================

async function demoLogin() {

  const emailInput = document.getElementById('email');
  const msg = document.getElementById('msg');

  if (!emailInput || !msg) return;

  const email = emailInput.value.trim();

  if (!email) {
    msg.textContent = '❌ अपना email डालें';
    return;
  }

  if (!supabaseClient) {
    msg.textContent = '⏳ Connecting...';
    await initSupabase();
  }

  if (!supabaseClient) {
    msg.textContent = '❌ Supabase connect नहीं हुआ';
    return;
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


// =========================
// LOGOUT
// =========================

async function logout() {

  if (!supabaseClient) return;

  await supabaseClient.auth.signOut();

  location.reload();
}


// =========================
// DEMO QUIZ
// =========================

function startQuiz() {

  const q = document.getElementById('quizBox');

  if (!q) return;

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

  const result = document.getElementById('result');

  if (result) {
    result.textContent = '✅ सही उत्तर!';
  }
}


function wrong() {

  const result = document.getElementById('result');

  if (result) {
    result.textContent =
      '❌ गलत उत्तर — सही उत्तर 26 जनवरी 1950 है।';
  }
}


// =========================
// START
// =========================

window.addEventListener('load', function () {
  initSupabase();
});
