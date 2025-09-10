// --- Utiles ---
const uid = () => Math.random().toString(36).slice(2,9);
const el = (sel,root=document)=>root.querySelector(sel);
const els = (sel,root=document)=>[...root.querySelectorAll(sel)];

const Dialog={
  init(){
    this.overlay=el('#dialogOverlay');
    this.message=el('#dialogMessage');
    this.input=el('#dialogInput');
    this.actions=el('#dialogActions');
  },
  alert(msg){
    return new Promise(res=>{
      this.message.textContent=msg;
      this.input.hidden=true;
      this.actions.innerHTML='';
      const ok=document.createElement('button');
      ok.className='btn primary';
      ok.textContent='OK';
      ok.onclick=()=>{ this.overlay.hidden=true; res(); };
      this.actions.appendChild(ok);
      this.overlay.hidden=false;
      ok.focus();
    });
  },
  confirm(msg){
    return new Promise(res=>{
      this.message.textContent=msg;
      this.input.hidden=true;
      this.actions.innerHTML='';
      const cancel=document.createElement('button');
      cancel.className='btn neutral';
      cancel.textContent='Cancelar';
      cancel.onclick=()=>{ this.overlay.hidden=true; res(false); };
      const ok=document.createElement('button');
      ok.className='btn primary';
      ok.textContent='Aceptar';
      ok.onclick=()=>{ this.overlay.hidden=true; res(true); };
      this.actions.append(cancel,ok);
      this.overlay.hidden=false;
      ok.focus();
    });
  },
  prompt(msg,def=''){
    return new Promise(res=>{
      this.message.textContent=msg;
      this.input.hidden=false;
      this.input.value=def;
      this.actions.innerHTML='';
      const cancel=document.createElement('button');
      cancel.className='btn neutral';
      cancel.textContent='Cancelar';
      cancel.onclick=()=>{ this.overlay.hidden=true; res(null); };
      const ok=document.createElement('button');
      ok.className='btn primary';
      ok.textContent='Aceptar';
      ok.onclick=()=>{ const v=this.input.value; this.overlay.hidden=true; res(v); };
      this.actions.append(cancel,ok);
      this.overlay.hidden=false;
      this.input.focus(); this.input.select();
    });
  }
};

Dialog.init();

class SeatingPlanner{
  constructor(){
    this.guests=[]; // {id,name,group,notes,email,phone,company,tableId}
    this.tables=[]; // {id,number,name,cap,guests:[]}
    this.defaultCap=11;
    this.touchDrag=null;

    this.cacheDom();
    this.bindEvents();
    this.restoreAutosave();
    this.measureHeader();
    if(this.tables.length===0){ this.createTables(5,this.defaultCap); } else { this.renderGuests(); this.renderTables(); this.updateStats(); }
  }

  cacheDom(){
    this.csvInput=el('#csvFile');
    this.openGuestModalBtn=el('#openGuestModalBtn');
    this.guestModal=el('#guestModal');
    this.guestModalTitle=el('#guestModalTitle');
    this.guestModalName=el('#guestModalName');
    this.guestModalGroup=el('#guestModalGroup');
    this.guestModalSave=el('#guestModalSave');
    this.guestModalCancel=el('#guestModalCancel');
    this.searchInput=el('#searchInput');
    this.tableCount=el('#tableCount');
    this.defaultCapInput=el('#defaultCap');
    this.addTablesBtn=el('#addTablesBtn');
    this.saveBtn=el('#saveBtn');
    this.loadBtn=el('#loadBtn');
    this.clearLocalBtn=el('#clearLocalBtn');
    this.exportCsvBtn=el('#exportCsvBtn');
    this.printBtn=el('#printBtn');
    this.guestList=el('#guestList');
    this.tablesGrid=el('#tablesGrid');
    this.groupPills=el('#groupPills');
    this.toggleBtn=el('#toggleBtn');
    this.header=el('#appHeader');
    this.stats={ unassigned:el('#unassignedCount'), total:el('#totalCount'), assigned:el('#assignedGuests'), tables:el('#totalTables') };
  }

