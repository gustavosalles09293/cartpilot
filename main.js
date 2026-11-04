import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const { gsap, ScrollTrigger } = window;
gsap.registerPlugin(ScrollTrigger);
const isMobile = () => innerWidth < 960;

/* ---------- rolagem suave ---------- */
let lenis;
if (window.Lenis) {
  lenis = new Lenis({ lerp: 0.09 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add(t => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  document.querySelectorAll('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
    const id = a.getAttribute('href');
    if (id.length > 1 && document.querySelector(id)) { e.preventDefault(); (lenis.start(), lenis).scrollTo(id, { offset: -60 }); }
  }));
}

/* ---------- cabeçalho ---------- */
const header = document.querySelector('.header');
const onScroll = () => header.classList.toggle('is-scrolled', scrollY > 40);
addEventListener('scroll', onScroll, { passive: true }); onScroll();
const burger = document.getElementById('burger'), nav = document.getElementById('nav');
burger.addEventListener('click', () => nav.classList.toggle('is-open'));
nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => nav.classList.remove('is-open')));
document.getElementById('ano').textContent = new Date().getFullYear();

/* ---------- banner ---------- */
gsap.to('.banner__title .line > span', { y: 0, duration: 1.2, ease: 'expo.out', stagger: .12, delay: .2 });
gsap.fromTo('.banner__media img', { scale: 1.25 }, { scale: 1, duration: 2.2, ease: 'expo.out' });
gsap.to('.banner__media img', { yPercent: 18, ease: 'none', scrollTrigger: { trigger: '.banner', start: 'top top', end: 'bottom top', scrub: true } });
gsap.to('.banner__content', { y: -120, opacity: 0, ease: 'none', scrollTrigger: { trigger: '.banner', start: 'top top', end: 'bottom top', scrub: true } });

