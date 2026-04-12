var SHOPS = ['Select Store', 'Asda', 'Asda Petrol', 'Boots', 'Deichhmann', 'Polish Shop', 'Sport Direct', 'Superdrug', 'Tesco', 'Tesco Petrol', 'Uber Eats', 'Other'];
var SPLIT_VALUE = '__split__';
var MN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
var MF = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
var S = {
	today: new Date(),
	incomes: [],
	expenses: [],
	groceries: [],
	am: null,
	iid: 1,
	eid: 1,
	gid: 1,
	split: 'prop',
	pots: {}
};
var sortState = {
	inc: {
		f: null,
		d: 1
	},
	exp: {
		f: null,
		d: 1
	},
	groc: {
		f: null,
		d: 1
	}
};
var dragState = {
	src: null
};
var gripSVG = '<svg width="10" height="14" viewBox="0 0 10 14" fill="currentColor"><circle cx="3" cy="2.5" r="1.2"/><circle cx="7" cy="2.5" r="1.2"/><circle cx="3" cy="7" r="1.2"/><circle cx="7" cy="7" r="1.2"/><circle cx="3" cy="11.5" r="1.2"/><circle cx="7" cy="11.5" r="1.2"/></svg>';

/* ── NEW ITEM TRACKING for enter animations ── */
var pendingNew = {
	inc: null,
	exp: null,
	groc: null
};
var pendingMoved = {
	inc: null,
	exp: null,
	groc: null
};

/* ── SLIDING PILL HELPER ── */
function movePillThumb(pillId, thumbId, activeBtn) {
	var pill = document.getElementById(pillId);
	var thumb = document.getElementById(thumbId);
	if (!pill || !thumb || !activeBtn) return;
	var pillRect = pill.getBoundingClientRect();
	var btnRect = activeBtn.getBoundingClientRect();
	thumb.style.left = (btnRect.left - pillRect.left) + 'px';
	thumb.style.width = btnRect.width + 'px';
}

function initThumb(pillId, thumbId, activeBtnId) {
	requestAnimationFrame(function () {
		var pill = document.getElementById(pillId);
		var thumb = document.getElementById(thumbId);
		var btn = document.getElementById(activeBtnId);
		if (!pill || !thumb || !btn) return;
		var pr = pill.getBoundingClientRect();
		var br = btn.getBoundingClientRect();
		thumb.style.transition = 'none';
		thumb.style.left = (br.left - pr.left) + 'px';
		thumb.style.width = br.width + 'px';
		requestAnimationFrame(function () {
			thumb.style.transition = '';
		});
	});
}

function save() {
	try {
		localStorage.setItem('bdg27v5', JSON.stringify({
			incomes: S.incomes,
			expenses: S.expenses,
			groceries: S.groceries,
			iid: S.iid,
			eid: S.eid,
			gid: S.gid,
			split: S.split,
			pots: S.pots
		}));
	} catch (e) {}
}

function load() {
	try {
		var r = localStorage.getItem('bdg27v5') || localStorage.getItem('bdg27v4') || localStorage.getItem('bdg27v3');
		if (!r) return false;
		var d = JSON.parse(r);
		S.incomes = d.incomes || [];
		S.expenses = d.expenses || [];
		S.groceries = d.groceries || [];
		S.iid = d.iid || 1;
		S.eid = d.eid || 1;
		S.gid = d.gid || 1;
		S.split = d.split || 'prop';
		S.pots = d.pots || {};
		S.groceries.forEach(function (g) {
			if (!g.date) g.date = '';
		});
		S.expenses.forEach(function (exp) {
			if (exp.paidBy === undefined) exp.paidBy = '';
			if (exp.selectedMonths === undefined) exp.selectedMonths = get12().map(function (m) {
				return m.year + '-' + m.month;
			});
			if (exp.freq === 'once') {
				exp.freq = 'months';
				var key = exp.pm ? moKey(exp.pm.y, exp.pm.m) : moKey(S.today.getFullYear(), S.today.getMonth());
				exp.selectedMonths = [key];
			}
		});
		return true;
	} catch (e) {
		return false;
	}
}

/* Theme */
var isDark = true;
(function () {
	var t;
	try {
		t = localStorage.getItem('bdg-theme5');
	} catch (e) {}
	if (t === 'light') {
		isDark = false;
		applyTheme();
	}
})();

function applyTheme() {
	if (isDark) {
		document.documentElement.style.setProperty('--bg', '#080B10');
		document.documentElement.style.setProperty('--bg2', '#0C1018');
		document.documentElement.style.setProperty('--surface', '#0F1520');
		document.documentElement.style.setProperty('--surface2', '#141C2A');
		document.documentElement.style.setProperty('--surface3', '#1A2335');
		document.documentElement.style.setProperty('--border', '#1E2C42');
		document.documentElement.style.setProperty('--border2', '#253548');
		document.documentElement.style.setProperty('--text', '#E8EEF8');
		document.documentElement.style.setProperty('--text2', '#8A99B3');
		document.documentElement.style.setProperty('--text3', '#445566');
		document.documentElement.style.setProperty('--tog-on-bg', '#253548');
		document.documentElement.style.setProperty('--tog-on-text', '#C8D8F0');
		document.getElementById('theme-icon').textContent = '☀️';
		document.body.style.backgroundImage = 'radial-gradient(ellipse 80% 40% at 50% -10%,rgba(26,111,255,.12),transparent)';
		document.querySelector('.topnav').style.background = 'rgba(8,11,16,.9)';
	} else {
		document.documentElement.style.setProperty('--bg', '#F2F5FA');
		document.documentElement.style.setProperty('--bg2', '#E8EDF5');
		document.documentElement.style.setProperty('--surface', '#FFFFFF');
		document.documentElement.style.setProperty('--surface2', '#F5F7FC');
		document.documentElement.style.setProperty('--surface3', '#EDF0F8');
		document.documentElement.style.setProperty('--border', '#DDE3F0');
		document.documentElement.style.setProperty('--border2', '#C8D2E8');
		document.documentElement.style.setProperty('--text', '#0D1626');
		document.documentElement.style.setProperty('--text2', '#4A5A7A');
		document.documentElement.style.setProperty('--text3', '#8A99B3');
		document.documentElement.style.setProperty('--tog-on-bg', '#C8D2E8');
		document.documentElement.style.setProperty('--tog-on-text', '#1A2F55');
		document.getElementById('theme-icon').textContent = '🌙';
		document.body.style.backgroundImage = 'radial-gradient(ellipse 80% 40% at 50% -10%,rgba(26,111,255,.05),transparent)';
		document.querySelector('.topnav').style.background = 'rgba(242,245,250,.92)';
	}
	setTimeout(renderChart, 50);
}
/* Animated theme button */
document.getElementById('togBtn').addEventListener('click', function () {
	isDark = !isDark;
	var btn = this;
	var icon = document.getElementById('theme-icon');
	btn.classList.add('spinning');
	icon.addEventListener('animationend', function handler() {
		btn.classList.remove('spinning');
		icon.removeEventListener('animationend', handler);
	});
	icon.textContent = isDark ? '☀️' : '🌙';
	applyTheme();
	try {
		localStorage.setItem('bdg-theme5', isDark ? 'dark' : 'light');
	} catch (e) {}
});

/* Helpers */
function fmt(n) {
	return '£' + Math.abs(n).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, '\u202f');
}

function fmtK(n) {
	if (Math.abs(n) >= 1000) return '£' + (Math.abs(n) / 1000).toFixed(1).replace('.0', '') + 'k';
	return fmt(n);
}

function r2(n) {
	return Math.round(n * 100) / 100;
}

function wim(y, m) {
	return new Date(y, m + 1, 0).getDate() / 7;
}

function esc(s) {
	return (s || '').replace(/&/g, '&').replace(/</g, '<').replace(/>/g, '>').replace(/"/g, '"');
}

function d2s(d) {
	return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2);
}

function s2d(s) {
	var p = s.split('-');
	return new Date(+p[0], +p[1] - 1, +p[2]);
}

function isCur(y, m) {
	return y === S.today.getFullYear() && m === S.today.getMonth();
}

function sameMo(a, b) {
	return a && b && a.year === b.year && a.month === b.month;
}

function get12() {
	var res = [],
		cy = S.today.getFullYear(),
		cm = S.today.getMonth();
	for (var i = 0; i < 12; i++) {
		var t = cm + i;
		res.push({
			year: cy + Math.floor(t / 12),
			month: t % 12
		});
	}
	return res;
}

function moKey(y, m) {
	return y + '-' + m;
}