  bindEvents(){
    this.toggleBtn.addEventListener('click',()=>{ this.header.classList.toggle('collapsed'); this.measureHeader(); });
    window.addEventListener('resize',()=>this.measureHeader());
    document.addEventListener('keydown',e=>{ if((e.ctrlKey||e.metaKey) && e.key.toLowerCase()==='s'){ e.preventDefault(); this.saveArrangement(); } });
    this.csvInput.addEventListener('change', e=>this.handleCSV(e));
    this.openGuestModalBtn.addEventListener('click',()=>this.openGuestModal());
    this.guestModalSave.addEventListener('click',()=>this.saveGuestFromModal());
    this.guestModalCancel.addEventListener('click',()=>this.closeGuestModal());
    this.searchInput.addEventListener('input', ()=>{ this.renderGuests(); });
    this.defaultCapInput.addEventListener('change',()=>{ const v=parseInt(this.defaultCapInput.value)||11; this.defaultCap=v; this.renderTables(); });
    this.addTablesBtn.addEventListener('click',()=>{ const n=parseInt(this.tableCount.value)||1; this.createTables(n,this.defaultCap); });
    this.saveBtn.addEventListener('click',()=>this.saveArrangement());
    this.loadBtn.addEventListener('click',()=>this.loadArrangement());
    this.clearLocalBtn.addEventListener('click',()=>{localStorage.removeItem('seating_autosave');Dialog.alert('Autosave borrado.');});
    this.exportCsvBtn.addEventListener('click',()=>this.exportAssignmentsCsv());
    this.printBtn.addEventListener('click',()=>window.print());

    // Drop a lista para desasignar
    this.guestList.addEventListener('dragover',e=>{ e.preventDefault(); this.guestList.classList.add('guest-drop'); });
    this.guestList.addEventListener('dragleave',()=>{ this.guestList.classList.remove('guest-drop'); });
    this.guestList.addEventListener('drop',e=>{ this.guestList.classList.remove('guest-drop'); const guestId=e.dataTransfer.getData('application/x-guest')||e.dataTransfer.getData('text/plain'); if(guestId) this.unassignById(guestId); });
  }

  openGuestModal(guest=null){
    this.editingGuest=guest;
    this.guestModalTitle.textContent = guest ? 'Editar invitado' : 'Agregar invitado';
    this.guestModalName.value = guest ? guest.name : '';
    this.guestModalGroup.value = guest ? (guest.group||'') : '';
    this.guestModal.hidden=false;
    this.guestModalName.focus();
  }

  closeGuestModal(){
    this.guestModal.hidden=true;
    this.editingGuest=null;
    this.guestModalName.value='';
    this.guestModalGroup.value='';
  }

  saveGuestFromModal(){
    const name=this.guestModalName.value.trim();
    const group=this.guestModalGroup.value.trim();
    if(!name){ Dialog.alert('Nombre requerido'); return; }
    if(this.editingGuest){
      const exists=this.guests.some(g=>g!==this.editingGuest && g.name.toLowerCase()===name.toLowerCase());
      if(exists){ Dialog.alert('Invitado ya existe'); return; }
      this.editingGuest.name=name;
      this.editingGuest.group=group;
      this.rebuildGroupPills(); this.renderGuests(); this.renderTables(); this.updateStats(); this.autosave();
    }else{
      this.addGuest({name, group});
    }
    this.closeGuestModal();
  }

  measureHeader(){
    const h = el('#appHeader').getBoundingClientRect().height;
    document.documentElement.style.setProperty('--headerH', `${Math.round(h)}px`);
  }

  // --- CSV ---
  handleCSV(evt){
    const file=evt.target.files?.[0]; if(!file) return;
    Papa.parse(file,{ header:true,skipEmptyLines:true,
      complete: (res)=>{
        const rows=res.data; let idx=0;
        const guests = rows.map(r=>{
          const name = r.name||r.Name||Object.values(r)[0]||`Invitado ${++idx}`;
          return { id:`g-${uid()}`, name:String(name).trim(), group:(r.group||r.Grupo||'').toString().trim(), notes:(r.notes||r.Notas||'').toString().trim(), email:r.email||r.Email||'', phone:r.phone||r.Phone||'', company:r.company||r.Company||'', tableId:null };
        }).filter(g=>g.name);
        const seen=new Set();
        this.guests = guests.filter(g=>{ const k=(g.name+'|'+(g.email||'')).toLowerCase(); if(seen.has(k)) return false; seen.add(k); return true; });
        this.rebuildGroupPills(); this.renderGuests(); this.updateStats(); this.autosave();
        Dialog.alert(`Importados ${this.guests.length} invitados.`);
      }, error: (err)=>Dialog.alert('Error al leer CSV: '+err.message)
    })
  }

