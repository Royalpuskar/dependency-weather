
function obj(v){if(!v||typeof v!=='object'||Array.isArray(v))throw Error('Expected an object');return v;}
function arr(v,label='array'){if(!Array.isArray(v)||v.length>500)throw Error(label+' must be an array with at most 500 items');return v;}
function str(v){if(typeof v!=='string'||!v.trim()||v.length>100000)throw Error('Expected nonempty text (max 100000 characters)');return v;}
function num(v,label='number',min=-1e12){if(typeof v!=='number'||!Number.isFinite(v)||v<min||Math.abs(v)>1e12)throw Error(label+' must be a finite number in range');return v;}
function bool(v){if(typeof v!=='boolean')throw Error('Expected a boolean');return v;}
function date(v){if(typeof v!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(v))throw Error('Expected YYYY-MM-DD');const t=Date.parse(v+'T00:00:00Z');if(!Number.isFinite(t)||new Date(t).toISOString().slice(0,10)!==v)throw Error('Invalid calendar date');return t;}
export function run(x){obj(x);if(JSON.stringify(x).length>200000)throw Error('Input exceeds 200 KB limit');

const rows=arr(x.packages,'packages').map(p=>{str(p.name);const signals=[];if(p.ageDays==null)signals.push('release age unknown');else{num(p.ageDays,'age',0);if(p.ageDays>365)signals.push('release older than 365 days');}if(p.vulnerabilities==null)signals.push('vulnerability data unknown');else{num(p.vulnerabilities,'vulnerabilities',0);if(p.vulnerabilities>0)signals.push('reported vulnerabilities: '+p.vulnerabilities);}if(!p.license)signals.push('license unknown');return {name:p.name,releaseAge:p.ageDays??'unknown',license:p.license||'unknown',vulnerabilities:p.vulnerabilities??'unknown',signals:signals.join('; ')||'no configured signals'};});return {metrics:{packages:rows.length,withSignals:rows.filter(r=>r.signals!=='no configured signals').length},rows};

}