function ensureAM() {
	if (!S.am) S.am = {
		year: S.today.getFullYear(),
		month: S.today.getMonth()
	};
}

function fiscalYr() {
	var y = S.today.getFullYear(),
		m = S.today.getMonth();
	var s = m >= 3 ? y : y - 1;
	return s + '/' + (String(s + 1).slice(-2));
}

function parseNum(s) {
	return parseFloat(String(s).replace(/[\s\u2009\u202f,]/g, '')) || 0;
}

function fmtNum(v) {
	if (!v && v !== 0) return '';
	var parts = Math.abs(v).toFixed(2).split('.');
	parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '\u202f');
	return parts.join('.');
}

function attachNum(el, getV, setV, onChange) {
	el.value = getV() > 0 ? fmtNum(getV()) : '';
	el.addEventListener('focus', function () {
		var v = getV();
		this.value = v > 0 ? v : '';
		this.select();
	});
	el.addEventListener('blur', function () {
		var v = parseNum(this.value);
		setV(v);
		this.value = v > 0 ? fmtNum(v) : '';
		if (onChange) onChange(v);
	});
	el.addEventListener('input', function () {
		var v = parseNum(this.value);
		setV(v);
		if (onChange) onChange(v);
	});
}

function animVal(el, txt) {
	el.style.animation = 'none';
	el.offsetHeight;
	el.textContent = txt;
	el.style.animation = 'countUp .3s cubic-bezier(.22,1,.36,1)';
}

/* Calc */
function incMo(inc, y, m) {
	var w = wim(y, m);
	if (inc.freq === 'weekly') return r2(inc.amount * w);
	if (inc.freq === 'yearly') return r2(inc.amount / 12);
	return r2(inc.amount);
}

function expMo(exp, y, m) {
	if (exp.freq === 'weekly') return r2(exp.amount * 52 / 12);
	if (exp.freq === 'yearly') return r2(exp.amount / 12);
	if (exp.freq === 'months') {
		var key = moKey(y, m);
		return (exp.selectedMonths && exp.selectedMonths.indexOf(key) >= 0) ? r2(exp.amount) : 0;
	}
	return r2(exp.amount);
}

function calcMo(y, m) {
	var ti = 0;
	S.incomes.forEach(function (i) {
		ti += incMo(i, y, m);
	});
	ti = r2(ti);
	var te = 0;
	S.expenses.forEach(function (e) {
		te += expMo(e, y, m);
	});
	te = r2(te);
	return {
		ti: ti,
		te: te,
		sav: r2(ti - te),
		w: wim(y, m)
	};
}

/* Sort */
function sortClick(table, field) {
	var ss = sortState[table];
	if (ss.f === field) {
		if (ss.d === 1) {
			ss.d = -1;
		} else {
			ss.f = null;
			ss.d = 1;
		}
	} else {
		ss.f = field;
		ss.d = 1;
	}
	if (table === 'inc') {
		applySortInc();
		renderIncs();
		renderExps();
		renderGrocs();
		renderGrocSummary();
		render();
	} else if (table === 'exp') {
		applySortExp();
		renderExps();
		render();
	} else {
		applySortGroc();
		renderGrocs();
		renderGrocSummary();
	}
}

function applySortInc() {
	var ss = sortState.inc;
	if (!ss.f) return;
	S.incomes.sort(function (a, b) {
		var av = ss.f === 'amount' ? a.amount : (a[ss.f] || '').toLowerCase();
		var bv = ss.f === 'amount' ? b.amount : (b[ss.f] || '').toLowerCase();
		if (av < bv) return -ss.d;
		if (av > bv) return ss.d;
		return 0;
	});
}

function applySortExp() {
	var ss = sortState.exp;
	if (!ss.f) return;
	S.expenses.sort(function (a, b) {
		var av = ss.f === 'amount' ? a.amount : (a[ss.f] || '').toLowerCase();
		var bv = ss.f === 'amount' ? b.amount : (b[ss.f] || '').toLowerCase();
		if (av < bv) return -ss.d;
		if (av > bv) return ss.d;
		return 0;
	});
}

function applySortGroc() {
	var ss = sortState.groc;
	if (!ss.f) return;
	S.groceries.sort(function (a, b) {
		var av = ss.f === 'amount' ? a.amount : (a[ss.f] || '').toLowerCase();
		var bv = ss.f === 'amount' ? b.amount : (b[ss.f] || '').toLowerCase();
		if (av < bv) return -ss.d;
		if (av > bv) return ss.d;
		return 0;
	});
}

function mkSortHdr(cols, ss, table, gridCols) {
	var hdr = document.createElement('div');
	hdr.style.cssText = 'display:grid;grid-template-columns:' + gridCols + ';gap:8px;padding:0 0 6px;border-bottom:1px solid var(--border);margin-bottom:4px';
	cols.forEach(function (col) {
		var d = document.createElement('div');
		if (col.field) {
			d.className = 'sort-th' + (col.cls ? ' ' + col.cls : '');
			if (ss.f === col.field) d.classList.add(ss.d === 1 ? 'sa' : 'sd');
			var lbl = document.createElement('span');
			lbl.textContent = col.label;
			var arr = document.createElement('span');
			arr.className = 'sarr';
			arr.textContent = ss.f === col.field ? (ss.d === 1 ? '↑' : '↓') : '↕';
			d.appendChild(lbl);
			d.appendChild(arr);
			(function (col, d) {
				d.addEventListener('click', function () {
					sortClick(table, col.field);
				});
			})(col, d);
		} else {
			d.className = (col.cls || '');
			d.style.cssText = 'font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:var(--text3)';
			if (col.label) d.textContent = col.label;
		}
		hdr.appendChild(d);
	});
	return hdr;
}

/* ── ANIMATED REMOVE HELPERS ── */
function animateRemove(el, onDone) {
	if (!el) {
		onDone();
		return;
	}
	el.classList.add('row-exit');
	el.addEventListener('animationend', function () {
		onDone();
	}, {
		once: true
	});
	// Safety fallback
	setTimeout(function () {
		onDone();
	}, 350);
}

/* Drag */
function enableDrag(el, handle, idx, arr, afterDrop, tableKey) {
	handle.addEventListener('mousedown', function () {
		el.setAttribute('draggable', 'true');
	});
	el.addEventListener('dragstart', function (e) {
		dragState.src = idx;
		e.dataTransfer.effectAllowed = 'move';
		e.dataTransfer.setData('text/plain', String(idx));
		setTimeout(function () {
			el.classList.add('row-dragging');
		}, 0);
	});
	el.addEventListener('dragend', function () {
		el.setAttribute('draggable', 'false');
		el.classList.remove('row-dragging');
		document.querySelectorAll('.row-drag-over').forEach(function (r) {
			r.classList.remove('row-drag-over');
		});
		dragState.src = null;
	});
	el.addEventListener('dragover', function (e) {
		if (dragState.src === null) return;
		e.preventDefault();
		e.dataTransfer.dropEffect = 'move';
		el.classList.add('row-drag-over');
	});
	el.addEventListener('dragleave', function (e) {
		if (!el.contains(e.relatedTarget)) el.classList.remove('row-drag-over');
	});
	el.addEventListener('drop', function (e) {
		e.preventDefault();
		el.classList.remove('row-drag-over');
		var src = dragState.src;
		if (src !== null && src !== idx) {
			var item = arr.splice(src, 1)[0];
			arr.splice(idx, 0, item);
			if (tableKey) pendingMoved[tableKey] = idx;
			save();
			afterDrop();
		}
		dragState.src = null;
	});
}

function mkDragHandle() {
	var btn = document.createElement('button');
	btn.className = 'drag-handle';
	btn.type = 'button';
	btn.title = 'Drag to reorder';
	btn.innerHTML = gripSVG;
	return btn;
}

/* CRUD */
function addInc(n, a, f) {
	var newId = S.iid;
	S.incomes.push({
		id: S.iid++,
		name: n || '',
		amount: a || 0,
		freq: f || 'weekly'
	});
	pendingNew.inc = newId;
	save();
	renderIncs();
	renderExps();
	renderGrocs();
	renderGrocSummary();
	render();
}

function rmInc(id) {
	var con = document.getElementById('inc-container');
	var el = con ? con.querySelector('[data-id="inc-' + id + '"]') : null;
	var doRemove = function () {
		S.incomes = S.incomes.filter(function (x) {
			return x.id !== id;
		});
		delete S.pots[String(id)];
		save();
		renderIncs();
		renderExps();
		renderGrocs();
		renderGrocSummary();
		render();
	};
	if (el) {
		var done = false;
		animateRemove(el, function () {
			if (done) return;
			done = true;
			doRemove();
		});
	} else {
		doRemove();
	}
}