  // --- Invitados manuales ---
  addGuest({name, group='', notes='', email='', phone='', company=''}={}){
    if(!name) return;
    const guest={id:`g-${uid()}`, name:String(name).trim(), group:String(group).trim(), notes:String(notes).trim(), email:email||'', phone:phone||'', company:company||'', tableId:null};
    const exists=this.guests.some(g=> (g.name+'|'+(g.email||'')).toLowerCase()===(guest.name+'|'+(guest.email||'')).toLowerCase());
    if(exists){ Dialog.alert('Invitado ya existe'); return; }
    this.guests.push(guest);
    this.rebuildGroupPills(); this.renderGuests(); this.updateStats(); this.autosave();
  }

  async removeGuest(guestId){
    const idx=this.guests.findIndex(g=>g.id===guestId); if(idx<0) return;
    const g=this.guests[idx];
    const msg = g.tableId ? `${g.name} está asignado a una mesa. ¿Eliminar?` : `¿Eliminar a ${g.name}?`;
    const ok = await Dialog.confirm(msg);
    if(!ok) return;
    if(g.tableId){ const t=this.tables.find(t=>t.id===g.tableId); if(t){ t.guests=t.guests.filter(x=>x.id!==g.id); } }
    this.guests.splice(idx,1);
    this.rebuildGroupPills(); this.renderGuests(); this.renderTables(); this.updateStats(); this.autosave();
  }

  // --- Mesas ---
  createTables(n=1,cap=11){
    const start = this.tables.length+1;
    for(let i=0;i<n;i++){
      this.tables.push({id:`t-${uid()}` ,number:start+i, name:`Mesa ${start+i}`, cap, guests:[]});
    }
    this.renderTables(); this.updateStats(); this.autosave();
  }

  async editCapacity(table){
    const v = await Dialog.prompt('Nueva capacidad para '+(table.name||`Mesa ${table.number}`), table.cap);
    if(v==null) return; const num = Math.max(1, Math.min(50, parseInt(v)||table.cap));
    table.cap=num; this.renderTables(); this.autosave();
  }

  async renameTable(table){
    const current = table.name || `Mesa ${table.number}`;
    const v = await Dialog.prompt('Nuevo nombre para la mesa', current);
    if(v==null) return; const name = String(v).trim();
    if(!name){ Dialog.alert('El nombre no puede estar vacío.'); return; }
    table.name = name; this.renderTables(); this.autosave();
  }

