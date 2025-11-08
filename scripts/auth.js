// auth.js - demo signup/login stored in localStorage (not secure; demo only)
const USERS_KEY = "mixtas_users_v1";

function getUsers(){ try{ return JSON.parse(localStorage.getItem(USERS_KEY) || "[]"); }catch(e){ return []; } }
function setUsers(list){ try{ localStorage.setItem(USERS_KEY, JSON.stringify(list)); }catch(e){} }
function hash(s){ let h=0; for(let i=0;i<s.length;i++){ h=(h<<5)-h + s.charCodeAt(i); h |= 0;} return String(h); }

const signupForm = document.getElementById("signupForm");
if (signupForm){
  signupForm.addEventListener("submit", (e)=>{
    e.preventDefault();
    const name = document.getElementById("signupName").value.trim();
    const email = document.getElementById("signupEmail").value.trim().toLowerCase();
    const pass = document.getElementById("signupPassword").value;
    const msg = document.getElementById("signupMsg");
    if (!name || !email || pass.length < 6) { msg.textContent = "Provide valid inputs (password ≥6 chars)."; return; }
    const users = getUsers();
    if (users.find(u=>u.email===email)) { msg.textContent = "Email already used."; return; }
    users.push({ name, email, passwordHash: hash(pass) });
    setUsers(users);
    msg.textContent = "Account created — redirecting to login...";
    setTimeout(()=> location.href = "login.html", 900);
  });
}

const loginForm = document.getElementById("loginForm");
if (loginForm){
  loginForm.addEventListener("submit", (e)=>{
    e.preventDefault();
    const email = document.getElementById("loginEmail").value.trim().toLowerCase();
    const pass = document.getElementById("loginPassword").value;
    const msg = document.getElementById("loginMsg");
    const users = getUsers();
    const found = users.find(u => u.email === email && u.passwordHash === hash(pass));
    if (found) {
      localStorage.setItem("mixtas_current_user", JSON.stringify({ name: found.name, email: found.email }));
      msg.textContent = "Login successful — redirecting...";
      setTimeout(()=> location.href = "index.html", 700);
    } else {
      msg.textContent = "Invalid credentials.";
    }
  });
}