function addExp(n, a, f) {
	var newId = S.eid;
	var dm = get12().map(function (m) {
		return moKey(m.year, m.month);
	});
	S.expenses.push({
		id: S.eid++,
		name: n || '',
		amount: a || 0,
		freq: f || 'monthly',
		pm: null,
		paidBy: '',
		selectedMonths: dm
	});
	pendingNew.exp = newId;
	save();
	renderExps();
	render();
}

function rmExp(id) {
	var con = document.getElementById('exp-container');
	var el = con ? con.querySelector('[data-id="exp-' + id + '"]') : null;
	var doRemove = function () {
		S.expenses = S.expenses.filter(function (x) {
			return x.id !== id;
		});
		save();
		renderExps();
		render();
	};
	if (el) {
		var done = false;
		animateRemove(el, function () {
			if (done) return;
			done = true;
			doRemove();
		});
	} else {
		doRemove();
	}
}

function addGroc(p, a, sh, dt) {
	var newId = S.gid;

	var today = new Date().toISOString().split('T')[0];

	S.groceries.push({
		id: S.gid++,
		person: p || '',
		amount: a || 0,
		shop: sh || 'Select Store',
		date: dt || today
	});

	pendingNew.groc = newId;
	save();
	renderGrocs();
	renderGrocSummary();
}

function rmGroc(id) {
	var con = document.getElementById('groc-container');
	var el = con ? con.querySelector('[data-id="groc-' + id + '"]') : null;
	var doRemove = function () {
		S.groceries = S.groceries.filter(function (x) {
			return x.id !== id;
		});
		save();
		renderGrocs();
		renderGrocSummary();
	};
	if (el) {
		var done = false;
		animateRemove(el, function () {
			if (done) return;
			done = true;
			doRemove();
		});
	} else {
		doRemove();
	}
}

function mkPre() {
	var s = document.createElement('span');
	s.className = 'inp-pre';
	s.textContent = '£';
	return s;
}

/* Render income */
function renderIncs() {
	var con = document.getElementById('inc-container');
	con.innerHTML = '';
	var ss = sortState.inc;
	con.appendChild(mkSortHdr([{
		label: 'Name',
		field: 'name'
	}, {
		label: 'Amount',
		field: 'amount'
	}, {
		label: 'Frequency',
		field: 'freq'
	}, {
		label: '',
		field: null
	}, {
		label: '',
		field: null
	}], ss, 'inc', '1fr 1fr 110px 30px 30px'));
	S.incomes.forEach(function (inc, idx) {
		var row = document.createElement('div');
		row.className = 'irow';
		row.setAttribute('data-id', 'inc-' + inc.id);
		// Enter animation for newly added
		if (pendingNew.inc === inc.id) {
			row.classList.add('row-enter');
			pendingNew.inc = null;
		}
		// Move highlight
		if (pendingMoved.inc === idx) {
			row.classList.add('row-moved');
			pendingMoved.inc = null;
		}

		var ni = document.createElement('input');
		ni.className = 'rinp';
		ni.type = 'text';
		ni.placeholder = 'Name (Alice…)';
		ni.value = inc.name;
		var aw = document.createElement('div');
		aw.className = 'inp-wrap';
		aw.appendChild(mkPre());
		var ai = document.createElement('input');
		ai.className = 'rinp wp';
		ai.type = 'text';
		ai.inputMode = 'decimal';
		ai.placeholder = '0.00';
		attachNum(ai, function () {
			return inc.amount;
		}, function (v) {
			inc.amount = v;
			save();
			render();
		}, null);
		aw.appendChild(ai);
		var fs = document.createElement('select');
		fs.className = 'rsel fq-col';
		[{
			v: 'weekly',
			l: 'Weekly'
		}, {
			v: 'monthly',
			l: 'Monthly'
		}, {
			v: 'yearly',
			l: 'Yearly'
		}].forEach(function (f) {
			var o = document.createElement('option');
			o.value = f.v;
			o.textContent = f.l;
			if (inc.freq === f.v) o.selected = true;
			fs.appendChild(o);
		});
		var db = document.createElement('button');
		db.className = 'del';
		db.title = 'Remove';
		db.textContent = '×';
		var dh = mkDragHandle();
		ni.addEventListener('input', function () {
			inc.name = this.value;
			save();
			renderGrocs();
			render();
		});
		ni.addEventListener('blur', function () {
			renderExps();
		});
		fs.addEventListener('change', function () {
			inc.freq = this.value;
			save();
			render();
		});
		db.addEventListener('click', function () {
			rmInc(inc.id);
		});
		row.appendChild(ni);
		row.appendChild(aw);
		row.appendChild(fs);
		row.appendChild(db);
		row.appendChild(dh);
		enableDrag(row, dh, idx, S.incomes, function () {
			renderIncs();
			renderExps();
			renderGrocs();
			renderGrocSummary();
			render();
		}, 'inc');
		con.appendChild(row);
	});
}

/* Render expenses */
function renderExps() {
	var con = document.getElementById('exp-container');
	con.innerHTML = '';
	var mos12 = get12();
	var ss = sortState.exp;
	con.appendChild(mkSortHdr([{
		label: 'Who pays',
		field: 'paidBy'
	}, {
		label: 'Name',
		field: 'name'
	}, {
		label: 'Amount',
		field: 'amount'
	}, {
		label: 'Frequency',
		field: 'freq'
	}, {
		label: '',
		field: null
	}, {
		label: '',
		field: null
	}], ss, 'exp', '120px 1fr 1fr 130px 30px 30px'));
	S.expenses.forEach(function (exp, idx) {
		var validKeys = mos12.map(function (m) {
			return moKey(m.year, m.month);
		});
		var item = document.createElement('div');
		item.className = 'exp-item';
		item.setAttribute('data-id', 'exp-' + exp.id);
		// Enter animation
		if (pendingNew.exp === exp.id) {
			item.classList.add('row-enter');
			pendingNew.exp = null;
		}
		if (pendingMoved.exp === idx) {
			item.classList.add('row-moved');
			pendingMoved.exp = null;
		}

		var row = document.createElement('div');
		row.className = 'erow';
		var pbSel = document.createElement('select');
		pbSel.className = 'rsel pb-col';
		var pbNone = document.createElement('option');
		pbNone.value = '';
		pbNone.textContent = 'Who pays';
		pbSel.appendChild(pbNone);
		var pbSplit = document.createElement('option');
		pbSplit.value = SPLIT_VALUE;
		pbSplit.textContent = 'Split ÷';
		pbSel.appendChild(pbSplit);
		S.incomes.forEach(function (inc) {
			if (!inc.name) return;
			var o = document.createElement('option');
			o.value = inc.name;
			o.textContent = inc.name;
			if (exp.paidBy === inc.name) o.selected = true;
			pbSel.appendChild(o);
		});
		if (exp.paidBy === SPLIT_VALUE) {
			pbSel.querySelector('[value="__split__"]').selected = true;
		}
		var ni = document.createElement('input');
		ni.className = 'rinp';
		ni.type = 'text';
		ni.placeholder = 'Rent, Netflix…';
		ni.value = exp.name;
		var aw = document.createElement('div');
		aw.className = 'inp-wrap';
		aw.appendChild(mkPre());
		var ai = document.createElement('input');
		ai.className = 'rinp wp';
		ai.type = 'text';
		ai.inputMode = 'decimal';
		ai.placeholder = '0.00';
		attachNum(ai, function () {
			return exp.amount;
		}, function (v) {
			exp.amount = v;
			save();
			render();
		}, null);
		aw.appendChild(ai);
		var fqw = document.createElement('div');
		fqw.className = 'fq-col';
		fqw.style.cssText = 'display:flex;flex-direction:column;gap:4px';
		var fs = document.createElement('select');
		fs.className = 'rsel';
		[{
			v: 'weekly',
			l: 'Weekly'
		}, {
			v: 'monthly',
			l: 'Monthly'
		}, {
			v: 'yearly',
			l: 'Yearly'
		}, {
			v: 'months',
			l: 'Select months…'
		}].forEach(function (f) {
			var o = document.createElement('option');
			o.value = f.v;
			o.textContent = f.l;
			if (exp.freq === f.v) o.selected = true;
			fs.appendChild(o);
		});
		fqw.appendChild(fs);
		var db = document.createElement('button');
		db.className = 'del';
		db.textContent = '×';
		db.title = 'Remove';
		var dh = mkDragHandle();
		row.appendChild(pbSel);
		row.appendChild(ni);
		row.appendChild(aw);
		row.appendChild(fqw);
		row.appendChild(db);
		row.appendChild(dh);
		item.appendChild(row);
		var mpWrap = document.createElement('div');
		mpWrap.className = 'mpick-wrap';
		mpWrap.style.display = exp.freq === 'months' ? 'flex' : 'none';
		var mpLbl = document.createElement('span');
		mpLbl.className = 'erow-sub-lbl';
		mpLbl.textContent = 'Active months:';
		var mpBtns = document.createElement('div');
		mpBtns.className = 'mpick-btns';
		mos12.forEach(function (mo) {
			var key = moKey(mo.year, mo.month);
			var btn = document.createElement('button');
			btn.className = 'mpick-btn';
			btn.type = 'button';
			btn.textContent = MN[mo.month] + '\u2009' + (String(mo.year).slice(-2));
			if (!exp.selectedMonths || exp.selectedMonths.indexOf(key) >= 0) btn.classList.add('on');
			(function (key, btn) {
				btn.addEventListener('click', function (e) {
					e.preventDefault();
					if (!exp.selectedMonths) exp.selectedMonths = validKeys.slice();
					var i2 = exp.selectedMonths.indexOf(key);
					if (i2 >= 0) exp.selectedMonths.splice(i2, 1);
					else exp.selectedMonths.push(key);
					btn.classList.toggle('on', exp.selectedMonths.indexOf(key) >= 0);
					save();
					render();
				});
			})(key, btn);
			mpBtns.appendChild(btn);
		});
		var mpActs = document.createElement('div');
		mpActs.style.cssText = 'display:flex;gap:4px;margin-left:4px;align-items:center;flex-shrink:0';

		function mkMA(lbl, fn) {
			var b = document.createElement('button');
			b.type = 'button';
			b.className = 'mpick-all-btn';
			b.textContent = lbl;
			b.addEventListener('click', function (e) {
				e.preventDefault();
				fn();
			});
			return b;
		}
		mpActs.appendChild(mkMA('All', function () {
			exp.selectedMonths = validKeys.slice();
			mpBtns.querySelectorAll('.mpick-btn').forEach(function (b) {
				b.classList.add('on');
			});
			save();
			render();
		}));
		mpActs.appendChild(mkMA('None', function () {
			exp.selectedMonths = [];
			mpBtns.querySelectorAll('.mpick-btn').forEach(function (b) {
				b.classList.remove('on');
			});
			save();
			render();
		}));
		mpWrap.appendChild(mpLbl);
		mpWrap.appendChild(mpBtns);
		mpWrap.appendChild(mpActs);
		item.appendChild(mpWrap);
		ni.addEventListener('input', function () {
			exp.name = this.value;
			save();
			render();
		});
		fs.addEventListener('change', function () {
			exp.freq = this.value;
			mpWrap.style.display = exp.freq === 'months' ? 'flex' : 'none';
			if (exp.freq === 'months' && (!exp.selectedMonths || !exp.selectedMonths.length)) {
				exp.selectedMonths = validKeys.slice();
				mpBtns.querySelectorAll('.mpick-btn').forEach(function (b) {
					b.classList.add('on');
				});
			}
			save();
			render();
		});
		pbSel.addEventListener('change', function () {
			exp.paidBy = this.value;
			save();
			var c = calcMo(S.am.year, S.am.month);
			renderSplit(c);
		});
		db.addEventListener('click', function () {
			rmExp(exp.id);
		});
		enableDrag(item, dh, idx, S.expenses, function () {
			renderExps();
			render();
		}, 'exp');
		con.appendChild(item);
	});
}

