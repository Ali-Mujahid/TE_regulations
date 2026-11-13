// Rebuild original large data assets from the connector-sized published chunks.
// Usage: node scripts/reassemble_data.js /path/to/temporary/output
const fs=require('fs'),path=require('path'),vm=require('vm'),crypto=require('crypto');
const root=path.resolve(__dirname,'..'),out=process.argv[2];if(!out)throw Error('output directory required');
const manifest=JSON.parse(fs.readFileSync(path.join(root,'data/chunk_manifest.json'))),hash=b=>crypto.createHash('sha256').update(b).digest('hex');
fs.mkdirSync(path.join(out,'loci'),{recursive:true});
for(const [gene,info] of Object.entries(manifest.loci)){
  let raw;const ctx={window:{LOCI_DATA:[]},JSON:{parse:(s)=>{raw=s;return JSON.parse(s)}}};vm.createContext(ctx);
  for(let i=0;i<info.chunks;i++)vm.runInContext(fs.readFileSync(path.join(root,`data/loci/${gene}.part${String(i).padStart(2,'0')}.js`),'utf8'),ctx);
  if(hash(raw)!==info.json_sha256)throw Error('locus JSON checksum '+gene);
  const original=`window.LOCI_DATA.push(${raw});\n`;if(hash(original)!==info.original_sha256)throw Error('locus original checksum '+gene);
  fs.writeFileSync(path.join(out,'loci',gene+'.js'),original);
}
const ctx={window:{}};vm.createContext(ctx);for(let i=0;i<manifest.archive.chunks;i++)vm.runInContext(fs.readFileSync(path.join(root,`data/downloads/condition_specific_loops.part${String(i).padStart(2,'0')}.js`),'utf8'),ctx);
const archive=Buffer.concat(ctx.window.__TE_ARCHIVE_PARTS.map(s=>Buffer.from(s,'base64')));if(hash(archive)!==manifest.archive.sha256||archive.length!==manifest.archive.bytes)throw Error('archive checksum');
fs.writeFileSync(path.join(out,manifest.archive.name),archive);
