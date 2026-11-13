// Create connector-sized scripts while retaining exact original data bytes.
// Run in a clean copy of the original local project before upload.
const fs=require('fs'), path=require('path'), crypto=require('crypto');
const root=path.resolve(__dirname,'..'), genes=['Klf6','Fndc9','Rgs4','Rasl11b','Btg2','Ascl1'];
const hash=x=>crypto.createHash('sha256').update(x).digest('hex');
const split=(text,size)=>Array.from({length:Math.ceil(text.length/size)},(_,i)=>text.slice(i*size,(i+1)*size));
let index=fs.readFileSync(path.join(root,'index.html'),'utf8'), manifest={loci:{},archive:{}};
for(const gene of genes){
  const rel=`data/loci/${gene}.js`, filename=path.join(root,rel), text=fs.readFileSync(filename,'utf8');
  const prefix='window.LOCI_DATA.push(', suffix=');\n';
  if(!text.startsWith(prefix)||!text.endsWith(suffix))throw Error('Unexpected locus wrapper '+gene);
  const json=text.slice(prefix.length,-suffix.length), parts=split(json,570000), lines=[];
  JSON.parse(json); manifest.loci[gene]={original_sha256:hash(text),json_sha256:hash(json),chunks:parts.length};
  for(let i=0;i<parts.length;i++){
    const target=`data/loci/${gene}.part${String(i).padStart(2,'0')}.js`;
    const script=`window.__TE_LOCUS_PARTS=window.__TE_LOCUS_PARTS||{};(window.__TE_LOCUS_PARTS[${JSON.stringify(gene)}]=window.__TE_LOCUS_PARTS[${JSON.stringify(gene)}]||[]).push(${JSON.stringify(parts[i])});`+(i===parts.length-1?`window.LOCI_DATA.push(JSON.parse(window.__TE_LOCUS_PARTS[${JSON.stringify(gene)}].join('')));delete window.__TE_LOCUS_PARTS[${JSON.stringify(gene)}];`:'')+'\n';
    fs.writeFileSync(path.join(root,target),script);lines.push(`<script src="${target}"></script>`);
  }
  const tag=`<script src="${rel}"></script>`;if(!index.includes(tag))throw Error('Missing tag '+tag);index=index.replace(tag,lines.join(''));fs.unlinkSync(filename);
}
const archive='condition_specific_loops.tsv.gz', name=path.join(root,'data/downloads',archive), bytes=fs.readFileSync(name), n=Math.ceil(bytes.length/420000), lines=[];
manifest.archive={name:archive,bytes:bytes.length,sha256:hash(bytes),chunks:n};
for(let i=0;i<n;i++){
  const target=`data/downloads/condition_specific_loops.part${String(i).padStart(2,'0')}.js`, b64=bytes.subarray(i*420000,(i+1)*420000).toString('base64');
  fs.writeFileSync(path.join(root,target),`window.__TE_ARCHIVE_PARTS=window.__TE_ARCHIVE_PARTS||[];window.__TE_ARCHIVE_PARTS.push(${JSON.stringify(b64)});\n`);lines.push(`<script src="${target}"></script>`);
}
fs.unlinkSync(name);
const download='data/downloads/condition_specific_loops.tsv.gz';
if(!index.includes('href="'+download+'"'))throw Error('Missing download link');
index=index.replace('href="'+download+'"','href="#" id="downloadAllLoops"');
index=index.replace('<script src="app.js"></script>',lines.join('')+'<script src="data/downloads/reassemble_download.js"></script><script src="app.js"></script>');
fs.writeFileSync(path.join(root,'data/downloads/reassemble_download.js'),`document.getElementById('downloadAllLoops').addEventListener('click',function(e){e.preventDefault();const parts=window.__TE_ARCHIVE_PARTS.map(s=>{let b=atob(s),a=new Uint8Array(b.length);for(let i=0;i<b.length;i++)a[i]=b.charCodeAt(i);return a});const u=URL.createObjectURL(new Blob(parts,{type:'application/gzip'})),a=document.createElement('a');a.href=u;a.download='condition_specific_loops.tsv.gz';a.click();setTimeout(()=>URL.revokeObjectURL(u),1000)});\n`);
fs.writeFileSync(path.join(root,'index.html'),index);fs.writeFileSync(path.join(root,'data/chunk_manifest.json'),JSON.stringify(manifest,null,2)+'\n');
console.log(JSON.stringify(manifest,null,2));