/* Render groceries */
function renderGrocs() {
	var con = document.getElementById('groc-container');
	con.innerHTML = '';
	var ss = sortState.groc;
	con.appendChild(mkSortHdr([{
		label: 'Who bought',
		field: 'person'
	}, {
		label: 'Amount',
		field: 'amount'
	}, {
		label: 'Shop',
		field: 'shop',
		cls: 'shop-col'
	}, {
		label: 'Date',
		field: 'date',
		cls: 'date-col'
	}, {
		label: '',
		field: null
	}, {
		label: '',
		field: null
	}], ss, 'groc', '130px 1fr 150px 160px 30px 30px'));
	S.groceries.forEach(function (gr, idx) {
		var row = document.createElement('div');
		row.className = 'grow';
		row.setAttribute('data-id', 'groc-' + gr.id);
		// Enter animation
		if (pendingNew.groc === gr.id) {
			row.classList.add('row-enter');
			pendingNew.groc = null;
		}
		if (pendingMoved.groc === idx) {
			row.classList.add('row-moved');
			pendingMoved.groc = null;
		}

		var ps = document.createElement('select');
		ps.className = 'rsel';
		var po = document.createElement('option');
		po.value = '';
		po.textContent = 'Who bought';
		ps.appendChild(po);
		S.incomes.forEach(function (inc) {
			var o = document.createElement('option');
			o.value = inc.name;
			o.textContent = inc.name || 'Person';
			if (gr.person === inc.name) o.selected = true;
			ps.appendChild(o);
		});
		var aw = document.createElement('div');
		aw.className = 'inp-wrap';
		aw.appendChild(mkPre());
		var ai = document.createElement('input');
		ai.className = 'rinp wp';
		ai.type = 'text';
		ai.inputMode = 'decimal';
		ai.placeholder = '0.00';
		attachNum(ai, function () {
			return gr.amount;
		}, function (v) {
			gr.amount = v;
			save();
			renderGrocSummary();
		}, null);
		aw.appendChild(ai);
		var ss2 = document.createElement('select');
		ss2.className = 'rsel shop-col';
		SHOPS.forEach(function (sh) {
			var o = document.createElement('option');
			o.value = sh;
			o.textContent = sh;
			if (gr.shop === sh) o.selected = true;
			ss2.appendChild(o);
		});
		var dinp = document.createElement('input');
		dinp.type = 'date';
		dinp.className = 'groc-date date-col';
		if (gr.date) dinp.value = gr.date;
		var db = document.createElement('button');
		db.className = 'del';
		db.textContent = '×';
		db.title = 'Remove';
		var dh = mkDragHandle();
		ps.addEventListener('change', function () {
			gr.person = this.value;
			save();
			renderGrocSummary();
		});
		ss2.addEventListener('change', function () {
			gr.shop = this.value;
			save();
		});
		dinp.addEventListener('change', function () {
			gr.date = this.value;
			save();
		});
		db.addEventListener('click', function () {
			rmGroc(gr.id);
		});
		row.appendChild(ps);
		row.appendChild(aw);
		row.appendChild(ss2);
		row.appendChild(dinp);
		row.appendChild(db);
		row.appendChild(dh);
		enableDrag(row, dh, idx, S.groceries, function () {
			renderGrocs();
			renderGrocSummary();
		}, 'groc');
		con.appendChild(row);
	});
}

