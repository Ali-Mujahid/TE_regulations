#!/usr/bin/env Rscript
library(data.table);library(jsonlite)
scriptarg <- grep('^--file=',commandArgs(trailingOnly=FALSE),value=TRUE)
stopifnot(length(scriptarg)==1L)
root <- normalizePath(file.path(dirname(sub('^--file=','',scriptarg)), '..'))
rebuilt <- tempfile('te-loci-reassembled-'); dir.create(rebuilt); status <- system2('node',c(shQuote(file.path(root,'scripts/reassemble_data.js')),shQuote(rebuilt))); stopifnot(status == 0L)
data <- file.path(rebuilt,'condition_specific_loops.tsv.gz')
links <- file.path(root,'data/downloads/selected_region_TE_copy_links_divergence.tsv.gz')
source <- file.path(rebuilt,'loci')
loops <- fread(data); te <- fread(links); stopifnot(nrow(loops)==37274L,all(loops$sample%in%c('flx.NBQX','flx.BIC','cKO.NBQX','cKO.BIC')))
samples <- c('flx.NBQX','flx.BIC','cKO.NBQX','cKO.BIC'); labs <- c('Flx BIC','Flx NBQX','cKO BIC','cKO NBQX')
id <- function(x) do.call(paste,c(x,sep=':'))
for(gene in c('Klf6','Fndc9','Rgs4','Rasl11b','Btg2','Ascl1')) {
  raw <- readLines(file.path(source,paste0(gene,'.js')),warn=FALSE)
  stopifnot(length(raw)==1L,startsWith(raw,'window.LOCI_DATA.push('),endsWith(raw,');'))
  d <- fromJSON(substr(raw,nchar('window.LOCI_DATA.push(')+1L,nchar(raw)-2L),simplifyVector=FALSE)
  for(i in 1:4){
    x <- loops[sample==samples[i] & paste0('chr',chr1)==d$chrom & chr1==chr2 & start1>=d$start & end2<=d$end]
    obs <- d$loops[[i]]; expected<-sort(id(as.data.frame(x[,.(start1,end1,start2,end2)])))
    actual<-if(length(obs)) sort(vapply(obs,function(z)paste(z$start1,z$end1,z$start2,z$end2,sep=':'),'')) else character()
    stopifnot(identical(expected,actual))
  }
  for(i in 1:4){
    x <- unique(te[cluster==paste(labs[i],'only') & chrom==d$chrom & start0<d$end & end0>d$start,.(start0,end0,feature,subfamily,te_class)])
    expected<-sort(id(as.data.frame(x))); obs<-d$te_tracks[[i]]$copies
    actual<-if(length(obs)) sort(vapply(obs,function(z)paste(z$start,z$end,z$id,z$subfamily,z$class,sep=':'),'')) else character()
    stopifnot(identical(expected,actual))
  }
  cat('PASS sample-specific loops and four TE sets:',gene,'\n')
}

unlink(rebuilt,recursive=TRUE)
