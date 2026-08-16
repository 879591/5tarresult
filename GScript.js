/* =========================================================
   5tarResult - Supabase Authentication
   Founder & Creator: Suraj Maurya
   ========================================================= */

const SUPABASE_URL = "https://satumsjfmpbjofhixkdi.supabase.co";

/*
  IMPORTANT:
  यहाँ Supabase Dashboard → Settings → API में मिलने वाली
  Publishable key / anon public key डालें.
*/
const SUPABASE_ANON_KEY = "YOUR_SUPABASE_ANON_KEY";

let supabaseClient = null;
let pendingAction = null;

/* ---------- Supabase ---------- */

function initSupabase() {
  if (
    typeof window.supabase === "undefined" ||
    typeof window.supabase.createClient !== "function"
  ) {
    console.error("Supabase library not loaded.");
    return false;
  }

  if (!SUPABASE_ANON_KEY || SUPABASE_ANON_KEY === "YOUR_SUPABASE_ANON_KEY") {
    console.error("Supabase anon/publishable key is missing.");
    return false;
  }

  supabaseClient = window.supabase.createClient(
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

  return true;
}

/* ---------- UI helpers ---------- */

function setAuthMessage(message, type = "") {
  const ids = ["authMsg", "modalMsg"];

  ids.forEach((id) => {
    const el = document.getElementById(id);
    if (el) {
      el.textContent = message;
      el.className = "auth-msg " + type;
    }
  });
}

function showToast(message) {
  const toast = document.getElementById("toast");

  if (!toast) {
    alert(message);
    return;
  }

  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(window.toastTimer);

  window.toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 3500);
}

/* ---------- Login Modal ---------- */

function openLogin(mode = "login") {
  const modal = document.getElementById("modal");

  if (modal) {
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
  }

  if (mode === "signup") {
    showSignupModal();
  } else {
    showLoginModal();
  }
}

function closeLogin() {
  const modal = document.getElementById("modal");

  if (modal) {
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
  }

  setAuthMessage("");
}

function showLoginModal() {
  const login = document.getElementById("modalLogin");
  const signup = document.getElementById("modalSignup");

  if (login) login.classList.remove("hidden");
  if (signup) signup.classList.add("hidden");
}

function showSignupModal() {
  const login = document.getElementById("modalLogin");
  const signup = document.getElementById("modalSignup");

  if (login) login.classList.add("hidden");
  if (signup) signup.classList.remove("hidden");
}

function switchAuth(mode) {
  const loginPanel = document.getElementById("loginPanel");
  const signupPanel = document.getElementById("signupPanel");
  const phonePanel = document.getElementById("phonePanel");

  if (loginPanel) loginPanel.classList.add("hidden");
  if (signupPanel) signupPanel.classList.add("hidden");
  if (phonePanel) phonePanel.classList.add("hidden");

  if (mode === "signup" && signupPanel) {
    signupPanel.classList.remove("hidden");
  } else if (mode === "phone" && phonePanel) {
    phonePanel.classList.remove("hidden");
  } else if (loginPanel) {
    loginPanel.classList.remove("hidden");
  }
}

function togglePassword(id) {
  const input = document.getElementById(id);

  if (!input) return;

  input.type = input.type === "password" ? "text" : "password";
}

/* ---------- Email Login ---------- */

async function emailLogin(source = "main") {
  if (!supabaseClient) {
    setAuthMessage("Supabase connection अभी तैयार नहीं है।", "error");
    return;
  }

  const email =
    source === "modal"
      ? document.getElementById("modalEmail")?.value.trim()
      : document.getElementById("loginEmail")?.value.trim();

  const password =
    source === "modal"
      ? document.getElementById("modalPassword")?.value
      : document.getElementById("loginPassword")?.value;

  if (!email || !password) {
    setAuthMessage("Email और Password दोनों भरें।", "error");
    return;
  }

  setAuthMessage("Login हो रहा है...");

  try {
    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;

    setAuthMessage("Login सफल रहा! 🎉", "success");
    showToast("Welcome to 5tarResult 🎉");

    setTimeout(() => {
      closeLogin();
      updateUserUI(data.user);
    }, 800);
  } catch (error) {
    console.error(error);

    let message = error.message || "Login failed.";

    if (message.toLowerCase().includes("invalid login")) {
      message = "Email या Password गलत है।";
    }

    setAuthMessage(message, "error");
  }
}