/* Grocery summary */
function renderGrocSummary() {
	var con = document.getElementById('groc-summary');
	con.innerHTML = '';
	if (!S.groceries.length) return;
	var totals = {};
	S.groceries.forEach(function (g) {
		if (g.person && g.amount > 0) totals[g.person] = (totals[g.person] || 0) + g.amount;
	});
	var allPeople = S.incomes.map(function (i) {
		return i.name;
	}).filter(function (n) {
		return n;
	});
	if (!allPeople.length) return;
	var grandTotal = 0;
	Object.keys(totals).forEach(function (p) {
		grandTotal += totals[p];
	});
	grandTotal = r2(grandTotal);
	if (grandTotal <= 0) return;
	var share = r2(grandTotal / allPeople.length);
	var wrap = document.createElement('div');
	wrap.className = 'groc-sum-wrap';
	var sec = document.createElement('div');
	sec.className = 'dsec';
	sec.textContent = 'Grocery summary';
	wrap.appendChild(sec);
	allPeople.forEach(function (p) {
		var spent = r2(totals[p] || 0);
		var r3 = document.createElement('div');
		r3.className = 'drow';
		r3.innerHTML = '<span style="font-weight:600">' + esc(p) + '</span><span style="color:var(--r);font-weight:700;font-family:var(--mono)">' + fmt(spent) + '</span>';
		wrap.appendChild(r3);
	});
	var tot = document.createElement('div');
	tot.className = 'dtot';
	tot.innerHTML = '<span>Total</span><span>' + fmt(grandTotal) + '</span>';
	wrap.appendChild(tot);
	var shr = document.createElement('div');
	shr.className = 'drow';
	shr.style.paddingBottom = '12px';
	shr.innerHTML = '<span style="color:var(--text2)">Fair share each (÷' + allPeople.length + ')</span><span style="color:var(--text2);font-weight:700;font-family:var(--mono)">' + fmt(share) + '</span>';
	wrap.appendChild(shr);
	var balance = {};
	allPeople.forEach(function (p) {
		balance[p] = r2((totals[p] || 0) - share);
	});
	var creditors = [],
		debtors = [];
	allPeople.forEach(function (p) {
		if (balance[p] > 0.01) creditors.push({
			person: p,
			amount: balance[p]
		});
		if (balance[p] < -0.01) debtors.push({
			person: p,
			amount: -balance[p]
		});
	});
	if (creditors.length && debtors.length) {
		var sb = document.createElement('div');
		sb.className = 'settle-box';
		var st = document.createElement('div');
		st.className = 'settle-title';
		var td = S.am || {
			year: S.today.getFullYear(),
			month: S.today.getMonth()
		};
		st.innerHTML = 'Settlements — ' + MF[td.month] + ' ' + td.year;
		sb.appendChild(st);
		var cr = creditors.map(function (x) {
				return {
					person: x.person,
					amount: x.amount
				};
			}),
			dr = debtors.map(function (x) {
				return {
					person: x.person,
					amount: x.amount
				};
			});
		var ci = 0,
			di2 = 0;
		while (ci < cr.length && di2 < dr.length) {
			var amt = r2(Math.min(cr[ci].amount, dr[di2].amount));
			if (amt > 0.01) {
				var sr = document.createElement('div');
				sr.className = 'settle-row';
				sr.innerHTML = '<span><strong style="font-size:20px">' + esc(dr[di2].person) + '</strong> <span style="color:var(--text3);font-size:20px">→</span> <strong style="font-size:20px">' + esc(cr[ci].person) + '</strong></span><span style="font-size:26px;font-weight:800;color:var(--gold);font-family:var(--mono);letter-spacing:-.04em">' + fmt(amt) + '</span>';
				sb.appendChild(sr);
			}
			cr[ci].amount = r2(cr[ci].amount - amt);
			dr[di2].amount = r2(dr[di2].amount - amt);
			if (cr[ci].amount < 0.01) ci++;
			if (dr[di2].amount < 0.01) di2++;
		}
		wrap.appendChild(sb);
	}
	con.appendChild(wrap);
}

document.getElementById('add-inc').addEventListener('click', function () {
	addInc('', 0, 'weekly');
});
document.getElementById('add-exp').addEventListener('click', function () {
	addExp('', 0, 'monthly');
});
document.getElementById('add-groc').addEventListener('click', function () {
	addGroc('', 0, 'Select Store', '');
});

/* Date picker */
var di = document.getElementById('today-date');
di.value = d2s(S.today);
di.addEventListener('change', function () {
	if (this.value) {
		S.today = s2d(this.value);
		S.am = {
			year: S.today.getFullYear(),
			month: S.today.getMonth()
		};
		renderExps();
		render();
	}
});

/* Split mode — with sliding thumb */
document.getElementById('btn-prop').addEventListener('click', function () {
	setSplit('prop', this);
});
document.getElementById('btn-half').addEventListener('click', function () {
	setSplit('half', this);
});

function setSplit(m, activeBtn) {
	S.split = m;
	document.getElementById('btn-prop').className = 'tog-pill-btn' + (m === 'prop' ? ' on' : '');
	document.getElementById('btn-half').className = 'tog-pill-btn' + (m === 'half' ? ' on' : '');
	movePillThumb('split-pill', 'split-thumb', activeBtn);
	save();
	render();
}

function updateWhoPaysLabel() {
	var el = document.getElementById('who-pays-title');
	if (!el) return;

	el.textContent =
		S.split === 'prop' ?
		'⚖️ Who pays (% income)' :
		'⚖️ Who pays (50 / 50)';
}

/* Chart */
function smoothPath(pts) {
	if (pts.length < 2) return pts.length ? 'M' + pts[0].x + ',' + pts[0].y : '';
	var d = 'M' + pts[0].x + ',' + pts[0].y;
	for (var i = 1; i < pts.length; i++) {
		var p = pts[i - 1],
			c = pts[i];
		var cx = (p.x + c.x) / 2;
		d += ' C' + cx + ',' + p.y + ' ' + cx + ',' + c.y + ' ' + c.x + ',' + c.y;
	}
	return d;
}

function ns(tag, attrs) {
	var el = document.createElementNS('http://www.w3.org/2000/svg', tag);
	Object.keys(attrs).forEach(function (k) {
		el.setAttribute(k, attrs[k]);
	});
	return el;
}

