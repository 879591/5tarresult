/* =========================================================
   5tarResult — UI + Supabase Authentication
   =========================================================
   IMPORTANT:
   नीचे सिर्फ Supabase ANON / PUBLISHABLE KEY डालें.
   कभी भी service_role / secret key यहां मत डालना.
*/

const SUPABASE_URL = "https://satumsjfmpbjofhixkdi.supabase.co";

const SUPABASE_ANON_KEY =
  "PASTE_YOUR_SUPABASE_ANON_OR_PUBLISHABLE_KEY_HERE";

let supabase = null;
let currentUser = null;
let pendingPhone = null;

/* =========================
   Supabase Library
========================= */

function loadSupabase() {
  return new Promise((resolve, reject) => {
    if (window.supabase) {
      resolve(window.supabase);
      return;
    }

    const script = document.createElement("script");

    script.src =
      "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";

    script.onload = () => resolve(window.supabase);

    script.onerror = () =>
      reject(new Error("Supabase library load failed"));

    document.head.appendChild(script);
  });
}

/* =========================
   Initialize Supabase
========================= */

async function initAuth() {
  try {
    if (
      !SUPABASE_ANON_KEY ||
      SUPABASE_ANON_KEY.includes("PASTE_YOUR")
    ) {
      showToast(
        "Supabase ANON / PUBLISHABLE key अभी script.js में डालनी है"
      );
      return;
    }

    const lib = await loadSupabase();

    supabase = lib.createClient(
      SUPABASE_URL,
      SUPABASE_ANON_KEY,
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true
        }
      }
    );

    const { data } =
      await supabase.auth.getSession();

    currentUser =
      data?.session?.user || null;

    updateAuthUI();

    supabase.auth.onAuthStateChange(
      (_event, session) => {
        currentUser =
          session?.user || null;

        updateAuthUI();
      }
    );

  } catch (error) {
    console.error(error);

    showToast(
      "Supabase connection में problem है"
    );
  }
}

/* =========================
   Helper
========================= */

function $(id) {
  return document.getElementById(id);
}

function setMessage(message, type = "") {

  const elements = [
    $("authMsg"),
    $("modalMsg")
  ];

  elements.forEach((el) => {

    if (!el) return;

    el.textContent = message || "";

    el.className =
      "auth-msg" +
      (type ? " " + type : "");
  });
}

/* =========================
   Toast
========================= */

function showToast(message) {

  const toast = $("toast");

  if (!toast) return;

  toast.textContent = message;

  toast.classList.add("show");

  clearTimeout(window.toastTimer);

  window.toastTimer =
    setTimeout(() => {

      toast.classList.remove("show");

    }, 3500);
}

/* =========================
   Login Modal
========================= */

function openLogin(mode = "login") {

  const modal = $("modal");

  if (!modal) return;

  modal.classList.add("open");

  modal.setAttribute(
    "aria-hidden",
    "false"
  );

  if (mode === "signup") {
    showSignupModal();
  } else {
    showLoginModal();
  }

  setMessage("");
}

function closeLogin() {

  const modal = $("modal");

  if (!modal) return;

  modal.classList.remove("open");

  modal.setAttribute(
    "aria-hidden",
    "true"
  );
}

function showLoginModal() {

  $("modalLogin")
    ?.classList.remove("hidden");

  $("modalSignup")
    ?.classList.add("hidden");
}

function showSignupModal() {

  $("modalLogin")
    ?.classList.add("hidden");

  $("modalSignup")
    ?.classList.remove("hidden");
}

/* =========================
   Hero Login / Signup / OTP
========================= */

function switchAuth(mode) {

  const login =
    $("loginPanel");

  const signup =
    $("signupPanel");

  const phone =
    $("phonePanel");

  login?.classList.toggle(
    "hidden",
    mode !== "login"
  );

  signup?.classList.toggle(
    "hidden",
    mode !== "signup"
  );

  phone?.classList.toggle(
    "hidden",
    mode !== "phone"
  );

  document
    .querySelectorAll(".auth-tabs .tab")
    .forEach((tab) => {

      const text =
        tab.textContent
          .trim()
          .toLowerCase();

      const active =
        (mode === "login" &&
          text === "login") ||
        (mode === "signup" &&
          text === "sign up");

      tab.classList.toggle(
        "active",
        active
      );
    });

  setMessage("");
}

