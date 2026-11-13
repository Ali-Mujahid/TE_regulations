const fs=require('fs'),vm=require('vm'),path=require('path'),assert=require('assert');
const dir=path.resolve(__dirname,'..');
const sandbox={window:{},localStorage:{getItem(){return null}},console};
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(path.join(dir,'data/study.js'),'utf8'),sandbox);
vm.runInContext(fs.readFileSync(path.join(dir,'app.js'),'utf8'),sandbox);
let actual=sandbox.window.SATB2_TESTS.allTests();
const src=path.join(dir,'data/downloads/RNA_1h_paired_wilcoxon_tests.tsv');
let lines=fs.readFileSync(src,'utf8').trim().split('\n');
// Labels in this TSV span physical lines; only the first 9 pre-label fields are needed.
let parsed=lines.slice(1).filter(x=>/^(Flx|cKO) (BIC|NBQX) only\t/.test(x)).map(x=>x.split('\t'));
assert.strictEqual(actual.length,8);assert.strictEqual(parsed.length,8);
for(const a of actual){let r=parsed.find(x=>x[0]===a.cl&&x[1]===a.gt);assert(r,`${a.cl} ${a.gt}`);assert(Math.abs(a.w-Number(r[5]))<1e-9);assert(Math.abs(a.p-Number(r[6]))<1e-9);assert(Math.abs(a.q-Number(r[7]))<1e-9);assert.strictEqual(a.pairs.length,4)}
assert.strictEqual(sandbox.window.SATB2_TESTS.signedRank([0,0]).p,1);
console.log('PASS: all eight paired Wilcoxon W, exact p and BH q values match independently audited TSV; 4 matched cultures each.');
