// DeepSeek Exporter 智能助手 - 嵌入式浮窗组件（移动优先）
// 用法（放到您网站任意页面 </body> 前）：
//   <script src="https://您的服务器域名/widget.js" data-server="https://您的服务器域名"></script>
// 本地调试时：src="/widget.js"，无需 data-server（同源）
//
// 结构：两个标签页
//   「常见问题」：预留问题手风琴，点击就地展开标准答案（可多条同时展开，不调 API）
//   「AI 助手」 ：自由提问，走后端 + 大模型流式回答
(function () {
  const script = document.currentScript;
  const SERVER = (script && script.getAttribute('data-server')) || '';
  const TITLE = '智能助手';
  const WELCOME = '有什么可以帮您的？直接输入问题即可，我会尽量一步步帮您解决。';

  // ---------- 常见问题（一问一答精确写死，点击展开，不调 API） ----------
  // 文案要求：分步骤大白话、严谨措辞（通常/大部分）、语气委婉官话、不卑微不冷硬；
  // 答案为本站预先写定的静态内容，支持 <a> 链接（防呆：能点就直接给链接）；事实以 knowledge/base.md 同源口径为准
  const PRESET_QA = [
    {
      q: '用户名是什么？需要注册吗？',
      a: '需要注册一个账号，过程很快：\n\n1. 点页面右上角「登录 / 注册」，再点「立即注册」\n2. 填写用户名和邮箱，点「发送验证码」，到邮箱里取验证码填上，再设置一个密码\n3. 注册成功后，您设置的用户名就是账号，以后登录填「用户名 + 密码」这两样即可\n\n请注意：这个账号仅用于本网站，与 DeepSeek 的账号是两个独立体系、不互通，DeepSeek 的账号问题本站无法代为查询或处理。',
    },
    {
      q: '网站收费吗？每天能用几次？',
      a: '登录后每天可免费解析 3 次，第二天次数自动恢复（未用完的次数不累积，每天重置为 3 次）。\n\n如需更多次数，可在站内直接升级：月卡会员 ¥9.9（30 天不限次）、永久会员 ¥29.9，支付宝付款，完成后即时生效。',
    },
    {
      q: '点了「解析」没反应 / 提示要先登录？',
      a: '解析功能需要先登录后使用。看到输入框下方提示“请先登录后再使用解析功能”，点右上角「登录 / 注册」登录后再试即可。\n\n如果当天 3 次已用完，会自动弹出升级窗口，这代表当日次数已使用完毕，属正常提示。',
    },
    {
      q: '页面异常、功能没有响应怎么办？',
      a: '请一步步试下面的方法，大部分情况都能解决：\n\n1. 关掉网页，重新打开再试一次\n\n2. 如果是在微信、QQ 等应用里点开的：这些应用内置的浏览器没有下载功能，导出功能也无法正常使用，请点右上角「…」，选择「在浏览器打开」\n\n3. 手机里没有合适浏览器的，建议到各手机应用商店搜索下载「Chrome」或「Via」（Via 体积很小）；应用商店搜不到时，可 <a href="https://viayoo.com" target="_blank" rel="noopener noreferrer">点此访问 Via 官网</a> 或 <a href="https://www.google.cn/chrome/" target="_blank" rel="noopener noreferrer">点此访问 Chrome 官网</a> 下载。苹果手机使用系统自带的 Safari 即可\n\n4. 还不行可尝试无痕模式：苹果在 Safari 点地址栏左侧图标 →「新私密标签页」，其他浏览器在菜单里找「无痕/隐私模式」，在无痕窗口中重新打开网站\n\n5. 以上都尝试后仍有异常，可回到本页向「AI 助手」描述具体情况，会协助进一步排查',
    },
    {
      q: '收不到注册验证码怎么办？',
      a: '可按以下顺序查看：\n\n1. 打开邮箱的「垃圾邮件 / 订阅邮件」文件夹看看，验证码邮件通常会掉在那里\n2. 确认使用的是 QQ、163、Gmail、Outlook 等常见邮箱，部分小众邮箱可能无法送达\n3. 等待 60 秒后重新点「发送验证码」，再查一次垃圾邮件文件夹',
    },
    {
      q: '这个网站的密码忘了怎么办？',
      a: '在登录页点「忘记密码」，填入注册邮箱，按提示即可自助重置。\n\n如果当前已登录，也可在个人中心「修改密码」直接更换。\n\n另请留意：这是本网站的登录密码，与 DeepSeek 的账号密码是两个独立体系，不互通。',
    },
    {
      q: '能导出哪些格式？选哪个？',
      a: '解析完成后可导出 7 种格式：PDF、Word、图片、HTML、Markdown、TXT、JSON。\n\n· 配合提示词使用 → TXT 或 JSON，JSON 保留的信息更完整\n· 发给人看、打印 → PDF 或 Word\n· 自己保存阅读 → TXT，大部分设备都能直接打开',
    },
    {
      q: '导出的文件去哪里了？找不到怎么办？',
      a: '通常来说，下载的文件会保存在设备的“下载”位置：\n\n· 安卓手机：一般在「文件管理」App 的「下载（Download）」文件夹，不同品牌手机的菜单位置略有差异\n· 苹果手机：在系统自带的「文件」App →「下载项目」\n· 也可以直接在浏览器菜单里点「下载内容 / 下载记录」查看\n\n特别提醒：如果是在微信、QQ 等应用内打开本网页下载的，因这些应用的内置浏览器不提供下载管理，文件很可能无法保存，请 <a href="https://ds.aikeyu.cn" target="_blank" rel="noopener noreferrer">点此在系统浏览器中打开网页</a> 重新导出',
    },
    {
      q: '续写提示词在哪里？',
      a: '点击下面的按钮，直接复制完整提示词，在新开一个 AI 对话时粘贴即可使用：\n\n下一次也可以直接在首页下方的「续写」卡片里复制全文。',
      copy: '你现在需要帮助用户继续上一次对话。用户已经通过文件上传入口上传了上一轮对话的完整记录文件（TXT 或 JSON 文件）请你完整阅读并理解，把它作为上下文，接着在这个新窗口中继续对话。\n\n核心原则：\n1. 文件内容就是上一轮对话记录，对话可能很长，请确保你完整理解对话内容，包括用户的问题、你的回答、用户的补充信息和情绪状态。\n2. 你要将它当作完整的上下文，仔细阅读并理解整个对话上下文、主题、风格和进展，不要遗漏任何细节。\n3. 你需要在新窗口中延续上一轮的逻辑、风格、语气和主题；理解关系背景把握对话中建立的任何关系。\n4. 不要生成摘要，也不要自行删减信息，确保上一轮的细节被完全保留。\n5. 如果存在内容不清楚或存在矛盾，可以提出澄清问题，但不要自行假设重要信息。\n6. 在生成回复时要自然延续，请以“延续上轮对话”方式进行，而不是当作新独立会话。',
    },
    {
      q: '我的个人信息安全吗？',
      a: '网站仅收集提供账号服务所必需的信息（用户名和邮箱），导出结果直接保存至您自己的设备。用户数据处理参照《通用数据保护条例》（GDPR）及 AI 行业通行的隐私保护标准执行，请放心使用。',
    },
  ];

  // ---------- 图标：浮球保持首版 emoji；其余用开源图标库 Remix Icon（CDN 加载，不依赖自绘） ----------
  const ICON_CSS = 'https://cdn.jsdelivr.net/npm/remixicon@4.5.0/fonts/remixicon.css';
  const I_FAQ = '<i class="ri-question-line"></i>';
  const I_AI = '<i class="ri-robot-2-line"></i>';
  const I_SEND = '<i class="ri-send-plane-fill"></i>';
  const I_IMG = '<i class="ri-image-add-line"></i>';
  const I_COPY = '<i class="ri-file-copy-line"></i>';

  // ---------- 样式（移动优先） ----------
  const css = `
.dsei-btn{position:fixed;right:16px;bottom:16px;width:52px;height:52px;border-radius:50%;
  background:linear-gradient(135deg,#4d6bfe,#6c4dfe);color:#fff;border:none;cursor:pointer;
  box-shadow:0 6px 24px rgba(77,107,254,.45);z-index:2147483000;font-size:22px;
  display:flex;align-items:center;justify-content:center;transition:transform .2s;-webkit-tap-highlight-color:transparent}
.dsei-btn:active{transform:scale(.92)}
.dsei-panel{position:fixed;right:16px;bottom:80px;width:360px;max-width:calc(100vw - 24px);
  height:520px;max-height:calc(100vh - 100px);background:#fff;border-radius:16px;z-index:2147483000;
  box-shadow:0 12px 48px rgba(0,0,0,.18);display:flex;flex-direction:column;overflow:hidden;
  font-family:-apple-system,BlinkMacSystemFont,"Segoe UI","PingFang SC","Microsoft YaHei",sans-serif;
  opacity:0;transform:translateY(12px) scale(.98);pointer-events:none;transition:all .22s ease}
.dsei-panel.dsei-open{opacity:1;transform:none;pointer-events:auto}
.dsei-head{background:linear-gradient(135deg,#4d6bfe,#6c4dfe);color:#fff;padding:12px 16px 0;flex-shrink:0}
.dsei-head-row{display:flex;align-items:center;justify-content:space-between;font-size:15px}
.dsei-head small{display:block;font-size:11px;opacity:.85;margin-top:2px}
.dsei-close{background:none;border:none;color:#fff;font-size:22px;cursor:pointer;line-height:1;padding:4px 6px}
.dsei-tabs{display:flex;gap:4px;margin-top:10px}
.dsei-tab{flex:1;background:rgba(255,255,255,.16);color:#e5e9ff;border:none;border-radius:10px 10px 0 0;
  padding:9px 0 8px;font-size:13.5px;cursor:pointer;font-family:inherit;
  display:flex;align-items:center;justify-content:center;gap:5px}
.dsei-tab.on{background:#f7f8fa;color:#3b4a8f;font-weight:600}
.dsei-tab i{font-size:15px;opacity:.85}
.dsei-body{flex:1;display:flex;flex-direction:column;overflow:hidden;background:#f7f8fa}
.dsei-view{flex:1;display:none;flex-direction:column;overflow:hidden}
.dsei-view.on{display:flex}
/* 常见问题：手风琴 */
.dsei-qa-list{flex:1;overflow-y:auto;padding:12px 14px;-webkit-overflow-scrolling:touch}
.dsei-qa-item{background:#fff;border:1px solid #e6e9f5;border-radius:12px;margin-bottom:8px;overflow:hidden}
.dsei-qa-q{padding:12px 14px;font-size:13.5px;color:#333;cursor:pointer;display:flex;
  justify-content:space-between;align-items:center;gap:8px;-webkit-tap-highlight-color:transparent}
.dsei-qa-q .ico{color:#4d6bfe;font-size:14px;transition:transform .2s;flex-shrink:0}
.dsei-qa-item.open .dsei-qa-q{color:#4d6bfe;font-weight:600}
.dsei-qa-item.open .ico{transform:rotate(90deg)}
.dsei-qa-a{display:none;font-size:13px;color:#444;line-height:1.75;white-space:pre-wrap;word-break:break-word;
  padding:0 14px 12px;border-top:1px dashed #edf0fa}
.dsei-qa-item.open .dsei-qa-a{display:block}
.dsei-qa-a a{color:#4d6bfe;font-weight:600;text-decoration:underline;-webkit-tap-highlight-color:rgba(77,107,254,.15)}
.dsei-copy{margin-top:10px;background:#4d6bfe;color:#fff;border:none;border-radius:8px;padding:9px 16px;
  font-size:13px;cursor:pointer;font-family:inherit;-webkit-tap-highlight-color:rgba(77,107,254,.2)}
.dsei-copy:active{opacity:.8}
.dsei-copy i{margin-right:6px;font-size:15px}
.dsei-qa-foot{font-size:12px;color:#8b93b8;text-align:center;padding:4px 0 12px}
/* AI 对话 */
.dsei-msgs{flex:1;overflow-y:auto;padding:14px;background:#f7f8fa;-webkit-overflow-scrolling:touch}
.dsei-msg{display:flex;margin-bottom:10px}
.dsei-msg.user{justify-content:flex-end}
.dsei-msg .bubble{max-width:82%;padding:9px 12px;border-radius:12px;font-size:14px;line-height:1.7;
  white-space:pre-wrap;word-break:break-word}
.dsei-msg.bot .bubble{background:#fff;color:#333;border-top-left-radius:4px;box-shadow:0 1px 3px rgba(0,0,0,.06)}
.dsei-msg.user .bubble{background:#4d6bfe;color:#fff;border-top-right-radius:4px}
.dsei-msg .bubble.err{background:#fff1f0;color:#c0392b}
.dsei-msg .bubble .dsei-msg-img{max-width:200px;max-height:240px;border-radius:8px;display:block;margin-bottom:4px}
.dsei-msg .bubble code{background:#eef1fa;border-radius:4px;padding:1px 5px;font-size:12.5px}
.dsei-msg.bot .bubble a{color:#4d6bfe;font-weight:600;text-decoration:underline}
.dsei-preview{display:flex;align-items:center;gap:8px;padding:8px 12px 0;background:#fff}
.dsei-thumb{width:56px;height:56px;object-fit:cover;border-radius:8px;border:1px solid #e6e9f5}
.dsei-rm{border:none;background:#eef1fa;color:#666;width:22px;height:22px;border-radius:50%;cursor:pointer;font-size:14px;line-height:1;padding:0}
.dsei-input{display:flex;padding:10px;gap:8px;border-top:1px solid #eee;background:#fff;flex-shrink:0}
.dsei-attach{width:44px;height:44px;border:1px solid #ddd;border-radius:10px;background:#fff;color:#666;
  cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.dsei-attach i{font-size:20px}
.dsei-attach:disabled{opacity:.5}
.dsei-input textarea{flex:1;resize:none;border:1px solid #ddd;border-radius:10px;padding:9px 11px;
  font-size:15px;height:44px;outline:none;font-family:inherit}
.dsei-input textarea:focus{border-color:#4d6bfe}
.dsei-send{width:44px;height:44px;border:none;border-radius:10px;background:#4d6bfe;color:#fff;
  cursor:pointer;font-size:19px;flex-shrink:0;display:flex;align-items:center;justify-content:center}
.dsei-send:disabled{opacity:.5}
@keyframes dsei-dot{0%,80%,100%{opacity:.2}40%{opacity:1}}
.dsei-typing i{display:inline-block;width:5px;height:5px;margin-right:3px;border-radius:50%;background:#999;
  font-style:normal;animation:dsei-dot 1.2s infinite}
.dsei-typing i:nth-child(2){animation-delay:.2s}.dsei-typing i:nth-child(3){animation-delay:.4s}
/* 手机端：底部抽屉式全宽面板 */
@media (max-width:520px){
  .dsei-panel{left:0;right:0;bottom:0;width:100%;max-width:100%;height:78vh;max-height:78vh;border-radius:18px 18px 0 0}
  .dsei-btn{width:50px;height:50px;bottom:14px;right:14px}
}`;

  // ---------- DOM ----------
  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);
  // Remix Icon 图标库（CDN）：加载失败也不影响文字与布局
  const iconCss = document.createElement('link');
  iconCss.rel = 'stylesheet';
  iconCss.href = ICON_CSS;
  document.head.appendChild(iconCss);

  const btn = el('button', 'dsei-btn', '💬'); // 入口浮球：首版样式，站长钦定不改
  btn.title = TITLE;
  const panel = el('div', 'dsei-panel');
  panel.innerHTML = `
    <div class="dsei-head">
      <div class="dsei-head-row"><div>${TITLE}<small>DeepSeek Exporter · 在线答疑</small></div>
        <button class="dsei-close" title="收起">×</button></div>
      <div class="dsei-tabs">
        <button class="dsei-tab on" data-v="qa">${I_FAQ}<span>常见问题</span></button>
        <button class="dsei-tab" data-v="ai">${I_AI}<span>AI 助手</span></button>
      </div>
    </div>
    <div class="dsei-body">
      <div class="dsei-view on" data-view="qa">
        <div class="dsei-qa-list"></div>
        <div class="dsei-qa-foot">没找到你的问题？切到「AI 助手」直接问 →</div>
      </div>
      <div class="dsei-view" data-view="ai">
        <div class="dsei-msgs"></div>
        <div class="dsei-preview" hidden></div>
        <div class="dsei-input">
          <button class="dsei-attach" title="发送截图">${I_IMG}</button>
          <input type="file" accept="image/*" class="dsei-file" hidden>
          <textarea placeholder="输入问题或发截图，Enter 发送" rows="1"></textarea>
          <button class="dsei-send" title="发送">${I_SEND}</button>
        </div>
      </div>
    </div>`;
  document.body.appendChild(btn);
  document.body.appendChild(panel);

  const qaList = panel.querySelector('.dsei-qa-list');
  const msgs = panel.querySelector('.dsei-msgs');
  const ta = panel.querySelector('textarea');
  const sendBtn = panel.querySelector('.dsei-send');
  let history = [];
  let welcomeShown = false;
  let busy = false;

  // ---------- 渲染常见问题（点击就地展开/收起，支持多条同时展开） ----------
  PRESET_QA.forEach(item => {
    const box = el('div', 'dsei-qa-item');
    const q = el('div', 'dsei-qa-q');
    q.appendChild(el('span', null, item.q));
    q.appendChild(el('span', 'ico', '▸'));
    const a = el('div', 'dsei-qa-a');
    a.innerHTML = item.a; // 安全：a 为本站预先写定的静态文案（非用户输入），故允许 <a> 链接
    if (item.copy) { // 内嵌一键复制（如续写提示词），与首页卡片的复制为同一段文本
      const copyBtn = el('button', 'dsei-copy');
      copyBtn.innerHTML = I_COPY + '<span>复制提示词</span>';
      copyBtn.onclick = () => copyText(item.copy, copyBtn);
      a.appendChild(document.createElement('br'));
      a.appendChild(copyBtn);
    }
    q.onclick = () => box.classList.toggle('open');
    box.appendChild(q);
    box.appendChild(a);
    qaList.appendChild(box);
  });

  // ---------- 标签页切换 ----------
  panel.querySelectorAll('.dsei-tab').forEach(tab => {
    tab.onclick = () => {
      panel.querySelectorAll('.dsei-tab').forEach(t => t.classList.toggle('on', t === tab));
      panel.querySelectorAll('.dsei-view').forEach(v => v.classList.toggle('on', v.dataset.view === tab.dataset.v));
      if (tab.dataset.v === 'ai' && !welcomeShown) {
        welcomeShown = true;
        addMsg('bot', WELCOME);
      }
      if (tab.dataset.v === 'ai') ta.focus();
    };
  });

  // ---------- 打开 / 收起 ----------
  btn.onclick = () => {
    const open = panel.classList.toggle('dsei-open');
    btn.textContent = open ? '×' : '💬';
  };
  panel.querySelector('.dsei-close').onclick = () => btn.onclick();

  // ---------- AI 对话 ----------
  const attachBtn = panel.querySelector('.dsei-attach');
  const fileIn = panel.querySelector('.dsei-file');
  const preview = panel.querySelector('.dsei-preview');
  let pendingImg = null; // 待发送的图片（已压缩的 dataURL）

  attachBtn.onclick = () => fileIn.click();
  fileIn.onchange = async () => {
    const f = fileIn.files && fileIn.files[0];
    fileIn.value = '';
    if (!f || !/^image\//.test(f.type)) return;
    attachBtn.disabled = true;
    try {
      pendingImg = await compressImg(f);
      renderPreview();
    } catch (e) {
      pendingImg = null;
    } finally {
      attachBtn.disabled = false;
      ta.focus();
    }
  };
  function renderPreview() {
    preview.innerHTML = '';
    if (!pendingImg) { preview.hidden = true; return; }
    preview.hidden = false;
    const im = document.createElement('img');
    im.src = pendingImg; im.className = 'dsei-thumb';
    const rm = el('button', 'dsei-rm', '×');
    rm.title = '移除图片';
    rm.onclick = () => { pendingImg = null; renderPreview(); };
    preview.appendChild(im);
    preview.appendChild(rm);
  }
  // 发送前在本地把图压到最长边 1280px 的 JPEG：省流量、传得快、识别也够用
  async function compressImg(file) {
    const dataUrl = await new Promise((ok, no) => {
      const fr = new FileReader();
      fr.onload = () => ok(fr.result); fr.onerror = () => no(new Error('读取失败'));
      fr.readAsDataURL(file);
    });
    const img = await new Promise((ok, no) => {
      const i = new Image();
      i.onload = () => ok(i); i.onerror = () => no(new Error('图片格式不支持'));
      i.src = dataUrl;
    });
    const sc = Math.min(1, 1280 / Math.max(img.width, img.height));
    const cv = document.createElement('canvas');
    cv.width = Math.round(img.width * sc); cv.height = Math.round(img.height * sc);
    cv.getContext('2d').drawImage(img, 0, 0, cv.width, cv.height);
    return cv.toDataURL('image/jpeg', 0.85);
  }

  sendBtn.onclick = submit;
  ta.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(); }
  });

  async function submit() {
    const text = ta.value.trim();
    if ((!text && !pendingImg) || busy) return;
    busy = true;
    sendBtn.disabled = true;
    ta.value = '';
    const img = pendingImg;
    pendingImg = null;
    renderPreview();
    // 若当前在常见问题页，自动切到 AI 页展示对话
    if (!panel.querySelector('.dsei-view[data-view="ai"]').classList.contains('on')) {
      panel.querySelector('.dsei-tab[data-v="ai"]').click();
    }
    addUserMsg(text, img);
    const content = img
      ? [{ type: 'text', text: text || '请看看这张截图' }, { type: 'image_url', image_url: { url: img } }]
      : text;
    history.push({ role: 'user', content });

    const bubble = addMsg('bot', '<span class="dsei-typing"><i></i><i></i><i></i></span>', true);
    let answer = '';
    try {
      const res = await fetch(SERVER + '/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history, page: pageHint() }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || '请求失败（' + res.status + '）');
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = '';
      bubble.textContent = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        let idx;
        while ((idx = buf.indexOf('\n')) >= 0) {
          const line = buf.slice(0, idx).trim();
          buf = buf.slice(idx + 1);
          if (!line.startsWith('data:')) continue;
          try {
            const obj = JSON.parse(line.slice(5));
            if (obj.delta) { answer += obj.delta; bubble.innerHTML = mdRender(answer); msgs.scrollTop = msgs.scrollHeight; }
            if (obj.error) { bubble.classList.add('err'); bubble.textContent = obj.error; }
          } catch { /* skip */ }
        }
      }
      if (!answer && !bubble.classList.contains('err')) bubble.textContent = '（无回复，请重试）';
      if (answer) history.push({ role: 'assistant', content: answer });
    } catch (e) {
      bubble.classList.add('err');
      bubble.textContent = e.message || '网络异常，请稍后重试';
    }
    busy = false;
    sendBtn.disabled = false;
    ta.focus();
  }

  // ---------- 复制工具（ Clipboard API 优先，失败降级 execCommand） ----------
  async function copyText(txt, btn) {
    let ok = false;
    try { await navigator.clipboard.writeText(txt); ok = true; }
    catch {
      try {
        const t = document.createElement('textarea');
        t.value = txt; t.style.position = 'fixed'; t.style.opacity = '0';
        document.body.appendChild(t); t.select();
        ok = document.execCommand('copy');
        document.body.removeChild(t);
      } catch { ok = false; }
    }
    if (btn) {
      btn.textContent = ok ? '已复制，去粘贴吧' : '复制未成功，请长按选中文字手动复制';
      setTimeout(() => { btn.innerHTML = I_COPY + '<span>复制提示词</span>'; }, 2500);
    }
  }

  // ---------- 页面感知（第一档，仅帮助 AI 定位用户在哪一步） ----------
  // 铁律：只报页面标题和路径；带 ? # 的参数一律剥掉（防私密参数外泄）；
  // 绝不采集任何输入框内容、表单值、Cookie——这里没有任何理由碰用户键入的东西。
  function pageHint() {
    const path = (location.pathname || '').replace(/[?#].*$/, '');
    return ((document.title || '') + ' | ' + path).slice(0, 120);
  }

  // ---------- 工具函数 ----------
  // 极简 Markdown 渲染：模型输出常带 **加粗**、`代码`、[文字](链接)。
  // 安全：先整体转义 HTML 再做限量替换；仅用于机器人回答（用户输入走 textContent）
  function mdRender(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/`([^`\n]+)`/g, '<code>$1</code>')
      .replace(/\*\*([^*\n]+)\*\*/g, '<b>$1</b>')
      .replace(/\[([^\]\n]+)\]\((https?:\/\/[^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
  }
  // 用户消息（可带图）：图片用 img 元素展示（src 为自己生成的 dataURL）
  function addUserMsg(text, img) {
    const div = el('div', 'dsei-msg user');
    const b = el('div', 'bubble');
    if (img) {
      const im = document.createElement('img');
      im.src = img; im.className = 'dsei-msg-img';
      b.appendChild(im);
    }
    if (text) b.appendChild(el('div', null, text));
    div.appendChild(b);
    msgs.appendChild(div);
    msgs.scrollTop = msgs.scrollHeight;
    return b;
  }
  function addMsg(role, html, raw) {
    const div = el('div', 'dsei-msg ' + (role === 'user' ? 'user' : 'bot'));
    const b = el('div', 'bubble');
    if (raw) b.innerHTML = html; else b.textContent = html;
    div.appendChild(b);
    msgs.appendChild(div);
    msgs.scrollTop = msgs.scrollHeight;
    return b;
  }
  function el(tag, cls, text) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }
})();