function renderChart() {
	var svg = document.getElementById('main-chart');
	if (!svg) return;
	var W = svg.parentElement.clientWidth || 760,
		H = 200;
	svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
	svg.setAttribute('width', W);
	svg.innerHTML = '';
	var mos = get12();
	var data = mos.map(function (mo) {
		var c = calcMo(mo.year, mo.month);
		return {
			label: MN[mo.month] + "'" + (String(mo.year).slice(-2)),
			ti: c.ti,
			te: c.te,
			sav: c.sav,
			year: mo.year,
			month: mo.month
		};
	});
	var maxVal = 0;
	data.forEach(function (d) {
		maxVal = Math.max(maxVal, d.ti, d.te, Math.abs(d.sav));
	});
	if (maxVal === 0) maxVal = 2000;
	var pL = 8,
		pR = 8,
		pT = 16,
		pB = 28,
		cW = W - pL - pR,
		cH = H - pT - pB,
		colW = cW / mos.length;
	var gc = isDark ? 'rgba(255,255,255,.04)' : 'rgba(0,0,0,.04)';
	var tc = isDark ? '#445566' : '#8A99B3';
	var zeroY = pT + cH;

	function yOf(v) {
		return pT + cH - (v / maxVal) * cH;
	}
	var defs = ns('defs', {});
	var gInc = ns('linearGradient', {
		id: 'g-inc',
		x1: '0',
		y1: '0',
		x2: '0',
		y2: '1'
	});
	var s1 = ns('stop', {
		offset: '0%'
	});
	s1.style.stopColor = '#00D37F';
	s1.style.stopOpacity = '.22';
	var s2 = ns('stop', {
		offset: '100%'
	});
	s2.style.stopColor = '#00D37F';
	s2.style.stopOpacity = '.01';
	gInc.appendChild(s1);
	gInc.appendChild(s2);
	var gExp = ns('linearGradient', {
		id: 'g-exp',
		x1: '0',
		y1: '0',
		x2: '0',
		y2: '1'
	});
	var s3 = ns('stop', {
		offset: '0%'
	});
	s3.style.stopColor = '#FF3B5C';
	s3.style.stopOpacity = '.18';
	var s4 = ns('stop', {
		offset: '100%'
	});
	s4.style.stopColor = '#FF3B5C';
	s4.style.stopOpacity = '.01';
	gExp.appendChild(s3);
	gExp.appendChild(s4);
	defs.appendChild(gInc);
	defs.appendChild(gExp);
	svg.appendChild(defs);
	for (var gi = 0; gi <= 4; gi++) {
		var gv = maxVal * (4 - gi) / 4,
			gy = yOf(gv);
		svg.appendChild(ns('line', {
			x1: pL,
			y1: gy,
			x2: W - pR,
			y2: gy,
			stroke: gc,
			'stroke-width': '1'
		}));
		var gl = ns('text', {
			x: pL + 2,
			y: gy - 3,
			fill: tc,
			'font-size': '8.5',
			'font-family': 'Figtree,sans-serif',
			'font-weight': '600'
		});
		gl.textContent = fmtK(gv);
		svg.appendChild(gl);
	}
	svg.appendChild(ns('line', {
		x1: pL,
		y1: zeroY,
		x2: W - pR,
		y2: zeroY,
		stroke: isDark ? 'rgba(255,255,255,.08)' : 'rgba(0,0,0,.08)',
		'stroke-width': '1'
	}));
	var incPts = [],
		expPts = [],
		savPts = [];
	data.forEach(function (d, i) {
		var cx = pL + i * colW + colW / 2;
		incPts.push({
			x: cx,
			y: yOf(d.ti)
		});
		expPts.push({
			x: cx,
			y: yOf(d.te)
		});
		var sy = d.sav >= 0 ? yOf(d.sav) : Math.min(zeroY + 24, zeroY + ((-d.sav / maxVal) * cH) * .6);
		savPts.push({
			x: cx,
			y: sy
		});
	});

	function buildAreaPath(pts, zY) {
		var lp = smoothPath(pts);
		if (!lp) return '';
		var f = pts[0],
			l = pts[pts.length - 1];
		return lp + ' L' + l.x + ',' + zY + ' L' + f.x + ',' + zY + ' Z';
	}
	var incArea = ns('path', {
		d: buildAreaPath(incPts, zeroY),
		fill: 'url(#g-inc)',
		opacity: '0'
	});
	svg.appendChild(incArea);
	setTimeout(function () {
		incArea.style.transition = 'opacity .8s ease';
		incArea.setAttribute('opacity', '1');
	}, 50);
	var expArea = ns('path', {
		d: buildAreaPath(expPts, zeroY),
		fill: 'url(#g-exp)',
		opacity: '0'
	});
	svg.appendChild(expArea);
	setTimeout(function () {
		expArea.style.transition = 'opacity .8s ease .1s';
		expArea.setAttribute('opacity', '1');
	}, 50);
	var am = S.am;
	data.forEach(function (d, i) {
		if (am && am.year === mos[i].year && am.month === mos[i].month) {
			svg.appendChild(ns('rect', {
				x: pL + i * colW,
				y: pT,
				width: colW,
				height: cH,
				fill: isDark ? 'rgba(26,111,255,.05)' : 'rgba(26,111,255,.03)'
			}));
			svg.appendChild(ns('line', {
				x1: pL + i * colW + colW / 2,
				y1: pT,
				x2: pL + i * colW + colW / 2,
				y2: zeroY,
				stroke: '#1A6FFF',
				'stroke-width': '1',
				'stroke-dasharray': '3 2',
				'opacity': '.5'
			}));
		}
	});
	var len = 1000;
	var incLine = ns('path', {
		d: smoothPath(incPts),
		fill: 'none',
		stroke: '#00D37F',
		'stroke-width': '2',
		'stroke-linejoin': 'round',
		'stroke-linecap': 'round'
	});
	incLine.style.strokeDasharray = len;
	incLine.style.strokeDashoffset = len;
	incLine.style.transition = 'stroke-dashoffset 1s cubic-bezier(.22,1,.36,1)';
	svg.appendChild(incLine);
	setTimeout(function () {
		incLine.style.strokeDashoffset = '0';
	}, 80);
	var expLine = ns('path', {
		d: smoothPath(expPts),
		fill: 'none',
		stroke: '#FF3B5C',
		'stroke-width': '2',
		'stroke-linejoin': 'round',
		'stroke-linecap': 'round'
	});
	expLine.style.strokeDasharray = len;
	expLine.style.strokeDashoffset = len;
	expLine.style.transition = 'stroke-dashoffset 1s cubic-bezier(.22,1,.36,1) .12s';
	svg.appendChild(expLine);
	setTimeout(function () {
		expLine.style.strokeDashoffset = '0';
	}, 80);
	var savLine = ns('path', {
		d: smoothPath(savPts),
		fill: 'none',
		stroke: '#1A6FFF',
		'stroke-width': '1.5',
		'stroke-linejoin': 'round',
		'stroke-linecap': 'round',
		'stroke-dasharray': '5 3',
		'opacity': '.8'
	});
	svg.appendChild(savLine);
	savPts.forEach(function (p, i) {
		var dc = data[i];
		var dotCol = dc.sav >= 0 ? '#1A6FFF' : '#FF3B5C';
		svg.appendChild(ns('circle', {
			cx: p.x,
			cy: p.y,
			r: '5',
			fill: dotCol,
			opacity: '.15'
		}));
		svg.appendChild(ns('circle', {
			cx: p.x,
			cy: p.y,
			r: '3',
			fill: dotCol,
			stroke: isDark ? '#0F1520' : '#FFFFFF',
			'stroke-width': '1.5'
		}));
	});
	data.forEach(function (d, i) {
		var cx = pL + i * colW + colW / 2;
		var isA = am && am.year === mos[i].year && am.month === mos[i].month;
		var lbl = ns('text', {
			x: cx,
			y: H - 6,
			fill: isA ? '#1A6FFF' : tc,
			'font-size': '9',
			'font-family': 'Figtree,sans-serif',
			'text-anchor': 'middle',
			'font-weight': isA ? '700' : '500'
		});
		lbl.textContent = d.label;
		svg.appendChild(lbl);
	});
	var crossLine = ns('line', {
		x1: 0,
		y1: pT,
		x2: 0,
		y2: zeroY,
		stroke: isDark ? 'rgba(255,255,255,.15)' : 'rgba(0,0,0,.12)',
		'stroke-width': '1',
		'stroke-dasharray': '3 2',
		opacity: '0'
	});
	svg.appendChild(crossLine);
	var tt = document.getElementById('tt');
	var overlay = ns('rect', {
		x: pL,
		y: 0,
		width: W - pL - pR,
		height: H,
		fill: 'transparent',
		style: 'cursor:crosshair'
	});
	overlay.addEventListener('mousemove', function (e) {
		var rect = svg.getBoundingClientRect(),
			mx = e.clientX - rect.left - pL;
		var idx = Math.max(0, Math.min(mos.length - 1, Math.floor(mx / colW)));
		var cx = pL + idx * colW + colW / 2;
		crossLine.setAttribute('x1', cx);
		crossLine.setAttribute('x2', cx);
		crossLine.setAttribute('opacity', '1');
		tt.className = 'show';
		tt.style.left = (e.clientX + 16) + 'px';
		tt.style.top = (e.clientY - 80) + 'px';
		var d = data[idx];
		document.getElementById('tt-month').textContent = MF[mos[idx].month] + ' ' + mos[idx].year;
		document.getElementById('tt-inc').textContent = fmt(d.ti);
		document.getElementById('tt-exp').textContent = fmt(d.te);
		var sv = document.getElementById('tt-sav');
		sv.textContent = fmt(d.sav);
		sv.style.color = d.sav >= 0 ? '#1A6FFF' : '#FF3B5C';
	});
	overlay.addEventListener('mouseleave', function () {
		crossLine.setAttribute('opacity', '0');
		tt.className = '';
	});
	overlay.addEventListener('click', function (e) {
		var rect = svg.getBoundingClientRect(),
			mx = e.clientX - rect.left - pL;
		var idx = Math.max(0, Math.min(mos.length - 1, Math.floor(mx / colW)));
		S.am = {
			year: mos[idx].year,
			month: mos[idx].month
		};
		render();
	});
	svg.appendChild(overlay);
}

/* Main render */
function render() {
	ensureAM();
	var am = S.am,
		c = calcMo(am.year, am.month),
		mn = MF[am.month] + ' ' + am.year;
	var mos = get12(),
		ai = 0,
		ae = 0;
	mos.forEach(function (mo) {
		var mc = calcMo(mo.year, mo.month);
		ai += mc.ti;
		ae += mc.te;
	});
	ai = r2(ai);
	ae = r2(ae);
	var as2 = r2(ai - ae);
	var ap = ai > 0 ? Math.round(as2 / ai * 100) : 0;
	var savStr = Math.abs(as2).toFixed(2),
		sp = savStr.split('.');
	document.getElementById('hero-sav-int').textContent = sp[0].replace(/\B(?=(\d{3})+(?!\d))/g, '\u202f');
	document.getElementById('hero-sav-dec').textContent = sp[1];
	document.getElementById('hero-pill-pct').textContent = (as2 >= 0 ? '+' : '-') + ap + '% of annual income';
	document.getElementById('hero-pill-pct').className = 'hero-pill ' + (as2 >= 0 ? 'pill-g' : 'pill-r');
	document.getElementById('hero-pill-mo').textContent = fmt(c.sav) + ' / month';
	document.getElementById('hero-month-short').textContent = MN[am.month];
	document.getElementById('hero-month-year').textContent = am.year;
	document.getElementById('hero-week-info').textContent = '≈ ' + c.w.toFixed(2) + ' weeks';
	animVal(document.getElementById('hs-inc'), fmt(ai));
	animVal(document.getElementById('hs-exp'), fmt(ae));
	document.getElementById('hs-rate').textContent = (ap >= 0 ? '+' : '') + ap + '%';
	document.getElementById('hs-rate').style.color = ap >= 0 ? 'var(--g)' : 'var(--r)';
	animVal(document.getElementById('hs-mo'), fmt(c.ti));
	document.getElementById('month-sdiv-lbl').textContent = mn;
	animVal(document.getElementById('m-inc'), fmt(c.ti));
	animVal(document.getElementById('m-exp'), fmt(c.te));
	var mse = document.getElementById('m-sav');
	animVal(mse, (c.sav < 0 ? '−' : '') + fmt(c.sav));
	mse.className = 'sc-val ' + (c.sav < 0 ? 'sc-accent-r' : 'sc-accent-b');
	document.getElementById('m-inc-sub').textContent = mn;
	document.getElementById('m-exp-sub').textContent = mn;
	var sp2 = c.ti > 0 ? Math.round(c.sav / c.ti * 100) : 0;
	document.getElementById('m-sav-sub').textContent = (sp2 >= 0 ? '+' : '') + sp2 + '% of income';
	var ep = c.ti > 0 ? Math.min(120, Math.round(c.te / c.ti * 100)) : 0;
	document.getElementById('m-pct').textContent = (c.ti > 0 ? Math.round(c.te / c.ti * 100) : 0) + '%';
	var pg = document.getElementById('m-prog');
	pg.style.width = Math.min(100, ep) + '%';
	pg.className = 'prog-bar-fill ' + (ep > 100 ? 'pbr' : ep > 80 ? 'pba' : 'pbg');
	var ihm = 0;
	S.incomes.forEach(function (i) {
		ihm += incMo(i, am.year, am.month);
	});
	document.getElementById('inc-hdr').textContent = fmt(r2(ihm)) + ' / month';
	document.getElementById('exp-hdr').textContent = fmt(c.te) + ' / month';
	renderPots();
	renderSplit(c);
	renderTabs();
	renderDetail(am.year, am.month, c);
	renderGrocSummary();
	renderChart();
	updateWhoPaysLabel();
}