/* =========================
   Password
========================= */

function togglePassword(id) {

  const input = $(id);

  if (!input) return;

  input.type =
    input.type === "password"
      ? "text"
      : "password";
}

/* =========================
   Email Login
========================= */

function getLoginCredentials(
  source = "hero"
) {

  if (source === "modal") {

    return {
      email:
        $("modalEmail")
          ?.value.trim(),

      password:
        $("modalPassword")
          ?.value
    };
  }

  return {
    email:
      $("loginEmail")
        ?.value.trim(),

    password:
      $("loginPassword")
        ?.value
  };
}

async function emailLogin(
  source = "hero"
) {

  if (!supabase) {

    showToast(
      "पहले script.js में Supabase key डालो"
    );

    return;
  }

  const {
    email,
    password
  } =
    getLoginCredentials(source);

  if (!email || !password) {

    setMessage(
      "Email और password दोनों भरें",
      "error"
    );

    return;
  }

  setMessage(
    "Login हो रहा है…"
  );

  const {
    data,
    error
  } =
    await supabase.auth.signInWithPassword({
      email,
      password
    });

  if (error) {

    console.error(error);

    setMessage(
      authError(error),
      "error"
    );

    return;
  }

  currentUser = data.user;

  setMessage(
    "Login successful ✅",
    "success"
  );

  showToast(
    "Welcome to 5tarResult 👋"
  );

  closeLogin();

  updateAuthUI();
}

/* =========================
   Email Signup
========================= */

async function emailSignup(
  source = "hero"
) {

  if (!supabase) {

    showToast(
      "पहले Supabase ANON key डालो"
    );

    return;
  }

  let name;
  let email;
  let password;
  let confirm;
  let dob;
  let classValue;
  let qualification;

  if (source === "modal") {

    name =
      $("modalName")
        ?.value.trim();

    email =
      $("modalSignupEmail")
        ?.value.trim();

    password =
      $("modalSignupPassword")
        ?.value;

    confirm =
      $("modalSignupConfirm")
        ?.value;

    dob =
      $("modalDob")
        ?.value;

    classValue =
      $("modalClass")
        ?.value;

    qualification =
      $("modalQualification")
        ?.value;

  } else {

    name =
      $("signupName")
        ?.value.trim();

    email =
      $("signupEmail")
        ?.value.trim();

    password =
      $("signupPassword")
        ?.value;

    confirm =
      $("signupConfirm")
        ?.value;

    dob =
      $("signupDob")
        ?.value;

    classValue =
      $("signupClass")
        ?.value;

    qualification =
      $("signupQualification")
        ?.value;
  }

  if (
    !name ||
    !email ||
    !password ||
    !confirm
  ) {

    setMessage(
      "सभी जरूरी fields भरें",
      "error"
    );

    return;
  }

  if (password.length < 6) {

    setMessage(
      "Password कम से कम 6 characters का रखें",
      "error"
    );

    return;
  }

  if (password !== confirm) {

    setMessage(
      "Password और Confirm Password अलग हैं",
      "error"
    );

    return;
  }

  setMessage(
    "Account बनाया जा रहा है…"
  );

  const {
    data,
    error
  } =
    await supabase.auth.signUp({

      email,
      password,

      options: {

        data: {

          full_name: name,

          date_of_birth:
            dob || null,

          class:
            classValue || null,

          qualification:
            qualification || null
        }
      }
    });

  if (error) {

    console.error(error);

    setMessage(
      authError(error),
      "error"
    );

    return;
  }

  if (data.session) {

    currentUser =
      data.user;

    showToast(
      "Account created successfully 🎉"
    );

    closeLogin();

  } else {

    setMessage(
      "Account बन गया ✅ Gmail में verification email खोलकर confirm करें। फिर Login करें।",
      "success"
    );
  }
}

/* =========================
   Forgot Password
========================= */

