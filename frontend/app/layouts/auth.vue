<template>
  <div class="auth-page">
    <header class="auth-header">
      <NuxtLink to="/" class="auth-brand" aria-label="กลับหน้าแรก COOS Studio">
        COOS <span>STUDIO</span>
      </NuxtLink>
      <NuxtLink to="/" class="auth-back">
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path stroke-linecap="round" stroke-linejoin="round" d="m14 7-5 5 5 5" /></svg>
        กลับหน้าแรก
      </NuxtLink>
    </header>

    <main class="auth-shell">
      <aside class="auth-story" aria-labelledby="auth-story-title">
        <div>
          <p class="auth-eyebrow">YOUR CREATIVE STUDIO</p>
          <h2 id="auth-story-title">ทุกไอเดียของคุณ<br>เป็นภาพที่<span>โดดเด่นได้</span></h2>
          <p class="auth-story-description">สร้างสรรค์ภาพในสไตล์ของคุณ กับทีมที่ช่วยดูแลตั้งแต่ไอเดียแรกจนถึงผลงานพร้อมใช้</p>
        </div>
        <div class="auth-benefits">
          <div><span aria-hidden="true">01</span><p>เลือกงานที่ใช่<small>ประเภทภาพและแพ็กเกจที่เหมาะกับคุณ</small></p></div>
          <div><span aria-hidden="true">02</span><p>บอกสไตล์ที่ชอบ<small>ส่งรายละเอียดและภาพอ้างอิงได้ในที่เดียว</small></p></div>
          <div><span aria-hidden="true">03</span><p>ติดตามและรับผลงาน<small>ดูความคืบหน้า เลือกภาพ และดาวน์โหลด</small></p></div>
        </div>
        <NuxtLink to="/gallery" class="auth-gallery-link">
          หาแรงบันดาลใจจากผลงานของเรา
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path stroke-linecap="round" stroke-linejoin="round" d="M5 12h14m-5-5 5 5-5 5" /></svg>
        </NuxtLink>
      </aside>
      <slot />
    </main>

    <footer class="auth-footer">
      <p>COOS STUDIO <span>พื้นที่สำหรับทุกไอเดียของคุณ</span></p>
      <nav aria-label="ข้อมูลการใช้บริการ">
        <NuxtLink to="/policy?tab=terms">เงื่อนไขบริการ</NuxtLink>
        <NuxtLink to="/policy?tab=privacy">ความเป็นส่วนตัว</NuxtLink>
      </nav>
    </footer>
  </div>
</template>

