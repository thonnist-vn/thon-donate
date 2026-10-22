(()=>{
const D=window.THON_DATA||{config:{},donations:[]},C=D.config||{},$=s=>document.querySelector(s);
const nf=new Intl.NumberFormat('vi-VN'),vnd=n=>nf.format(n)+'đ',num=v=>Number(String(v).replace(/\D/g,''));
const KEY='thon_pending',TTL=7*864e5;
const rd=()=>{try{return(JSON.parse(localStorage.getItem(KEY))||[]).filter(p=>Date.now()-p.t<TTL)}catch{return[]}};
const wr=a=>{try{localStorage.setItem(KEY,JSON.stringify(a))}catch{}};
const el=(t,c,x)=>{const e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e};
let tt;const toast=(m,bad)=>{const t=$('#toast');t.textContent=m;t.className='toast show'+(bad?' bad':'');clearTimeout(tt);tt=setTimeout(()=>t.className='toast',3500)};

/* giao diện từ cấu hình */
const rs=document.documentElement.style;
if(C.c1)rs.setProperty('--c1',C.c1);if(C.c2)rs.setProperty('--c2',C.c2);
if(C.bg)document.body.style.backgroundImage='linear-gradient(rgba(5,5,10,.8),rgba(5,5,10,.8)),url("'+encodeURI(C.bg)+'")';
if(C.title){document.title=C.title;$('#logoText').textContent=C.title}
if(C.heading)$('#heading').textContent=C.heading;
if(C.intro)$('#intro').textContent=C.intro;
if(C.logo){const i=new Image();i.src=C.logo;i.alt='';i.className='logo-img';i.onerror=()=>i.remove();$('#logo').prepend(i)}

/* mức tiền nhanh */
const amt=$('#amount'),chips=$('#chips'),qa=C.amounts||[];
const sync=()=>chips.querySelectorAll('.chip').forEach((b,i)=>b.classList.toggle('on',num(amt.value)===qa[i]));
qa.forEach(a=>{const b=el('button','chip',vnd(a));b.type='button';b.onclick=()=>{amt.value=nf.format(a);sync()};chips.append(b)});
amt.addEventListener('input',()=>{const n=num(amt.value);amt.value=n?nf.format(n):'';sync()});

/* thống kê và danh sách (chỉ giao dịch đã xác minh trong data.js) */
const ds=[...(D.donations||[])].sort((a,b)=>b.t-a.t);
$('#total').textContent=vnd(ds.reduce((s,d)=>s+d.amount,0));
$('#count').textContent=nf.format(ds.length);
const ul=$('#list');
if(!ds.length)ul.append(el('li','empty','Chưa có lượt ủng hộ nào được xác minh. Hãy là người đầu tiên.'));
ds.slice(0,20).forEach(d=>{
  const li=el('li'),top=el('div','row');
  top.append(el('b','',C.showNames===false||d.hideName?'Ẩn danh':d.name),el('span','amt',vnd(d.amount)));
  li.append(top);
  if(d.msg&&!d.hideMsg)li.append(el('p','m',d.msg));
  li.append(el('small','mut',new Date(d.t).toLocaleDateString('vi-VN')));
  ul.append(li);
});

/* sao chép */
async function copy(txt){
  try{await navigator.clipboard.writeText(txt)}
  catch{const t=el('textarea');t.value=txt;t.style.cssText='position:fixed;opacity:0';document.body.append(t);t.select();let ok=false;try{ok=document.execCommand('copy')}catch{}t.remove();if(!ok)return toast('Không sao chép được, hãy chép thủ công.',1)}
  toast('Đã sao chép');
}
const row=(k,v,cp)=>{const r=el('div','kv');r.append(el('span','mut',k),el('b','',v));if(cp){const b=el('button','mini','Sao chép');b.type='button';b.onclick=()=>copy(cp);r.append(b)}return r};

/* khung thanh toán: chỉ mở sau khi bấm DONATE */
const modal=$('#modal'),box=$('#mbody');
function qrBox(src,alt,failMsg){
  const w=el('div','qr loading'),im=new Image();im.alt=alt;
  im.onload=()=>w.classList.remove('loading');
  im.onerror=()=>{w.className='qr fail';w.textContent=failMsg};
  im.src=src;w.append(im);return w;
}
function openPay(p){
  const mb=p.method==='mb',cfg=(mb?C.mb:C.zalo)||{};
  box.replaceChildren(el('h2','',mb?'Thanh toán qua MB BANK':'Thanh toán qua ZaloPay'),el('p','big',vnd(p.amount)));
  if(mb){
    if(C.showQR!==false){
      const q=new URLSearchParams({amount:p.amount,addInfo:p.code,accountName:cfg.name||''});
      box.append(qrBox('https://img.vietqr.io/image/'+encodeURIComponent(cfg.bank||'MB')+'-'+encodeURIComponent(cfg.account)+'-compact2.png?'+q,'Mã QR chuyển khoản MB Bank','Không tải được mã QR. Hãy chuyển khoản thủ công theo thông tin bên dưới.'));
    }
    box.append(row('Ngân hàng','MB Bank'),row('Số tài khoản',cfg.account,cfg.account),row('Chủ tài khoản',cfg.name||'—'),row('Số tiền',vnd(p.amount),String(p.amount)),row('Nội dung',p.code,p.code));
  }else{
    if(C.showQR!==false&&cfg.qr){
      box.append(qrBox(cfg.qr,'Mã QR ZaloPay','Không tải được mã QR ZaloPay.'),el('p','mut small','Mã QR ZaloPay là mã tĩnh: bạn cần tự nhập số tiền và lời nhắn bên dưới.'));
    }
    box.append(row('Chủ tài khoản',cfg.name||'—'));
    if(cfg.phone)box.append(row('Số điện thoại',cfg.phone,cfg.phone));
    box.append(row('Số tiền',vnd(p.amount),String(p.amount)),row('Lời nhắn chuyển tiền',p.code,p.code));
  }
  box.append(el('p','status','Trạng thái: chờ xác minh. DONATE chỉ hiển thị sau khi chủ website đối chiếu giao dịch.'));
  const ol=el('ol','steps');
  ['Quét mã QR hoặc nhập thông tin ở trên trong ứng dụng của bạn.','Giữ nguyên số tiền và mã trong nội dung chuyển tiền.','Gửi tên và lời nhắn cho chủ website để được ghi nhận đúng.'].forEach(s=>ol.append(el('li','',s)));
  box.append(ol);
  const info=['Mã '+p.code,'Tên: '+p.name,'Số tiền: '+vnd(p.amount)].concat(p.msg?['Lời nhắn: '+p.msg]:[]).join(' | ');
  const act=el('div','acts'),cb=el('button','btn sm','Sao chép thông tin gửi chủ web');cb.type='button';cb.onclick=()=>copy(info);act.append(cb);
  if(/^https?:\/\//.test(C.contact||'')){const a=el('a','btn sm ghost','Mở kênh liên hệ');a.href=C.contact;a.target='_blank';a.rel='noopener';act.append(a)}
  box.append(act);
  modal.hidden=false;
}
const closeModal=()=>{modal.hidden=true};
$('#mclose').onclick=closeModal;
modal.addEventListener('click',e=>{if(e.target===modal)closeModal()});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeModal();$('#thanks').hidden=true}});