async function forgotPassword(
  source = "modal"
) {

  if (!supabase) {

    showToast(
      "पहले Supabase ANON key डालो"
    );

    return;
  }

  const email =
    source === "modal"
      ? $("modalEmail")
          ?.value.trim()
      : $("loginEmail")
          ?.value.trim();

  if (!email) {

    setMessage(
      "पहले अपना email डालें",
      "error"
    );

    return;
  }

  setMessage(
    "Reset email भेजा जा रहा है…"
  );

  const redirectTo =
    window.location.origin +
    window.location.pathname;

  const {
    error
  } =
    await supabase.auth
      .resetPasswordForEmail(
        email,
        {
          redirectTo
        }
      );

  if (error) {

    console.error(error);

    setMessage(
      authError(error),
      "error"
    );

    return;
  }

  setMessage(
    "Password reset link Gmail पर भेज दिया गया ✅",
    "success"
  );
}

/* =========================
   Google Login
========================= */

async function googleLogin() {

  if (!supabase) {

    showToast(
      "पहले Supabase ANON key डालो"
    );

    return;
  }

  const redirectTo =
    window.location.origin +
    window.location.pathname;

  const {
    error
  } =
    await supabase.auth
      .signInWithOAuth({

        provider: "google",

        options: {
          redirectTo
        }
      });

  if (error) {

    console.error(error);

    setMessage(
      authError(error),
      "error"
    );
  }
}

/* =========================
   Phone OTP
========================= */

async function sendPhoneOtp() {

  if (!supabase) {

    showToast(
      "पहले Supabase ANON key डालो"
    );

    return;
  }

  const phone =
    $("phoneNumber")
      ?.value.trim();

  if (!phone) {

    setMessage(
      "Mobile number डालें, जैसे +91XXXXXXXXXX",
      "error"
    );

    return;
  }

  setMessage(
    "OTP भेजा जा रहा है…"
  );

  const {
    error
  } =
    await supabase.auth
      .signInWithOtp({
        phone
      });

  if (error) {

    console.error(error);

    setMessage(
      authError(error),
      "error"
    );

    return;
  }

  pendingPhone = phone;

  $("phoneOtp")
    ?.classList.remove("hidden");

  $("verifyOtpBtn")
    ?.classList.remove("hidden");

  setMessage(
    "OTP भेज दिया गया 📱",
    "success"
  );
}

async function verifyPhoneOtp() {

  if (!supabase ||
      !pendingPhone) {

    return;
  }

  const token =
    $("phoneOtp")
      ?.value.trim();

  if (!token) {

    setMessage(
      "OTP डालें",
      "error"
    );

    return;
  }

  setMessage(
    "OTP verify हो रहा है…"
  );

  const {
    data,
    error
  } =
    await supabase.auth
      .verifyOtp({

        phone:
          pendingPhone,

        token,

        type: "sms"
      });

  if (error) {

    console.error(error);

    setMessage(
      authError(error),
      "error"
    );

    return;
  }

  currentUser =
    data.user;

  showToast(
    "Phone login successful ✅"
  );

  closeLogin();

  updateAuthUI();
}

/* =========================
   Logout
========================= */

async function logout() {

  if (!supabase) return;

  const {
    error
  } =
    await supabase.auth
      .signOut();

  if (error) {

    showToast(
      authError(error)
    );

    return;
  }

  currentUser = null;

  showToast(
    "Logout हो गया"
  );

  updateAuthUI();
}

/* =========================
   Login Required
========================= */

function requireLogin(feature) {

  if (currentUser) {

    showToast(
      feature +
      " खोल रहे हैं…"
    );

    return true;
  }

  openLogin("login");

  setMessage(
    feature +
    " के लिए Login जरूरी है।"
  );

  return false;
}

/* =========================
   Header UI
========================= */