/* Savings pots */
function renderPots() {
	var con = document.getElementById('pot-container');
	con.innerHTML = '';
	if (!S.incomes.length) {
		con.innerHTML = '<div class="pot-empty">Add income to see individual pots.</div>';
		return;
	}
	var mos = get12(),
		n = S.incomes.length;
	var grid = document.createElement('div');
	grid.className = 'pot-grid';
	S.incomes.forEach(function (inc, pidx) {
		var pid = String(inc.id);
		if (!S.pots[pid]) S.pots[pid] = {
			cur: 0
		};
		var pot = S.pots[pid];
		var pAI = 0,
			pAE = 0;
		mos.forEach(function (mo) {
			var pi = incMo(inc, mo.year, mo.month);
			pAI += pi;
			var toti = r2(S.incomes.reduce(function (s, x) {
				return s + incMo(x, mo.year, mo.month);
			}, 0));
			var tote = r2(S.expenses.reduce(function (s, x) {
				return s + expMo(x, mo.year, mo.month);
			}, 0));
			var sh = S.split === 'half' ? (n > 0 ? 1 / n : 0) : (toti > 0 ? pi / toti : 0);
			pAE += r2(tote * sh);
		});
		pAI = r2(pAI);
		pAE = r2(pAE);
		var pAS = r2(pAI - pAE);
		var potTot = r2((pot.cur || 0) + pAS);
		var card = document.createElement('div');
		card.className = 'pot-card';
		card.style.animationDelay = (pidx * 0.07) + 's';
		var init = (inc.name || '?').trim().split(/\s+/).map(function (w) {
			return w[0] || '';
		}).slice(0, 2).join('').toUpperCase() || '?';
		var nr = document.createElement('div');
		nr.className = 'pot-name';
		nr.innerHTML = '<div class="pot-av">' + esc(init) + '</div><span>' + esc(inc.name || 'Person') + '</span>';
		card.appendChild(nr);

		function addStat(lbl, val, col) {
			var r3 = document.createElement('div');
			r3.className = 'pot-stat';
			r3.innerHTML = '<span class="pot-stat-lbl">' + lbl + '</span><span class="pot-stat-val" style="color:' + col + '">' + val + '</span>';
			card.appendChild(r3);
		}
		addStat('Annual income', fmt(pAI), 'var(--g)');
		addStat('Annual expenses', fmt(pAE), 'var(--r)');
		addStat('Calculated savings', (pAS < 0 ? '−' : '+') + fmt(pAS), pAS < 0 ? 'var(--r)' : '#5B9FFF');
		var hr = document.createElement('div');
		hr.className = 'pot-hr';
		card.appendChild(hr);
		var inrow = document.createElement('div');
		inrow.className = 'pot-inrow';
		var lbl2 = document.createElement('div');
		lbl2.className = 'pot-inlbl';
		lbl2.textContent = 'Current savings';
		var iw = document.createElement('div');
		iw.className = 'pot-inwrap';
		iw.appendChild(mkPre());
		var curInp = document.createElement('input');
		curInp.className = 'pot-inp';
		curInp.type = 'text';
		curInp.inputMode = 'decimal';
		curInp.placeholder = '0.00';
		iw.appendChild(curInp);
		inrow.appendChild(lbl2);
		inrow.appendChild(iw);
		card.appendChild(inrow);
		var hr2 = document.createElement('div');
		hr2.className = 'pot-hr';
		card.appendChild(hr2);
		var tr = document.createElement('div');
		tr.className = 'pot-total-row';
		var tl = document.createElement('div');
		tl.className = 'pot-total-lbl';
		tl.textContent = 'End of year';
		var tv = document.createElement('div');
		tv.className = 'pot-total-val';
		tv.style.color = potTot < 0 ? 'var(--r)' : 'var(--g)';
		tv.textContent = (potTot < 0 ? '−' : '') + fmt(potTot);
		tr.appendChild(tl);
		tr.appendChild(tv);
		card.appendChild(tr);
		var tn = document.createElement('div');
		tn.className = 'pot-note';
		tn.textContent = 'current + annual savings';
		card.appendChild(tn);
		(function (pot, pAS, tv, curInp) {
			attachNum(curInp, function () {
				return pot.cur || 0;
			}, function (v) {
				pot.cur = v;
				var pt = r2((pot.cur || 0) + pAS);
				tv.style.color = pt < 0 ? 'var(--r)' : 'var(--g)';
				tv.textContent = (pt < 0 ? '−' : '') + fmt(pt);
				save();
			}, null);
		})(pot, pAS, tv, curInp);
		grid.appendChild(card);
	});
	con.appendChild(grid);
}

