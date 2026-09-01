/* Leylum theme runtime — cards, announcement, clinical tabs, motion. Loaded after app.js. */
(function(){
  var CARDS={"pads": {"pid": 1392994776, "accent": "#279989", "keyIng": "AHA / BHA / PHA · كافيين · خلاصة السنتيلا", "tag": "الأكثر مبيعًا", "icon": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 64 64\"><path fill=\"#389d8e\" d=\"M14.74,38.7c-.26-.13-.6-.2-1.01-.2h-3.82v3.25h3.97c.48,0,.87-.13,1.18-.39.31-.26.46-.67.46-1.23,0-.33-.06-.61-.19-.86-.13-.25-.32-.43-.59-.57Z\"/><path fill=\"#389d8e\" d=\"M14.46,36.4c.24-.13.42-.3.54-.52.12-.22.18-.47.18-.73,0-.51-.14-.89-.41-1.14-.27-.25-.63-.37-1.07-.37h-3.79v2.95h3.67c.35,0,.64-.06.88-.19Z\"/><path fill=\"#389d8e\" d=\"M13.05,21.08c-.06-.18-.13-.38-.2-.59s-.14-.43-.21-.66c-.07-.22-.13-.42-.19-.59h-.09c-.07.23-.16.5-.25.8-.1.3-.19.59-.29.86s-.17.48-.23.63l-1.21,3.25h4.04l-1.2-3.25c-.05-.12-.1-.27-.17-.45Z\"/><path fill=\"#389d8e\" d=\"M32,0C14.33,0,0,14.33,0,32s14.33,32,32,32,32-14.33,32-32S49.67,0,32,0ZM17.36,42.24c-.33.49-.77.85-1.33,1.09-.55.24-1.17.36-1.86.36h-6.53v-11.99h6.53c.64,0,1.21.12,1.72.37.51.24.9.59,1.2,1.03.29.44.44.96.44,1.55,0,.45-.09.87-.26,1.24-.18.37-.41.68-.71.94-.3.25-.63.44-1,.57v.07c.44.09.84.27,1.19.53.35.26.62.6.82,1,.2.4.3.86.3,1.39,0,.75-.16,1.36-.5,1.85ZM16.12,29.25l-.96-2.55h-5.49l-.96,2.55h-2.34l4.66-11.99h2.87l4.68,11.99h-2.46ZM37.86,40.16h-3.19v-8.63h-9.91v8.63h-3.19v-19.53h3.19v8.17h9.91v-8.17h3.19v19.53ZM54.6,35.63h-9.25l-1.74,4.53h-3.28l7.66-19.53h4.07l7.69,19.53h-3.42l-1.74-4.53Z\"/><path fill=\"#389d8e\" d=\"M51.1,26.49c-.11-.3-.23-.64-.36-1-.12-.36-.25-.73-.37-1.1-.12-.37-.23-.71-.33-1.01h-.17c-.12.36-.26.79-.43,1.28-.17.49-.34.97-.5,1.42-.16.46-.3.83-.41,1.11l-2.16,5.73h7.18l-2.19-5.73c-.06-.17-.14-.41-.26-.71Z\"/></svg>", "match": "مسحات"}, "cream": {"pid": 650419715, "accent": "#EAA794", "keyIng": "مركّب PDRN · حمض الهيالورونيك الثلاثي", "tag": "جديد", "icon": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 64 64\"><path fill=\"#eaa794\" d=\"M32,0C14.33,0,0,14.33,0,32s14.33,32,32,32,32-14.33,32-32S49.67,0,32,0ZM30.46,24.97c-1.56.62-2.67,2.13-2.67,3.91,0,1.53.81,2.86,2.03,3.6.39.23.64.64.64,1.1v1.99c0,.5-.31.94-.76,1.16-1.79.86-3.03,2.69-3.03,4.8v8.59c0,2.14-2.58,3.2-4.09,1.69-5.12-5.1-8.54-13.67-8.54-20.91,0-9.13,5.43-16.83,12.87-19.29,1.74-.58,3.55.7,3.55,2.53v10.82ZM41.42,51.82c-1.51,1.51-4.09.45-4.09-1.69v-8.59c0-2.12-1.24-3.95-3.03-4.8-.45-.22-.76-.66-.76-1.16v-1.99c0-.45.25-.86.64-1.1,1.22-.74,2.03-2.07,2.03-3.6,0-1.78-1.11-3.3-2.67-3.91v-10.82c0-1.84,1.8-3.11,3.55-2.53,7.44,2.46,12.87,10.16,12.87,19.29,0,7.24-3.41,15.82-8.54,20.91Z\"/></svg>", "match": "كريم"}, "bundle": {"pid": 2093703415, "accent": "#7F7B74", "keyIng": "مسحات التقشير اللطيف • كريم الإشراقة الفورية", "tag": "وفّر 20%", "icon": "", "match": "مجموعة"}};
  var REDUCE=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function keyFor(p){
    if(!p) return null;
    var id=String(p.id||'');
    for(var k in CARDS){ if(String(CARDS[k].pid)===id) return k; }
    var n=p.name||'';
    for(var k2 in CARDS){ if(n.indexOf(CARDS[k2].match)>-1) return k2; }
    return null;
  }
  function money(v){ try{ return salla.money(v); }catch(e){ return v; } }
  function esc(s){ return String(s||'').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
  function priceHTML(p){
    if(p.is_on_sale) return money(p.sale_price)+' <s>'+money(p.regular_price)+'</s>';
    return money(p.starting_price||p.price);
  }
  function addBtn(p,cls,style,label){
    return '<salla-add-product-button class="'+cls+'" style="'+style+'" product-id="'+p.id+'" product-status="'+esc(p.status)+'" product-type="'+esc(p.type)+'" width="wide">'+label+'</salla-add-product-button>';
  }

  /* ---- product card (matches the site .pcard) ---- */
  class LeylumProductCard extends HTMLElement{
    connectedCallback(){
      var p=this.product||JSON.parse(this.getAttribute('product')||'{}');
      var k=keyFor(p), c=k?CARDS[k]:null;
      var img=(p.image&&p.image.url)||p.thumbnail||'';
      this.classList.add('pcard'); if(k) this.classList.add('pcard-'+k); this.setAttribute('id','pc-'+p.id);
      this.innerHTML=
        '<div class="hd"><h3><a href="'+esc(p.url)+'">'+esc(p.name)+'</a></h3>'+
          (c&&c.icon?'<div class="badge badge-svg" style="background:none">'+c.icon+'</div>':(c?'<div class="badge" style="background:'+c.accent+'">'+(k==='bundle'?'AHA<br>PDRN':'')+'</div>':''))+'</div><hr>'+
        (c&&c.keyIng?'<div class="row"><span class="lbl">'+(k==='bundle'?'الروتين المتكامل:':'المكونات الأساسية:')+'</span><span class="val">'+esc(c.keyIng)+'</span></div><hr>':'')+
        (c&&c.tag?'<span class="tag">'+esc(c.tag)+'</span>':(p.promotion_title?'<span class="tag">'+esc(p.promotion_title)+'</span>':''))+
        '<a class="shot" href="'+esc(p.url)+'" style="background-image:url(\''+esc(img)+'\')" aria-label="'+esc(p.name)+'"></a>'+
        addBtn(p,'btn btn-block ly-add'+(k?' ly-add-'+k:''),c?('background:'+c.accent+';color:#fff'):'', (p.status==='sale'?'أضف إلى السلة &nbsp;•&nbsp; '+priceHTML(p):esc(p.add_to_cart_label||'غير متوفر')));
    }
  }
  /* ---- bundle hero card (matches the site .bhero) ---- */
  class LeylumBundleCard extends HTMLElement{
    connectedCallback(){
      var p=this.product||JSON.parse(this.getAttribute('product')||'{}');
      var img=(p.image&&p.image.url)||p.thumbnail||'';
      this.innerHTML=
        '<div class="bhero" style="background-image:url(\''+esc(img)+'\')">'+
          '<div class="top"><h3><a href="'+esc(p.url)+'">'+esc(p.name)+'</a></h3>'+(p.discount_percentage?'<span class="save">وفّر '+esc(p.discount_percentage)+'</span>':'<span class="save">وفّر 20%</span>')+'</div>'+
          '<div class="bmid">'+
            '<div class="brow"><span class="k">الروتين المتكامل</span><span class="v">مسحات التقشير اللطيف • كريم الإشراقة الفورية</span></div>'+
            '<div class="brow"><span class="k">المدة</span><span class="v">يكفي شهرين — دقيقتان في اليوم</span></div>'+
            '<div class="brow"><span class="k">الضمان</span><span class="v">إرجاع مجاني إذا لم يناسبك المنتج</span></div></div>'+
          '<div class="cta">'+addBtn(p,'btn btn-frost btn-block','', (p.status==='sale'?'أضف إلى السلة &nbsp;•&nbsp; '+priceHTML(p):esc(p.add_to_cart_label||'غير متوفر')))+'</div>'+
        '</div>';
    }
  }
  if(!customElements.get('leylum-product-card')) customElements.define('leylum-product-card',LeylumProductCard);
  if(!customElements.get('leylum-bundle-card')) customElements.define('leylum-bundle-card',LeylumBundleCard);

  /* ---- rotating announcement ---- */
  function ann(){
    var el=document.getElementById('annTxt'), root=document.getElementById('lyAnn'); if(!el||!root) return;
    var items=[]; try{ items=JSON.parse(root.getAttribute('data-items')||'[]'); }catch(e){}
    items=items.filter(Boolean); if(items.length<2) return;
    var i=0; setInterval(function(){ el.classList.add('out'); setTimeout(function(){ i=(i+1)%items.length; el.textContent=items[i]; el.classList.remove('out'); },460); },4600);
  }
  /* ---- clinical panel tabs ---- */
  function clinical(){
    document.querySelectorAll('.clin-panel[data-ly]').forEach(function(root){
      var data; try{ data=JSON.parse(root.getAttribute('data-ly')); }catch(e){ return; }
      root.querySelectorAll('.tabs button').forEach(function(b){
        b.addEventListener('click',function(){
          var id=b.getAttribute('data-p'), a=data[id]; if(!a) return;
          root.style.setProperty('--clac',a.ac); root.style.setProperty('--clwash',a.wash);
          root.querySelectorAll('.tabs button').forEach(function(x){ x.className=x===b?'on':''; });
          var main=root.querySelector('.circ2 .main'), ins=root.querySelector('.circ2 .ins');
          [main,ins].forEach(function(el){ if(el) el.style.opacity='0'; });
          setTimeout(function(){ if(main) main.src=a.main; if(ins) ins.src=a.ins; [main,ins].forEach(function(el){ if(el) el.style.opacity='1'; }); },260);
          root.querySelectorAll('.stat').forEach(function(el,i){ if(a.stats[i]){ el.querySelector('.n').textContent=a.stats[i][0]; el.querySelector('.t').textContent=a.stats[i][1]; } });
          var note=root.querySelector('.clin-note'); if(note) note.textContent=a.fn;
        });
      });
    });
  }
  /* ---- reveal on scroll, progress hairline, back-to-top ---- */
  function chrome(){
    if(document.getElementById('sprog')) return;
    var sp=document.createElement('div'); sp.className='sprog'; sp.id='sprog'; sp.innerHTML='<i></i>'; document.body.appendChild(sp);
    var tt=document.createElement('button'); tt.className='totop'; tt.id='totop'; tt.setAttribute('aria-label','العودة للأعلى');
    tt.innerHTML='<svg viewBox="0 0 24 24"><path d="M12 19V5M5 12l7-7 7 7"/></svg>';
    tt.onclick=function(){ window.scrollTo({top:0,behavior:REDUCE?'auto':'smooth'}); }; document.body.appendChild(tt);
    var els=[].slice.call(document.querySelectorAll('.pcard, .bhero, .clin-panel, .diff .card, .how .panel, .tband .tcard, .ing .g, .verdict, .spf'));
    els.forEach(function(e){ e.classList.add('rev'); });
    function sweep(){ var vh=window.innerHeight; els=els.filter(function(e){ if(e.getBoundingClientRect().top<vh*.92){ e.classList.add('in'); return false; } return true; }); }
    setInterval(sweep,500); sweep();
    var tick=false;
    window.addEventListener('scroll',function(){ if(tick) return; tick=true; requestAnimationFrame(function(){ tick=false;
      var d=document.documentElement,max=d.scrollHeight-d.clientHeight; sp.firstChild.style.transform='scaleX('+(max>0?(window.scrollY/max):0)+')';
      tt.classList.toggle('show',window.scrollY>900); sweep();
      var inner=document.querySelector('.hero .inner'); if(inner&&!REDUCE){ var y=window.scrollY; if(y<900){ inner.style.transform='translateY('+(y*.16)+'px)'; inner.style.opacity=Math.max(0,1-y/620); } }
    }); },{passive:true});
    /* cards revealed inside lazy lists */
    var mo=new MutationObserver(function(){ document.querySelectorAll('leylum-product-card:not(.rev), leylum-bundle-card .bhero:not(.rev)').forEach(function(e){ e.classList.add('rev'); els.push(e); }); sweep(); });
    mo.observe(document.body,{childList:true,subtree:true});
  }
  /* ---- warm cursor + hover details + hero parallax (desktop, fine pointer only) ---- */
  function cursor(){
    if(REDUCE||!window.matchMedia||!window.matchMedia('(hover:hover) and (pointer:fine)').matches) return;
    var cw=document.createElement('div'); cw.className='curW'; cw.innerHTML='<div class="curR"></div>';
    var cd=document.createElement('div'); cd.className='curD'; document.body.appendChild(cw); document.body.appendChild(cd);
    var mx=innerWidth/2,my=innerHeight/2,rx=mx,ry=my,seen=false,magB=null;
    document.addEventListener('pointermove',function(e){
      mx=e.clientX; my=e.clientY;
      if(!seen){ seen=true; rx=mx; ry=my; cw.classList.add('show'); cd.classList.add('show'); }
      cd.style.transform='translate3d('+mx+'px,'+my+'px,0)';
      var t=e.target&&e.target.closest?e.target.closest('a,button,.pcard,input,select,textarea,[onclick],salla-add-product-button'):null;
      cw.classList.toggle('hov',!!t);
      var b=e.target&&e.target.closest?e.target.closest('.btn,salla-add-product-button'):null;
      if(magB&&magB!==b){ magB.style.transform=''; magB=null; }
      if(b){ var r=b.getBoundingClientRect(); var dx=(e.clientX-(r.left+r.width/2))/r.width, dy=(e.clientY-(r.top+r.height/2))/r.height;
        b.style.transform='translate('+(dx*5)+'px,'+(dy*4)+'px) scale('+(b.classList.contains('ly-add')?1.06:1.04)+')'; magB=b; }
      var h=document.getElementById('hero');
      if(h){ var hr=h.getBoundingClientRect(); if(e.clientY>=hr.top&&e.clientY<=hr.bottom&&e.clientX>=hr.left&&e.clientX<=hr.right){
        var px=((e.clientX-hr.left)/hr.width-.5)*-9, py=((e.clientY-hr.top)/hr.height-.5)*-6;
        h.querySelectorAll('.hslide').forEach(function(s){ s.style.setProperty('--px',px+'px'); s.style.setProperty('--py',py+'px'); }); } }
    },{passive:true});
    document.addEventListener('pointerleave',function(){ cw.classList.remove('show'); cd.classList.remove('show'); seen=false; });
    (function loop(){ rx+=(mx-rx)*.18; ry+=(my-ry)*.18; cw.style.transform='translate3d('+rx+'px,'+ry+'px,0)'; requestAnimationFrame(loop); })();
  }
  function boot(){ ann(); clinical(); chrome(); cursor(); }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot); else boot();
})();
