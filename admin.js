(()=>{
const $=s=>document.querySelector(s),g=id=>document.getElementById(id);
const el=(t,c,x)=>{const e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e};
const vnd=n=>new Intl.NumberFormat('vi-VN').format(n)+'đ';
const AK='thon_admin',DK='thon_draft',SK='thon_sess';
const ls={get:k=>{try{return JSON.parse(localStorage.getItem(k))}catch{return null}},set:(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v));return true}catch{return false}}};
let tt;const toast=(m,bad)=>{const t=$('#toast');t.textContent=m;t.className='toast show'+(bad?' bad':'');clearTimeout(tt);tt=setTimeout(()=>t.className='toast',3500)};
const b64=u=>btoa(String.fromCharCode(...u)),unb=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));
async function hp(pw,salt){
  const k=await crypto.subtle.importKey('raw',new TextEncoder().encode(pw),'PBKDF2',false,['deriveBits']);
  return b64(new Uint8Array(await crypto.subtle.deriveBits({name:'PBKDF2',salt,iterations:200000,hash:'SHA-256'},k,256)));
}
let S;
const A=ls.get(AK),gate=$('#gate'),app=$('#app'),btnLabel=A?'Đăng nhập':'Tạo mật khẩu';

/* đăng nhập: mật khẩu đặt lần đầu, chỉ lưu bản băm PBKDF2 trên thiết bị này */
g('gt').textContent=A?'Đăng nhập quản trị':'Tạo mật khẩu quản trị';
g('gp').textContent=A?'Nhập mật khẩu quản trị của bạn.':'Lần đầu sử dụng: đặt mật khẩu từ 8 ký tự. Mật khẩu được băm và chỉ lưu trên thiết bị này.';
g('pw2l').hidden=!!A;g('gb').textContent=btnLabel;
if(!(window.crypto&&crypto.subtle)){g('gerr').textContent='Trình duyệt cần kết nối HTTPS để dùng khu vực quản trị.';g('gb').disabled=true}
gate.addEventListener('submit',async e=>{
  e.preventDefault();
  const err=g('gerr'),b=g('gb'),pw=g('pw').value;err.textContent='';b.disabled=true;b.textContent='Đang xử lý...';
  try{
    if(A){if(await hp(pw,unb(A.s))!==A.h)throw Error('Sai mật khẩu.')}
    else{
      if(pw.length<8)throw Error('Mật khẩu cần ít nhất 8 ký tự.');
      if(pw!==g('pw2').value)throw Error('Hai mật khẩu không khớp.');
      const s=crypto.getRandomValues(new Uint8Array(16));
      if(!ls.set(AK,{s:b64(s),h:await hp(pw,s)}))throw Error('Không lưu được mật khẩu trên thiết bị này.');
    }
    sessionStorage.setItem(SK,'1');location.reload();
  }catch(x){err.textContent=x.message;b.disabled=false;b.textContent=btnLabel}
});