  // --- Render invitados (muestra mesa al buscar) ---
  renderGuests(){
    const term = this.searchInput.value.trim().toLowerCase();
    let list = [];
    if(term){
      list = this.guests.filter(g=> {
        const mesa = g.tableId ? (this.tables.find(t=>t.id===g.tableId)?.name||'') : '';
        return (
          g.name.toLowerCase().includes(term) ||
          (g.group||'').toLowerCase().includes(term) ||
          mesa.toLowerCase().includes(term)
        );
      });
    } else {
      list = this.guests.filter(g=>!g.tableId);
    }

    this.guestList.innerHTML = list.length? '' : `<div class="empty">${term? 'Sin coincidencias' : 'Sin invitados sin asignar'}</div>`;
    for(const g of list){
      const mesa = g.tableId ? (this.tables.find(t=>t.id===g.tableId)?.name || '') : '';
      const item=document.createElement('div'); item.className='guest-item'; item.draggable=true; item.dataset.guestId=g.id;
      const main=document.createElement('div'); main.innerHTML=`<strong>${g.name}</strong>${g.group?`<span class="badge">${g.group}</span>`:''}${mesa?`<span class="badge" style="background:#c6f6d5;border-color:#9ae6b4;color:#22543d">${mesa}</span>`:''}`;
      item.appendChild(main);
      if(g.notes){ const note=document.createElement('div'); note.className='badge'; note.title='Notas'; note.textContent=g.notes; item.appendChild(note); }
      const btn=document.createElement('button'); btn.className='remove'; btn.textContent='×'; btn.title='Eliminar'; btn.addEventListener('click',e=>{ e.stopPropagation(); this.removeGuest(g.id); });
      item.appendChild(btn);
      item.addEventListener('dragstart',e=>{e.dataTransfer.setData('text/plain',g.id); e.dataTransfer.setData('application/x-guest', g.id); item.classList.add('dragging');});
      item.addEventListener('dragend',()=>item.classList.remove('dragging'));
      item.addEventListener('dblclick',()=>this.openGuestModal(g));
      let touchTimer;
      const cancelTouch=()=>{
        clearTimeout(touchTimer);
        if(this.touchDrag && this.touchDrag.el===item){
          this.touchDrag=null;
          item.classList.remove('dragging');
        }
      };
      item.addEventListener('touchstart',()=>{
        touchTimer=setTimeout(()=>{
          this.touchDrag={id:g.id,el:item};
          item.classList.add('dragging');
        },200);
      },{passive:true});
      item.addEventListener('touchmove',()=>{
        if(!this.touchDrag) cancelTouch();
      },{passive:true});
      item.addEventListener('touchend',cancelTouch,{passive:true});
      this.guestList.appendChild(item);
    }

    const unassignedCount=this.guests.filter(g=>!g.tableId).length;
    this.stats.unassigned.textContent = `${unassignedCount} sin asignar`;
    this.stats.total.textContent = `${this.guests.length} total`;
  }

  // --- Render mesas ---
  renderTables(){
    this.tablesGrid.innerHTML='';
    for(const table of this.tables){
      const card=document.createElement('div');card.className='table';card.dataset.tableId=table.id;
      // DnD: huéspedes y reordenamiento de mesas
      card.addEventListener('dragover',e=>{
        if(e.dataTransfer.types.includes('application/x-table')){ e.preventDefault(); card.classList.add('reorder-over'); }
        else { e.preventDefault(); card.classList.add('drag-over'); }
      });
      card.addEventListener('dragleave',()=>{ card.classList.remove('drag-over'); card.classList.remove('reorder-over'); });
      card.addEventListener('drop',e=>{
        card.classList.remove('drag-over'); card.classList.remove('reorder-over');
        if(e.dataTransfer.types.includes('application/x-table')){
          const src=e.dataTransfer.getData('application/x-table'); if(src && src!==table.id) this.reorderTables(src, table.id);
        } else {
          const guestId=e.dataTransfer.getData('application/x-guest') || e.dataTransfer.getData('text/plain'); if(guestId) this.assign(guestId,table.id);
        }
      });
      card.addEventListener('touchend',()=>{ if(this.touchDrag){ this.assign(this.touchDrag.id, table.id); this.touchDrag=null; }});

      const head=document.createElement('div');head.className='table-header';
      const title=document.createElement('div');title.className='table-title';
      const tHandle=document.createElement('span'); tHandle.className='table-handle'; tHandle.textContent='⋮⋮';
      tHandle.draggable=true;
      tHandle.addEventListener('dragstart',(e)=>{ e.dataTransfer.setData('application/x-table', table.id); card.classList.add('dragging'); });
      tHandle.addEventListener('dragend',()=>{ card.classList.remove('dragging'); });
      title.appendChild(tHandle);
      title.appendChild(document.createTextNode(table.name || `Mesa ${table.number}`));
      title.title='Doble click para renombrar';
      title.addEventListener('dblclick',()=>this.renameTable(table));
      const tEdit=document.createElement('button'); tEdit.className='title-edit'; tEdit.title='Renombrar mesa'; tEdit.textContent='✏️'; tEdit.addEventListener('click',()=>this.renameTable(table));

      const actions=document.createElement('div');actions.className='table-actions';
      const cnt=document.createElement('div');cnt.className='table-count'+(table.guests.length>=table.cap?' full':'');cnt.title='Doble click para editar capacidad'; cnt.textContent=`${table.guests.length}/${table.cap}`; cnt.addEventListener('dblclick',()=>this.editCapacity(table));
      const del=document.createElement('button');del.className='table-del';del.title='Eliminar mesa';del.innerHTML='🗑️'; del.addEventListener('click',()=>this.removeTable(table.id));
      actions.appendChild(cnt); actions.appendChild(del);

      head.append(title,tEdit,actions);

      const list=document.createElement('div');
      if(table.guests.length===0){ list.innerHTML='<div class="empty">Soltá invitados aquí</div>'; }
      else{
        for(const g of table.guests){
          const row=document.createElement('div');row.className='table-guest'; row.dataset.guestId=g.id; row.draggable=true;
          const left=document.createElement('span'); left.innerHTML = `<span class=\"drag-handle\">⋮⋮</span>${g.name}${g.group?` <span class=\"chip\" title=\"Etiqueta\">${g.group}</span>`:''}`;
          const btn=document.createElement('button');btn.className='remove';btn.textContent='×';btn.title='Quitar'; btn.addEventListener('click',()=>this.unassign(g.id, table.id));
          row.addEventListener('dragstart',e=>{ e.dataTransfer.setData('text/plain', g.id); e.dataTransfer.setData('application/x-guest', g.id); row.classList.add('dragging'); });
          row.addEventListener('dragend',()=>row.classList.remove('dragging'));
          row.append(left,btn); list.appendChild(row);
        }
      }
      card.append(head,list);
      this.tablesGrid.appendChild(card);
    }
    this.stats.tables.textContent=`Mesas: ${this.tables.length}`;
    this.updateStats();
  }

