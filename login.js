export async function checkLogin() {
  const { data } = await window.supabase.auth.getUser();
  if (!data?.user) {
    document.getElementById('login-screen').style.display = 'flex';
  } else {
    document.getElementById('login-screen').style.display = 'none';
    if (typeof initReader === 'function') {
      initReader();
    } else {
      console.warn("⚠️ initReader is not defined yet.");
    }
  }
}

export async function loginWithEmail() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const { error } = await window.supabase.auth.signInWithPassword({ email, password });
  if (error) return alert(error.message);
  location.reload();
}

// Auto-register on load
window.loginWithEmail = loginWithEmail;
window.addEventListener('load', checkLogin);