/* dữ liệu */
const persist=m=>{if(ls.set(DK,S)){dirty(true);toast(m)}else toast('Không lưu được bản nháp trên thiết bị này.',1)};
const dirty=d=>{g('dirty').textContent=d?'Có thay đổi chưa xuất bản. Tải data.js rồi thay file cũ trong dự án để áp dụng cho khách.':'Chưa có thay đổi so với bản đang chạy.'};
function fill(){
  const c=S.config,mb=c.mb||{},z=c.zalo||{};
  g('title').value=c.title||'';g('heading').value=c.heading||'';g('intro').value=c.intro||'';g('amounts').value=(c.amounts||[]).join(', ');
  g('mbAcc').value=mb.account||'';g('mbName').value=mb.name||'';g('zPhone').value=z.phone||'';g('zName').value=z.name||'';g('zQr').value=z.qr||'';
  g('contact').value=c.contact||'';g('c1').value=c.c1||'#8b5cf6';g('c2').value=c.c2||'#3b82f6';g('bg').value=c.bg||'';g('logo').value=c.logo||'';
  g('showQR').checked=c.showQR!==false;g('showNames').checked=c.showNames!==false;
}
g('cfg').addEventListener('submit',e=>{
  e.preventDefault();
  const er=g('cerr');er.textContent='';
  const bad=m=>{er.textContent=m;toast(m,1)};
  const am=g('amounts').value.split(/[,\s]+/).filter(Boolean).map(Number);
  const acc=g('mbAcc').value.replace(/\s/g,''),ph=g('zPhone').value.replace(/\s/g,''),ct=g('contact').value.trim();
  if(!g('title').value.trim())return bad('Tên website không được để trống.');
  if(!am.length||am.some(n=>!Number.isInteger(n)||n<1000))return bad('Mức tiền nhanh phải là số nguyên từ 1000 trở lên, cách nhau bằng dấu phẩy.');
  if(acc&&!/^\d{6,19}$/.test(acc))return bad('Số tài khoản MB chỉ gồm 6 đến 19 chữ số.');
  if(ph&&!/^\d{9,11}$/.test(ph))return bad('Số điện thoại ZaloPay không hợp lệ.');
  if(ct&&!/^https?:\/\//.test(ct))return bad('Đường dẫn liên hệ phải bắt đầu bằng http:// hoặc https://');
  Object.assign(S.config,{
    title:g('title').value.trim(),heading:g('heading').value.trim(),intro:g('intro').value.trim(),amounts:am,
    showQR:g('showQR').checked,showNames:g('showNames').checked,contact:ct,
    mb:{bank:'MB',account:acc,name:g('mbName').value.trim()},
    zalo:{phone:ph,name:g('zName').value.trim(),qr:g('zQr').value.trim()},
    c1:g('c1').value,c2:g('c2').value,bg:g('bg').value.trim(),logo:g('logo').value.trim()
  });
  persist('Đã lưu cấu hình vào bản nháp.');
});

const btn=(t,f)=>{const b=el('button','mini',t);b.type='button';b.onclick=f;return b};
const save=()=>{persist('Đã cập nhật.');renderRows()};
function renderRows(){
  const tb=g('rows');tb.replaceChildren();
  const ds=S.donations.map((d,i)=>[d,i]).sort((a,b)=>b[0].t-a[0].t);
  if(!ds.length){const r=el('tr'),c=el('td','empty','Chưa có giao dịch nào.');c.colSpan=5;r.append(c);tb.append(r)}
  ds.forEach(([d,i])=>{
    const r=el('tr');
    r.append(el('td','',new Date(d.t).toLocaleString('vi-VN')),el('td','',d.name+(d.code?' ('+d.code+')':'')),el('td','',vnd(d.amount)),el('td','',d.msg||''));
    const a=el('td','act');
    a.append(
      btn(d.hideName?'Hiện tên':'Ẩn tên',()=>{d.hideName=!d.hideName;save()}),
      btn(d.hideMsg?'Hiện lời nhắn':'Ẩn lời nhắn',()=>{d.hideMsg=!d.hideMsg;save()}),
      btn('Xóa',()=>{if(confirm('Xóa giao dịch này?')){S.donations.splice(i,1);save()}})
    );
    r.append(a);tb.append(r);
  });
}
g('add').addEventListener('submit',e=>{
  e.preventDefault();
  const n=Number(g('da').value.replace(/\D/g,'')),name=g('dn').value.trim(),code=g('dc').value.trim().toUpperCase();
  if(!name)return toast('Nhập tên người ủng hộ.',1);
  if(!n||n<1000)return toast('Số tiền phải từ 1.000đ trở lên.',1);
  if(code&&S.donations.some(d=>d.code===code))return toast('Mã giao dịch này đã tồn tại.',1);
  S.donations.push({code,name,amount:n,msg:g('dm').value.trim(),t:Date.now()});
  e.target.reset();save();
});
g('exp').onclick=()=>{
  const blob=new Blob(['window.THON_DATA='+JSON.stringify(S,null,2)+';\n'],{type:'text/javascript'});
  const a=el('a');a.href=URL.createObjectURL(blob);a.download='data.js';document.body.append(a);a.click();a.remove();
  setTimeout(()=>URL.revokeObjectURL(a.href),4000);toast('Đã tạo data.js');
};
g('drop').onclick=()=>{if(confirm('Bỏ bản nháp và quay về dữ liệu đang chạy?')){localStorage.removeItem(DK);start()}};
g('out').onclick=()=>{sessionStorage.removeItem(SK);location.reload()};

function start(){
  gate.hidden=true;app.hidden=false;
  S=ls.get(DK)||JSON.parse(JSON.stringify(window.THON_DATA||{config:{},donations:[]}));
  S.config=S.config||{};S.donations=S.donations||[];
  fill();renderRows();dirty(!!ls.get(DK));
}
if(A&&sessionStorage.getItem(SK)==='1')start();
})();