/* ---------- Email Signup ---------- */

async function emailSignup(source = "main") {
  if (!supabaseClient) {
    setAuthMessage("Supabase connection अभी तैयार नहीं है।", "error");
    return;
  }

  let name;
  let email;
  let password;
  let confirmPassword;
  let dob;
  let studentClass;
  let qualification;

  if (source === "modal") {
    name = document.getElementById("modalName")?.value.trim();
    email = document.getElementById("modalSignupEmail")?.value.trim();
    password = document.getElementById("modalSignupPassword")?.value;
    confirmPassword = document.getElementById("modalSignupConfirm")?.value;
    dob = document.getElementById("modalDob")?.value;
    studentClass = document.getElementById("modalClass")?.value;
    qualification = document.getElementById("modalQualification")?.value;
  } else {
    name = document.getElementById("signupName")?.value.trim();
    email = document.getElementById("signupEmail")?.value.trim();
    password = document.getElementById("signupPassword")?.value;
    confirmPassword = document.getElementById("signupConfirm")?.value;
    dob = document.getElementById("signupDob")?.value;
    studentClass = document.getElementById("signupClass")?.value;
    qualification = document.getElementById("signupQualification")?.value;
  }

  if (!name || !email || !password || !confirmPassword) {
    setAuthMessage("Name, Email और Password भरना जरूरी है।", "error");
    return;
  }

  if (password !== confirmPassword) {
    setAuthMessage("Password और Confirm Password समान नहीं हैं।", "error");
    return;
  }

  if (password.length < 6) {
    setAuthMessage("Password कम से कम 6 characters का होना चाहिए।", "error");
    return;
  }

  setAuthMessage("Account बनाया जा रहा है...");

  try {
    const { data, error } = await supabaseClient.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
          dob: dob || null,
          class: studentClass || null,
          qualification: qualification || null
        }
      }
    });

    if (error) throw error;

    if (data.session) {
      setAuthMessage("Account बन गया! 🎉", "success");
      showToast("5tarResult account तैयार है!");
      updateUserUI(data.user);

      setTimeout(closeLogin, 1000);
    } else {
      setAuthMessage(
        "Account बन गया! 📧 Email में verification link देखें।",
        "success"
      );
    }
  } catch (error) {
    console.error(error);
    setAuthMessage(error.message || "Signup failed.", "error");
  }
}

/* ---------- Forgot Password ---------- */

async function forgotPassword(source = "modal") {
  if (!supabaseClient) {
    setAuthMessage("Supabase connection तैयार नहीं है।", "error");
    return;
  }

  const email =
    source === "modal"
      ? document.getElementById("modalEmail")?.value.trim()
      : document.getElementById("loginEmail")?.value.trim();

  if (!email) {
    setAuthMessage("पहले अपना Email डालें।", "error");
    return;
  }

  try {
    const redirectUrl = window.location.origin;

    const { error } = await supabaseClient.auth.resetPasswordForEmail(
      email,
      {
        redirectTo: redirectUrl
      }
    );

    if (error) throw error;

    setAuthMessage(
      "Password reset link आपके Email पर भेज दिया गया है। 📧",
      "success"
    );
  } catch (error) {
    console.error(error);
    setAuthMessage(error.message || "Password reset failed.", "error");
  }
}

/* ---------- Google Login ---------- */

async function googleLogin() {
  if (!supabaseClient) {
    showToast("Supabase connection तैयार नहीं है।");
    return;
  }

  try {
    const { error } = await supabaseClient.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin
      }
    });

    if (error) throw error;
  } catch (error) {
    console.error(error);
    showToast(error.message || "Google login failed.");
  }
}

/* ---------- Phone OTP ---------- */

async function sendPhoneOtp() {
  if (!supabaseClient) {
    setAuthMessage("Supabase connection तैयार नहीं है।", "error");
    return;
  }

  const phone = document.getElementById("phoneNumber")?.value.trim();

  if (!phone) {
    setAuthMessage("Mobile number डालें।", "error");
    return;
  }

  try {
    const { error } = await supabaseClient.auth.signInWithOtp({
      phone
    });

    if (error) throw error;

    const otp = document.getElementById("phoneOtp");
    const verify = document.getElementById("verifyOtpBtn");

    if (otp) otp.classList.remove("hidden");
    if (verify) verify.classList.remove("hidden");

    setAuthMessage("OTP भेज दिया गया है। 📱");
  } catch (error) {
    console.error(error);
    setAuthMessage(error.message || "OTP भेजने में समस्या हुई।", "error");
  }
}