  // --- Reordenar mesas ---
  reorderTables(sourceId, targetId){
    const srcIdx=this.tables.findIndex(t=>t.id===sourceId);
    const tgtIdx=this.tables.findIndex(t=>t.id===targetId);
    if(srcIdx<0||tgtIdx<0||srcIdx===tgtIdx) return;
    const [moved]=this.tables.splice(srcIdx,1);
    this.tables.splice(tgtIdx,0,moved);
    this.tables.forEach((t,i)=>t.number=i+1);
    this.renderTables(); this.autosave();
  }

  // --- Asignación ---
  assign(guestId, tableId){
    const g=this.guests.find(x=>x.id===guestId); const t=this.tables.find(x=>x.id===tableId);
    if(!g||!t) return; if(t.guests.length>=t.cap){ Dialog.alert('¡Mesa completa!'); return; }
    if(g.tableId){ const from=this.tables.find(x=>x.id===g.tableId); if(from){ from.guests=from.guests.filter(x=>x.id!==g.id); } }
    g.tableId=tableId; t.guests.push(g);
    this.renderGuests(); this.renderTables(); this.updateStats(); this.autosave();
  }

  unassign(guestId, tableId){
    const g=this.guests.find(x=>x.id===guestId); const t=this.tables.find(x=>x.id===tableId);
    if(!g||!t) return; g.tableId=null; t.guests=t.guests.filter(x=>x.id!==guestId);
    this.renderGuests(); this.renderTables(); this.updateStats(); this.autosave();
  }

  unassignById(guestId){
    const g=this.guests.find(x=>x.id===guestId); if(!g||!g.tableId) return;
    const t=this.tables.find(x=>x.id===g.tableId); if(!t) { g.tableId=null; this.renderGuests(); this.renderTables(); this.updateStats(); this.autosave(); return; }
    g.tableId=null; t.guests=t.guests.filter(x=>x.id!==guestId);
    this.renderGuests(); this.renderTables(); this.updateStats(); this.autosave();
  }

  // --- Eliminar mesa ---
  async removeTable(tableId){
    const table=this.tables.find(t=>t.id===tableId); if(!table) return;
    const hasGuests=table.guests && table.guests.length>0;
    const msg = hasGuests ? `La mesa ${table.name||table.number} tiene ${table.guests.length} invitado(s). Se devolverán a \"sin asignar\". ¿Eliminar?` : `¿Eliminar la mesa ${table.name||table.number}?`;
    const ok = await Dialog.confirm(msg);
    if(!ok) return;
    for(const g of (table.guests||[])){
      const realGuest=this.guests.find(x=>x.id===g.id);
      if(realGuest) realGuest.tableId=null;
    }
    this.tables=this.tables.filter(t=>t.id!==tableId);
    this.tables.forEach((t,i)=>t.number=i+1);
    this.renderGuests(); this.renderTables(); this.updateStats(); this.autosave();
  }