/* gửi DONATE: chỉ tạo giao dịch chờ xác minh */
$('#form').addEventListener('submit',e=>{
  e.preventDefault();
  const err=$('#err');err.textContent='';
  const fail=m=>{err.textContent=m;toast(m,1)};
  const name=$('#name').value.trim(),n=num(amt.value),msg=$('#msg').value.trim(),method=document.querySelector('[name=method]:checked').value;
  const ok=method==='mb'?(C.mb||{}).account:((C.zalo||{}).qr||(C.zalo||{}).phone);
  if(!name)return fail('Vui lòng nhập tên người DONATE.');
  if(n<1000||n>5e8)return fail('Số tiền phải từ 1.000đ đến 500.000.000đ.');
  if(!ok)return fail('Phương thức này chưa được cấu hình. Vui lòng chọn phương thức khác.');
  const code='THON'+Array.from(crypto.getRandomValues(new Uint8Array(6)),x=>'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[x%32]).join('');
  const p={code,name,amount:n,msg,method,t:Date.now()};
  wr([...rd(),p]);openPay(p);
});

/* cảm ơn khi giao dịch của thiết bị này đã được xác minh */
const mine=rd(),hit=ds.find(d=>d.code&&mine.some(p=>p.code===d.code));
if(hit){
  wr(mine.filter(p=>p.code!==hit.code));
  $('#tmsg').textContent=(C.showNames===false||hit.hideName?'Bạn':hit.name)+' vừa ủng hộ '+vnd(hit.amount)+'. Giao dịch đã được xác minh.';
  $('#thanks').hidden=false;
}
$('#tclose').onclick=()=>{$('#thanks').hidden=true};
const left=rd();
if(left.length){const last=left[left.length-1];$('#ptxt').textContent='Bạn có '+left.length+' giao dịch đang chờ xác minh (mã '+last.code+').';$('#pview').onclick=()=>openPay(last);$('#pending').hidden=false}
})();