function updateAuthUI() {

  const loginButtons =
    document.querySelectorAll(
      ".login-btn"
    );

  const signupButtons =
    document.querySelectorAll(
      ".signup-btn"
    );

  if (currentUser) {

    loginButtons.forEach(
      (btn) => {

        btn.textContent =
          "Logout";

        btn.onclick =
          logout;
      }
    );

    signupButtons.forEach(
      (btn) => {

        btn.textContent =
          "My Account";

        btn.onclick =
          showUserInfo;
      }
    );

  } else {

    loginButtons.forEach(
      (btn) => {

        btn.textContent =
          "Login";

        btn.onclick =
          () =>
            openLogin("login");
      }
    );

    signupButtons.forEach(
      (btn) => {

        btn.textContent =
          "Sign Up";

        btn.onclick =
          () =>
            openLogin("signup");
      }
    );
  }
}

function showUserInfo() {

  if (!currentUser) {

    openLogin("login");

    return;
  }

  const meta =
    currentUser.user_metadata || {};

  const name =
    meta.full_name ||
    currentUser.email ||
    "Student";

  showToast(
    "👋 " +
    name +
    " • Account Active"
  );
}

/* =========================
   Error Messages
========================= */

function authError(error) {

  const message =
    String(
      error?.message ||
      error ||
      "Unknown error"
    );

  const lower =
    message.toLowerCase();

  if (
    lower.includes(
      "email rate limit"
    )
  ) {

    return (
      "Email rate limit हो गया है। " +
      "थोड़ी देर बाद फिर try करें।"
    );
  }

  if (
    lower.includes(
      "invalid login credentials"
    )
  ) {

    return (
      "Email या password गलत है।"
    );
  }

  if (
    lower.includes(
      "email not confirmed"
    )
  ) {

    return (
      "पहले Gmail में verification email confirm करें।"
    );
  }

  if (
    lower.includes(
      "redirect"
    )
  ) {

    return (
      "Google login Redirect URL Supabase में add करना होगा।"
    );
  }

  if (
    lower.includes(
      "provider is not enabled"
    )
  ) {

    return (
      "Supabase में यह login provider अभी ON नहीं है।"
    );
  }

  if (
    lower.includes("sms") ||
    lower.includes(
      "phone provider"
    )
  ) {

    return (
      "Phone OTP के लिए Supabase में SMS provider configure करना होगा।"
    );
  }

  return message;
}

/* =========================
   Navigation
========================= */

function scrollToSection(id) {

  document
    .getElementById(id)
    ?.scrollIntoView({
      behavior: "smooth"
    });
}

function toggleMenu() {

  document
    .querySelector(
      ".desktop-nav"
    )
    ?.classList.toggle(
      "mobile-open"
    );
}

/* =========================
   Quiz
========================= */

function startQuiz() {

  if (
    !requireLogin(
      "Mock Test"
    )
  ) {

    return;
  }

  showToast(
    "Mock Test module तैयार है 🧠"
  );
}

/* =========================
   Start
========================= */

window.addEventListener(
  "DOMContentLoaded",
  () => {

    initAuth();

    const modal =
      $("modal");

    modal?.addEventListener(
      "click",
      (event) => {

        if (
          event.target === modal
        ) {

          closeLogin();
        }
      }
    );

    document.addEventListener(
      "keydown",
      (event) => {

        if (
          event.key === "Escape"
        ) {

          closeLogin();
        }
      }
    );

    /* Google button */
    const socialButtons =
      document.querySelectorAll(
        ".social-auth button"
      );

    if (socialButtons[0]) {

      socialButtons[0].onclick =
        googleLogin;
    }

    /* Phone button */
    if (socialButtons[1]) {

      socialButtons[1].onclick =
        () =>
          switchAuth("phone");
    }

    /* Third social button */
    if (socialButtons[2]) {

      socialButtons[2].onclick =
        googleLogin;
    }
  }
);

/* =========================
   Make functions available
   to index.html onclick
========================= */

Object.assign(
  window,
  {
    openLogin,
    closeLogin,
    showLoginModal,
    showSignupModal,
    switchAuth,
    togglePassword,
    emailLogin,
    emailSignup,
    forgotPassword,
    googleLogin,
    sendPhoneOtp,
    verifyPhoneOtp,
    logout,
    requireLogin,
    showToast,
    scrollToSection,
    toggleMenu,
    startQuiz
  }
);