  // --- Stats / autosave ---
  updateStats(){ const assigned=this.guests.filter(g=>g.tableId).length; this.stats.assigned.textContent = `Asignados: ${assigned}`; }

  autosave(){ const data={guests:this.guests,tables:this.tables,defaultCap:this.defaultCap}; localStorage.setItem('seating_autosave', JSON.stringify(data)); }

  restoreAutosave(){
    const raw=localStorage.getItem('seating_autosave'); if(!raw) return;
    try{ const d=JSON.parse(raw); if(!d) return; this.guests=d.guests||[]; this.tables=(d.tables||[]).map(t=>({name:t.name||t.name===""?t.name:`Mesa ${t.number||''}`,...t})); this.defaultCap=d.defaultCap||11;
      this.rebuildGroupPills(); this.renderGuests(); this.renderTables(); this.updateStats();
    }catch{}
  }

  // --- Guardar / Cargar JSON ---
  saveArrangement(){
    const payload={guests:this.guests,tables:this.tables,defaultCap:this.defaultCap,stamp:new Date().toISOString()};
    const blob=new Blob([JSON.stringify(payload)],{type:'application/json'});
    const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=`seating-${new Date().toISOString().slice(0,10)}.json`; a.click(); URL.revokeObjectURL(a.href);
  }
  loadArrangement(){
    const input=document.createElement('input'); input.type='file'; input.accept='.json';
    input.onchange=(e)=>{ const f=e.target.files?.[0]; if(!f) return; const r=new FileReader(); r.onload=ev=>{
      try{ const d=JSON.parse(ev.target.result);
        this.guests=d.guests||[]; this.tables=(d.tables||[]).map(t=>({name:t.name||t.name===""?t.name:`Mesa ${t.number||''}`,...t})); this.defaultCap=d.defaultCap||11;
        this.rebuildGroupPills(); this.renderGuests(); this.renderTables(); this.updateStats(); this.autosave();
        Dialog.alert('¡Arreglo cargado!');
      }catch(err){ Dialog.alert('Archivo inválido: '+err.message); }
    }; r.readAsText(f); };
    input.click();
  }

  // --- Export CSV asignaciones ---
  exportAssignmentsCsv(){
    const rows=[["name","table","group","notes","email","phone","company"]];
    for(const g of this.guests){
      const table = g.tableId ? (this.tables.find(t=>t.id===g.tableId)?.name||'') : '';
      rows.push([g.name, table, g.group||'', g.notes||'', g.email||'', g.phone||'', g.company||'']);
    }
    const q='"';
    const csv = rows.map(r => r.map(v => q + String(v ?? '').replace(/\"/g, '""') + q).join(',')).join('\n');
    const blob=new Blob([csv],{type:'text/csv;charset=utf-8'});
    const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='seating_assignments.csv'; a.click(); URL.revokeObjectURL(a.href);
  }

  // --- Filtros por etiqueta ---
  rebuildGroupPills(){
    const set=new Set(this.guests.map(g=>g.group).filter(Boolean));
    this.groupPills.innerHTML='';
    const all=document.createElement('div'); all.className='pill active'; all.textContent='Todas'; all.dataset.key='*'; this.groupPills.appendChild(all);
    for(const k of [...set].sort()){ const pill=document.createElement('div'); pill.className='pill'; pill.textContent=k; pill.dataset.key=k; this.groupPills.appendChild(pill); }
    this.groupPills.onclick = (e)=>{ const p=e.target.closest('.pill'); if(!p) return; els('.pill',this.groupPills).forEach(x=>x.classList.remove('active')); p.classList.add('active'); const key=p.dataset.key; this.searchInput.value = key==='*' ? '' : key; this.renderGuests(); };
  }
}

const app=new SeatingPlanner();