/* ---------- reveals ---------- */
gsap.utils.toArray('.reveal').forEach(el => {
  gsap.to(el, { opacity: 1, y: 0, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 88%' } });
});

/* ---------- contadores ---------- */
document.querySelectorAll('[data-count]').forEach(el => {
  const end = +el.dataset.count, suf = el.dataset.suffix || (end > 1000 ? '+' : '');
  const o = { v: 0 };
  ScrollTrigger.create({ trigger: el, start: 'top 90%', once: true, onEnter: () =>
    gsap.to(o, { v: end, duration: 2, ease: 'power3.out', onUpdate: () => el.textContent = Math.round(o.v).toLocaleString('pt-BR') + suf }) });
});

/* ---------- galeria horizontal ---------- */
const track = document.querySelector('.hscroll__track');
const hTween = gsap.to(track, {
  x: () => -(track.scrollWidth - innerWidth + innerWidth * 0.08), ease: 'none',
  scrollTrigger: { trigger: '.hscroll', pin: '.hscroll__pin', start: 'top top', end: () => '+=' + track.scrollWidth, scrub: 1, invalidateOnRefresh: true }
});
gsap.utils.toArray('.panel__img img').forEach(img => {
  gsap.fromTo(img, { xPercent: -12 }, { xPercent: 0, ease: 'none', scrollTrigger: { trigger: img.closest('.panel'), containerAnimation: hTween, start: 'left right', end: 'right left', scrub: true } });
});
gsap.utils.toArray('.panel').forEach(p => {
  gsap.fromTo(p, { rotateY: -18, transformPerspective: 1000 }, { rotateY: 0, ease: 'none', scrollTrigger: { trigger: p, containerAnimation: hTween, start: 'left right', end: 'center center', scrub: true } });
});

/* ---------- tilt 3D ---------- */
document.querySelectorAll('.tilt').forEach(el => {
  el.addEventListener('mousemove', e => {
    const r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
    gsap.to(el, { rotateY: x * 14, rotateX: -y * 14, transformPerspective: 900, duration: .5, ease: 'power2.out' });
  });
  el.addEventListener('mouseleave', () => gsap.to(el, { rotateX: 0, rotateY: 0, duration: .8, ease: 'elastic.out(1,.5)' }));
});

/* ================= CENA 3D: SACOLA ================= */
(function bagScene() {
  const canvas = document.getElementById('bag3d');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
  camera.position.set(0, 0, 12.5);

  const coral = new THREE.MeshPhysicalMaterial({ color: 0xff5a3c, roughness: .35, clearcoat: 1, clearcoatRoughness: .2 });
  const cream = new THREE.MeshPhysicalMaterial({ color: 0xfff1e6, roughness: .5, clearcoat: .6 });
  const peach = new THREE.MeshPhysicalMaterial({ color: 0xffb48a, roughness: .25, clearcoat: 1 });
  const dark = new THREE.MeshPhysicalMaterial({ color: 0x2a1610, roughness: .3, clearcoat: 1, metalness: .1 });
  const gold = new THREE.MeshStandardMaterial({ color: 0xffc48a, metalness: 1, roughness: .25 });

  const world = new THREE.Group(); scene.add(world);

  // sacola
  const bag = new THREE.Group();
  const body = new THREE.Mesh(new RoundedBoxGeometry(2.2, 2.6, 1, 6, .14), coral);
  bag.add(body);
  const fold = new THREE.Mesh(new RoundedBoxGeometry(2.24, .28, 1.04, 4, .08), dark);
  fold.position.y = 1.18; bag.add(fold);
  const handleGeo = new THREE.TorusGeometry(.55, .07, 16, 48, Math.PI);
  [-.32, .32].forEach(z => { const h = new THREE.Mesh(handleGeo, dark); h.position.set(0, 1.3, z); bag.add(h); });
  const tag = new THREE.Mesh(new RoundedBoxGeometry(.8, .8, .06, 4, .05), cream);
  tag.position.set(0, -.1, .53); bag.add(tag);
  const tagIcon = new THREE.Mesh(new THREE.TorusGeometry(.2, .05, 12, 32, Math.PI), coral);
  tagIcon.position.set(0, -.05, .57); tagIcon.rotation.z = Math.PI; bag.add(tagIcon);
  world.add(bag);

  // objetos flutuantes
  const floaters = [];
  const add = (mesh, r, y, speed, phase) => { mesh.userData = { r, y, speed, phase }; world.add(mesh); floaters.push(mesh); return mesh; };
  add(new THREE.Mesh(new THREE.SphereGeometry(.38, 48, 48), peach), 2.8, 1.2, .5, 0);
  add(new THREE.Mesh(new RoundedBoxGeometry(.7, .7, .7, 4, .08), cream), 3.1, -1.3, .4, 2);
  add(new THREE.Mesh(new THREE.TorusGeometry(.35, .12, 24, 64), gold), 2.6, -.2, .6, 4);
  add(new THREE.Mesh(new RoundedBoxGeometry(1.1, .7, .05, 4, .06), dark), 3.3, .5, .35, 1);
  add(new THREE.Mesh(new THREE.SphereGeometry(.22, 32, 32), coral), 2.4, 2, .7, 3);
  add(new THREE.Mesh(new THREE.IcosahedronGeometry(.3, 0), peach), 3, -2, .45, 5);
  // presente
  const gift = new THREE.Group();
  gift.add(new THREE.Mesh(new RoundedBoxGeometry(.65, .65, .65, 4, .05), coral));
  const rib1 = new THREE.Mesh(new THREE.BoxGeometry(.67, .67, .12), gold); gift.add(rib1);
  const rib2 = rib1.clone(); rib2.rotation.y = Math.PI / 2; gift.add(rib2);
  add(gift, 2.9, 2.4, .3, 5.5);

  scene.add(new THREE.AmbientLight(0xffffff, .4));
  const key = new THREE.DirectionalLight(0xffe2cc, 2.2); key.position.set(4, 6, 5); scene.add(key);
  const rim = new THREE.DirectionalLight(0xff8a5c, 2); rim.position.set(-5, -2, -3); scene.add(rim);

  // progresso da rolagem
  const state = { p: 0 };
  const steps = document.querySelectorAll('.step'), bar = document.querySelector('.story__progress span');
  ScrollTrigger.create({
    trigger: '.story', start: 'top top', end: 'bottom bottom', scrub: true,
    onUpdate: s => {
      gsap.to(state, { p: s.progress, duration: .6, ease: 'power2.out', overwrite: true });
      const idx = Math.min(2, Math.floor(s.progress * 3));
      steps.forEach((el, i) => el.classList.toggle('is-active', i === idx));
      bar.style.width = (s.progress * 100) + '%';
    }
  });

  const mouse = { x: 0, y: 0 };
  addEventListener('pointermove', e => { mouse.x = e.clientX / innerWidth - .5; mouse.y = e.clientY / innerHeight - .5; });

  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
    if (isMobile()) { world.position.set(0, 1.6, 0); world.scale.setScalar(.62); }
    else { world.position.set(2.6, 0, 0); world.scale.setScalar(1); }
  }
  addEventListener('resize', resize); resize();

  let visible = true;
  new IntersectionObserver(([e]) => visible = e.isIntersecting).observe(canvas);
  const clock = new THREE.Clock();
  (function loop() {
    requestAnimationFrame(loop);
    if (!visible) return;
    const t = clock.getElapsedTime(), p = state.p;
    bag.rotation.y = p * Math.PI * 2.5 + Math.sin(t * .6) * .15 + mouse.x * .4;
    bag.rotation.x = Math.sin(p * Math.PI) * .35 + mouse.y * .2;
    bag.rotation.z = Math.sin(p * Math.PI * 2) * .12;
    bag.position.y = Math.sin(t * 1.2) * .12;
    const s = 1 + Math.sin(p * Math.PI) * .18; bag.scale.setScalar(s);
    floaters.forEach(m => {
      const d = m.userData, a = d.phase + t * d.speed * .5 + p * Math.PI * 2;
      const r = d.r * (1 + p * .25);
      m.position.set(Math.cos(a) * r, d.y + Math.sin(t * d.speed + d.phase) * .25, Math.sin(a) * r * .6);
      m.rotation.x = t * d.speed; m.rotation.y = t * d.speed * 1.3 + p * 4;
    });
    camera.position.x = mouse.x * .6; camera.position.y = -mouse.y * .4;
    camera.lookAt(world.position.x * .35, world.position.y * .3, 0);
    renderer.render(scene, camera);
  })();
})();

/* ================= FORMULÁRIOS ================= */
const phoneMask = v => {
  v = v.replace(/\D/g, '').slice(0, 11);
  if (v.length > 10) return v.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
  if (v.length > 6) return v.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
  if (v.length > 2) return v.replace(/(\d{2})(\d{0,5})/, '($1) $2');
  return v;
};
const tel = document.getElementById('s-tel');
tel.addEventListener('input', () => tel.value = phoneMask(tel.value));

const signup = document.getElementById('signupForm');
signup.addEventListener('submit', e => {
  e.preventDefault();
  const f = signup.elements, err = document.getElementById('signupError');
  signup.querySelectorAll('input').forEach(i => i.classList.remove('is-invalid'));
  const fail = (input, msg) => { input.classList.add('is-invalid'); err.textContent = msg; gsap.fromTo(signup, { x: -8 }, { x: 0, duration: .5, ease: 'elastic.out(1,.3)' }); };
  if (f.nome.value.trim().length < 3) return fail(f.nome, 'Informe seu nome completo.');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.email.value.trim())) return fail(f.email, 'Informe um e-mail válido.');
  if (f.telefone.value.replace(/\D/g, '').length < 10) return fail(f.telefone, 'Informe um telefone válido com DDD.');
  if (f.senha.value.length < 6) return fail(f.senha, 'A senha precisa ter pelo menos 6 caracteres.');
  if (f.senha.value !== f.senha2.value) return fail(f.senha2, 'As senhas não conferem.');
  err.textContent = '';
  const btn = signup.querySelector('button[type=submit]'); btn.disabled = true; btn.textContent = 'Enviando...';
  setTimeout(() => {
    signup.reset();
    signup.querySelector('.form__body').hidden = true;
    signup.querySelector('.form__done').hidden = false;
  }, 1200);
});

