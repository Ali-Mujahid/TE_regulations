#!/usr/bin/env Rscript
library(jsonlite)
base <- '/Users/mujahid357/Documents/Satb2_TE_regulation_article/Manuscript_work/ATAC_H3K27ac_TE_heatmap_review/20261113_user_revisions/results'
dest <- '/Users/mujahid357/Documents/Satb2_TE_regulation_article/Manuscript_work/TE_regulations_interactive/data/study.js'
read <- function(f) read.delim(file.path(base,f),check.names=FALSE,stringsAsFactors=FALSE)
rna <- read('RNA_1h_culture_cluster_values.tsv')
age <- read('TE_age15_counts_and_percent.tsv')
composition <- read('class_counts_scaled_y.tsv')
stopifnot(nrow(rna)==64L, nrow(age)==12L, all(table(rna$cluster,rna$genotype,rna$treatment)==4),all(age$n>=0), all(composition$n>=0))
result <- list(version='2026-11-13',rna=rna,age=age,composition=composition,
  data_note='Exploratory biological-culture summaries; ATAC/Hi-C maps are pooled. TE mismatch is not an absolute age. Replicate-aware tests are limited to the 1-hour paired RNA summaries.',
  sources=c('RNA_1h_culture_cluster_values.tsv','TE_age15_counts_and_percent.tsv','class_counts_scaled_y.tsv'))
writeLines(paste0('window.STUDY_DATA = ',toJSON(result,dataframe='rows',auto_unbox=TRUE,digits=12,na='null'),';'),dest,useBytes=TRUE)
cat('PASS: 64 RNA rows, four culture pairs per genotype per cluster, source categories exported.\n')