/* Split — renders into #split-inner, always visible below 12-month */
function renderSplit(c) {
	var body = document.getElementById('split-inner');
	var am = S.am,
		n = S.incomes.length;
	if (!n || !c.te) {
		body.innerHTML = '<div style="color:var(--text3);font-size:13px;font-weight:500">Add income and expenses to see the split.</div>';
		return;
	}
	body.innerHTML = '';
	var actualPaid = {};
	S.incomes.forEach(function (inc) {
		actualPaid[inc.name] = 0;
	});
	var totalAssigned = 0;
	S.expenses.forEach(function (exp) {
		var mo = expMo(exp, am.year, am.month);
		if (mo <= 0) return;
		if (exp.paidBy === SPLIT_VALUE) {
			var share = r2(mo / n);
			S.incomes.forEach(function (inc) {
				actualPaid[inc.name] = r2(actualPaid[inc.name] + share);
			});
			totalAssigned = r2(totalAssigned + mo);
		} else if (exp.paidBy && actualPaid.hasOwnProperty(exp.paidBy)) {
			actualPaid[exp.paidBy] = r2(actualPaid[exp.paidBy] + mo);
			totalAssigned = r2(totalAssigned + mo);
		}
	});
	var unassigned = r2(c.te - totalAssigned);
	var fairShares = {};
	S.incomes.forEach(function (inc) {
		var pi = incMo(inc, am.year, am.month);
		var sh = S.split === 'half' ? (n > 0 ? 1 / n : 0) : (c.ti > 0 ? pi / c.ti : 0);
		fairShares[inc.name] = r2(c.te * sh);
	});
	var tw = document.createElement('div');
	tw.className = 'stbl-wrap';
	var tbl = document.createElement('table');
	tbl.className = 'stbl';
	tbl.innerHTML = '<thead><tr><th>Person</th><th>Income</th><th>Fair share</th><th>Paid</th><th>Balance</th></tr></thead>';
	var tb2 = document.createElement('tbody');
	S.incomes.forEach(function (inc) {
		var pi = incMo(inc, am.year, am.month);
		var paid = r2(actualPaid[inc.name] || 0);
		var fair = r2(fairShares[inc.name]);
		var bal = r2(paid - fair);
		var bCol = bal > 0.005 ? 'var(--g)' : bal < -0.005 ? 'var(--r)' : 'var(--text3)';
		var bStr = (bal > 0.005 ? '+' : bal < -0.005 ? '−' : '±') + fmt(Math.abs(bal));
		var tr = document.createElement('tr');
		tr.innerHTML = '<td><strong style="font-family:var(--font)">' + esc(inc.name || '?') + '</strong></td><td style="color:var(--g)">' + fmt(pi) + '</td><td>' + fmt(fair) + '</td><td style="color:var(--r)">' + fmt(paid) + '</td><td style="color:' + bCol + ';font-weight:700">' + bStr + '</td>';
		tb2.appendChild(tr);
	});
	tbl.appendChild(tb2);
	var tf = document.createElement('tfoot');
	var unassStr = unassigned > 0.005 ? '<span style="color:var(--gold)">' + fmt(unassigned) + ' unset</span>' : '<span style="color:var(--g)">✓ all set</span>';
	tf.innerHTML = '<tr><td style="font-family:var(--font)">Total</td><td style="color:var(--g)">' + fmt(c.ti) + '</td><td>' + fmt(c.te) + '</td><td style="color:var(--r)">' + fmt(totalAssigned) + '</td><td>' + unassStr + '</td></tr>';
	tbl.appendChild(tf);
	tw.appendChild(tbl);
	body.appendChild(tw);
	var bals = {};
	S.incomes.forEach(function (inc) {
		bals[inc.name] = r2((actualPaid[inc.name] || 0) - fairShares[inc.name]);
	});
	var cred = [],
		deb = [];
	S.incomes.forEach(function (inc) {
		if (bals[inc.name] > 0.01) cred.push({
			person: inc.name,
			amount: bals[inc.name]
		});
		if (bals[inc.name] < -0.01) deb.push({
			person: inc.name,
			amount: -bals[inc.name]
		});
	});
	if (totalAssigned > 0) {
		var sb = document.createElement('div');
		sb.className = 'settle-box';
		var st = document.createElement('div');
		st.className = 'settle-title';
		if (cred.length && deb.length) {
			st.innerHTML = 'Settlements — ' + MF[am.month] + ' ' + am.year;
			sb.appendChild(st);
			var cr = cred.map(function (x) {
					return {
						person: x.person,
						amount: x.amount
					};
				}),
				dr = deb.map(function (x) {
					return {
						person: x.person,
						amount: x.amount
					};
				});
			var ci = 0,
				di = 0;
			while (ci < cr.length && di < dr.length) {
				var amt2 = r2(Math.min(cr[ci].amount, dr[di].amount));
				if (amt2 > 0.01) {
					var sr = document.createElement('div');
					sr.className = 'settle-row';
					sr.innerHTML = '<span><strong style="font-size:20px">' + esc(dr[di].person) + '</strong> <span style="color:var(--text3);font-size:20px">→</span> <strong style="font-size:20px">' + esc(cr[ci].person) + '</strong></span><span style="font-size:26px;font-weight:800;color:var(--gold);font-family:var(--mono);letter-spacing:-.04em">' + fmt(amt2) + '</span>';
					sb.appendChild(sr);
				}
				cr[ci].amount = r2(cr[ci].amount - amt2);
				dr[di].amount = r2(dr[di].amount - amt2);
				if (cr[ci].amount < 0.01) ci++;
				if (dr[di].amount < 0.01) di++;
			}
		} else {
			st.innerHTML = 'Settlements — ' + MF[am.month] + ' ' + am.year;
			sb.appendChild(st);
			var bm = document.createElement('div');
			bm.style.cssText = 'font-size:13px;color:var(--g);font-weight:600;position:relative';
			bm.textContent = 'All balanced ✓';
			sb.appendChild(bm);
		}
		body.appendChild(sb);
	}
	if (unassigned > 0.005) {
		var un = document.createElement('div');
		un.className = 'unassigned-note';
		un.innerHTML = '<span>⚠</span><span>' + fmt(unassigned) + ' has no "Paid by" set.</span>';
		body.appendChild(un);
	}
}

/* Tabs */
function renderTabs() {
	var tabs = document.getElementById('mtabs');
	tabs.innerHTML = '';
	var am = S.am;
	get12().forEach(function (mo) {
		var hm = S.expenses.some(function (e) {
			return e.freq === 'months' && e.selectedMonths && e.selectedMonths.indexOf(moKey(mo.year, mo.month)) >= 0;
		});
		var btn = document.createElement('button');
		btn.className = 'mtab';
		if (isCur(mo.year, mo.month)) btn.classList.add('cur');
		if (sameMo(mo, am)) btn.classList.add('act');
		btn.textContent = MN[mo.month] + ' ' + mo.year + (isCur(mo.year, mo.month) ? ' ★' : '') + (hm ? ' ·' : '');
		(function (mo) {
			btn.addEventListener('click', function () {
				S.am = {
					year: mo.year,
					month: mo.month
				};
				render();
			});
		})(mo);
		tabs.appendChild(btn);
	});
}

/* Detail */
function renderDetail(y, m, c) {
	var el = document.getElementById('mdetail');
	el.innerHTML = '';
	var info = document.createElement('div');
	info.style.cssText = 'font-size:11px;color:var(--text3);margin-bottom:12px;font-weight:500';
	info.textContent = MF[m] + ' ' + y + ' — ≈ ' + c.w.toFixed(2) + ' weeks · ' + fiscalYr();
	el.appendChild(info);
	if (S.incomes.length) {
		var h = document.createElement('div');
		h.className = 'dsec';
		h.textContent = 'Income';
		el.appendChild(h);
		S.incomes.forEach(function (inc) {
			var mo = incMo(inc, y, m);
			var r3 = document.createElement('div');
			r3.className = 'drow';
			r3.innerHTML = '<span style="font-weight:600">' + esc(inc.name || '—') + '<span class="tag tb">' + inc.freq + '</span></span><span style="color:var(--g);font-weight:700;font-family:var(--mono)">' + fmt(mo) + '</span>';
			el.appendChild(r3);
		});
		var t = document.createElement('div');
		t.className = 'dtot';
		t.innerHTML = '<span>Total income</span><span style="color:var(--g)">' + fmt(c.ti) + '</span>';
		el.appendChild(t);
	}
	if (S.expenses.length) {
		var h2 = document.createElement('div');
		h2.className = 'dsec';
		h2.textContent = 'Expenses';
		el.appendChild(h2);
		S.expenses.forEach(function (exp) {
			var mo = expMo(exp, y, m);
			var inactive = mo === 0 && exp.freq === 'months';
			var r3 = document.createElement('div');
			r3.className = 'drow' + (inactive ? ' dim' : '');
			var fl = exp.freq === 'months' ? (exp.selectedMonths ? exp.selectedMonths.length + ' months' : '0 months') : exp.freq;
			var pt = exp.paidBy === SPLIT_VALUE ? '<span class="tag ts">split</span>' : (exp.paidBy ? '<span class="tag tg">' + esc(exp.paidBy) + '</span>' : '');
			r3.innerHTML = '<span style="font-weight:500">' + esc(exp.name || '—') + '<span class="tag ' + (exp.freq === 'months' ? 'ta' : 'tb') + '">' + fl + '</span>' + pt + '</span><span style="color:var(--r);font-weight:700;font-family:var(--mono)">' + fmt(mo) + '</span>';
			el.appendChild(r3);
		});
		var t2 = document.createElement('div');
		t2.className = 'dtot';
		t2.innerHTML = '<span>Total expenses</span><span style="color:var(--r)">' + fmt(c.te) + '</span>';
		el.appendChild(t2);
	}
	var sc = c.sav < 0 ? 'var(--r)' : 'var(--g)';
	var sp3 = c.ti > 0 ? Math.round(c.sav / c.ti * 100) : 0;
	var box = document.createElement('div');
	box.className = 'net-box';
	box.innerHTML = '<div style="position:relative"><div class="net-lbl">Savings</div><div class="net-sub">' + (sp3 >= 0 ? '+' : '') + sp3 + '% of income · ≈ ' + c.w.toFixed(2) + ' weeks</div></div><div class="net-val" style="color:' + sc + '">' + (c.sav < 0 ? '−' : '+') + fmt(c.sav) + '</div>';
	el.appendChild(box);
}

var resizeT;
window.addEventListener('resize', function () {
	clearTimeout(resizeT);
	resizeT = setTimeout(renderChart, 150);
});

/* Boot */
document.addEventListener('DOMContentLoaded', function () {
	var loaded = load();
	ensureAM();
	applyTheme();
	initThumb('split-pill', 'split-thumb', S.split === 'prop' ? 'btn-prop' : 'btn-half');
	renderIncs();
	renderExps();
	renderGrocs();
	renderGrocSummary();
	render();
	if (!loaded) {
		addInc('Alice', 550, 'weekly');
		addInc('Bob', 480, 'weekly');
		addExp('Rent', 900, 'monthly');
		addExp('Food & groceries', 300, 'monthly');
	}
});