/* popup login */
const modal = document.getElementById('loginModal');
const openModal = () => { lenis && lenis.stop(); modal.classList.add('is-open'); modal.setAttribute('aria-hidden', 'false'); setTimeout(() => document.getElementById('l-user').focus(), 300); };
const closeModal = () => { lenis && lenis.start(); modal.classList.remove('is-open'); modal.setAttribute('aria-hidden', 'true'); };
document.querySelectorAll('[data-open-login]').forEach(b => b.addEventListener('click', openModal));
modal.querySelectorAll('[data-close]').forEach(b => b.addEventListener('click', closeModal));
addEventListener('keydown', e => e.key === 'Escape' && closeModal());
const login = document.getElementById('loginForm');
login.addEventListener('submit', e => {
  e.preventDefault();
  const u = document.getElementById('l-user'), p = document.getElementById('l-pass'), err = document.getElementById('loginError');
  if (!u.value.trim() || !p.value) { err.textContent = 'Preencha login e senha.'; return; }
  const btn = login.querySelector('button'); btn.disabled = true; btn.textContent = 'Verificando...'; err.textContent = '';
  setTimeout(() => {
    btn.disabled = false; btn.textContent = 'Entrar'; p.value = '';
    err.textContent = 'Login ou senha incorretos.';
    gsap.fromTo('.modal__box', { x: -10 }, { x: 0, duration: .6, ease: 'elastic.out(1,.3)' });
  }, 1300);
});

addEventListener('load', () => ScrollTrigger.refresh());