async function verifyPhoneOtp() {
  if (!supabaseClient) return;

  const phone = document.getElementById("phoneNumber")?.value.trim();
  const token = document.getElementById("phoneOtp")?.value.trim();

  if (!phone || !token) {
    setAuthMessage("Phone और OTP दोनों भरें।", "error");
    return;
  }

  try {
    const { data, error } = await supabaseClient.auth.verifyOtp({
      phone,
      token,
      type: "sms"
    });

    if (error) throw error;

    setAuthMessage("Phone Login सफल! 🎉", "success");
    updateUserUI(data.user);

    setTimeout(closeLogin, 800);
  } catch (error) {
    console.error(error);
    setAuthMessage(error.message || "OTP verification failed.", "error");
  }
}

/* ---------- Login Required ---------- */

async function requireLogin(action = "continue") {
  if (!supabaseClient) {
    openLogin("login");
    return;
  }

  const {
    data: { session }
  } = await supabaseClient.auth.getSession();

  if (!session) {
    pendingAction = action;
    showToast(`${action} करने के लिए पहले Login करें। 🔐`);
    openLogin("login");
    return;
  }

  showToast(`${action} शुरू किया जा सकता है। 🚀`);
}

/* ---------- User UI ---------- */

function updateUserUI(user) {
  if (!user) return;

  const email = user.email || "";
  const name =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    email.split("@")[0];

  document.querySelectorAll(".login-btn").forEach((button) => {
    button.textContent = name;
  });

  console.log("Logged in user:", {
    id: user.id,
    name,
    email
  });
}

async function loadCurrentUser() {
  if (!supabaseClient) return;

  const {
    data: { session }
  } = await supabaseClient.auth.getSession();

  if (session?.user) {
    updateUserUI(session.user);
  }
}

/* ---------- Logout ---------- */

async function logout() {
  if (!supabaseClient) return;

  const { error } = await supabaseClient.auth.signOut();

  if (error) {
    showToast(error.message);
    return;
  }

  showToast("Logout हो गया।");
  location.reload();
}

/* ---------- Navigation ---------- */

function scrollToSection(id) {
  const section = document.getElementById(id);

  if (section) {
    section.scrollIntoView({
      behavior: "smooth"
    });
  }
}

function toggleMenu() {
  const nav = document.querySelector(".desktop-nav");

  if (nav) {
    nav.classList.toggle("mobile-open");
  }
}

/* ---------- Demo Quiz ---------- */

function startQuiz() {
  requireLogin("Mock Test");
}

/* ---------- DOM Ready ---------- */

document.addEventListener("DOMContentLoaded", () => {
  initSupabase();
  loadCurrentUser();

  /* Close modal by clicking outside */
  const modal = document.getElementById("modal");

  if (modal) {
    modal.addEventListener("click", (event) => {
      if (event.target === modal) {
        closeLogin();
      }
    });
  }

  /* ESC closes modal */
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeLogin();
    }
  });

  /* Auth state listener */
  if (supabaseClient) {
    supabaseClient.auth.onAuthStateChange((event, session) => {
      console.log("Auth event:", event);

      if (session?.user) {
        updateUserUI(session.user);
      }
    });
  }
});

/* ---------- Make functions available to HTML ---------- */

window.openLogin = openLogin;
window.closeLogin = closeLogin;
window.showLoginModal = showLoginModal;
window.showSignupModal = showSignupModal;
window.switchAuth = switchAuth;
window.togglePassword = togglePassword;

window.emailLogin = emailLogin;
window.emailSignup = emailSignup;
window.forgotPassword = forgotPassword;

window.sendPhoneOtp = sendPhoneOtp;
window.verifyPhoneOtp = verifyPhoneOtp;

window.googleLogin = googleLogin;

window.requireLogin = requireLogin;
window.logout = logout;

window.showToast = showToast;
window.scrollToSection = scrollToSection;
window.toggleMenu = toggleMenu;
window.startQuiz = startQuiz;