<style>
.auth-page {
  min-height: 100vh;
  background: #f5f0e7;
  color: #172c3b;
  padding: 28px 32px;
  display: flex;
  flex-direction: column;
}
.auth-header, .auth-shell, .auth-footer { width: 100%; max-width: 1100px; margin-inline: auto; }
.auth-header { display: flex; align-items: center; justify-content: space-between; gap: 20px; margin-bottom: 32px; }
.auth-brand { font-size: 24px; font-weight: 800; letter-spacing: .24em; line-height: 1; }
.auth-brand span { display: block; margin-top: 8px; font-size: 8px; font-weight: 500; letter-spacing: .46em; }
.auth-back { display: inline-flex; align-items: center; gap: 6px; min-height: 44px; font-size: 13px; color: #52616a; }
.auth-back svg, .auth-gallery-link svg { width: 18px; height: 18px; flex-shrink: 0; }
.auth-shell { display: grid; grid-template-columns: 1fr 1.1fr; flex: 1; border: 1px solid #172c3b1a; border-radius: 20px; overflow: hidden; background: #fcf9f3; box-shadow: 0 18px 60px #172c3b08; }
.auth-story { padding: 48px 40px; background: #172c3b; color: #f5f0e7; display: flex; flex-direction: column; justify-content: center; gap: 42px; min-width: 0; }
.auth-page .auth-eyebrow { font-size: 10px; font-weight: 700; letter-spacing: .2em; color: #a9532c; margin-bottom: 14px; }
.auth-story .auth-eyebrow { color: #ffad80; }
.auth-story h2 { font-size: clamp(30px, 3.2vw, 42px); line-height: 1.5; font-weight: 600; letter-spacing: -.035em; }
.auth-story h2 span { color: #ff955e; }
.auth-story-description { margin-top: 20px; max-width: 340px; font-size: 14px; line-height: 1.9; color: #c7d2d7; }
.auth-benefits { display: grid; gap: 22px; }
.auth-benefits > div { display: flex; align-items: flex-start; gap: 16px; }
.auth-benefits > div > span { display: grid; place-items: center; width: 34px; height: 34px; flex-shrink: 0; border: 1px solid #ffffff26; background: #244050; border-radius: 9px; color: #ffad80; font-size: 11px; }
.auth-benefits p { font-size: 14px; font-weight: 600; }
.auth-benefits small { display: block; color: #c7d2d7; font-size: 12px; font-weight: 400; line-height: 1.8; margin-top: 3px; }
.auth-gallery-link { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding-top: 24px; border-top: 1px solid #ffffff26; font-size: 12px; color: #f5f0e7; }
.auth-gallery-link:hover { color: #ffad80; }
.auth-page .auth-form-panel { padding: 48px; display: flex; flex-direction: column; justify-content: center; min-width: 0; }
.auth-page .auth-form-header { margin-bottom: 28px; }
.auth-page h1 { font-size: 30px; line-height: 1.5; letter-spacing: -.03em; font-weight: 600; }
.auth-page .auth-form-description { color: #52616a; font-size: 14px; line-height: 1.8; margin-top: 8px; }
.auth-page .auth-form { display: grid; gap: 18px; }
.auth-page .auth-name-fields { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.auth-page .auth-field { min-width: 0; }
.auth-page .auth-field label { display: block; margin-bottom: 8px; font-size: 13px; font-weight: 600; }
.auth-page .auth-field input { width: 100%; min-width: 0; min-height: 48px; border: 1px solid #172c3b29; border-radius: 8px; background: #f5f0e7; color: #172c3b; padding: 12px 14px; font-size: 16px; transition: border-color .15s, background .15s; }
.auth-page .auth-field input::placeholder { color: #69777f; font-size: 14px; }
.auth-page .auth-field input:focus { border-color: #b96a3c; background: #fffdf8; }
.auth-page .auth-error { border: 1px solid #e6b9ad; border-radius: 8px; padding: 12px 14px; background: #fbece7; color: #9e3025; font-size: 13px; line-height: 1.7; overflow-wrap: anywhere; }
.auth-page .auth-submit { width: 100%; min-height: 50px; margin-top: 4px; display: flex; align-items: center; justify-content: center; border-radius: 8px; background: #ff955e; color: #172c3b; font-size: 15px; font-weight: 700; transition: background .15s; }
.auth-page .auth-submit:hover:not(:disabled) { background: #ffad80; }
.auth-page .auth-submit:disabled { cursor: wait; background: #e3c8b5; color: #52616a; }
.auth-page .auth-switch { border-top: 1px solid #172c3b1a; padding-top: 24px; margin-top: 28px; font-size: 13px; color: #52616a; text-align: center; line-height: 1.9; }
.auth-page .auth-switch a { color: #172c3b; font-weight: 700; text-decoration: underline; text-underline-offset: 4px; margin-left: 5px; }
.auth-page :is(a, button, input):focus-visible { outline: 3px solid #c56a35; outline-offset: 3px; }
.auth-footer { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px; padding-top: 24px; font-size: 11px; color: #52616a; }
.auth-footer p { letter-spacing: .08em; }
.auth-footer p span { margin-left: 12px; letter-spacing: 0; }
.auth-footer nav { display: flex; flex-wrap: wrap; gap: 20px; }
.auth-footer a:hover, .auth-back:hover, .auth-page .auth-switch a:hover { color: #8a492d; }
@media (min-width: 1024px) { .auth-shell { flex: 0 0 auto; margin-block: auto; min-height: 650px; } }
@media (max-width: 900px) { .auth-story { padding: 36px 28px; } .auth-page .auth-form-panel { padding: 36px 28px; } }
@media (max-width: 767px) {
  .auth-page { padding: 20px 16px 24px; }
  .auth-header { margin-bottom: 20px; }
  .auth-shell { display: flex; flex-direction: column; border-radius: 14px; }
  .auth-story { padding: 24px; gap: 0; }
  .auth-story h2 { font-size: 27px; }
  .auth-story .auth-eyebrow { margin-bottom: 10px; }
  .auth-story-description, .auth-benefits, .auth-gallery-link { display: none; }
  .auth-page .auth-form-panel { padding: 28px 24px; }
  .auth-page h1 { font-size: 26px; }
  .auth-page .auth-name-fields { grid-template-columns: 1fr; gap: 18px; }
  .auth-footer { align-items: flex-start; flex-direction: column; font-size: 10px; }
  .auth-footer p span { display: block; margin: 5px 0 0; }
}
@media (prefers-reduced-motion: reduce) { .auth-page *, .auth-page *::before, .auth-page *::after { transition: none !important; animation: none !important; } }
</style>
