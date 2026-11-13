# TE Regulation Explorer

A buildless, static interactive viewer for the four ATAC + H3K27ac + TE region groups from the SATB2 cortical-culture study. It displays selected genomic loci and compact derived data; it does not contain raw BAM, `.hic`, `.cool` or bigWig files.

## Run locally

From this directory run `ruby -run -e httpd . -p 8765` and visit `http://127.0.0.1:8765/`. The site also works as ordinary static files, making it suitable for a GitHub Pages source after the repository owner chooses to enable Pages. No CDN, login, server-side computation or network request is required to use the existing visualizations. No deployment has been performed by this package itself.

## Optional GitHub Pages setup

After committing the contents of this folder to the root of the chosen repository branch, a repository administrator can open **Settings → Pages**, select **Deploy from a branch** under **Build and deployment**, choose that branch and **/(root)**, and save. Check the repository's Actions and Pages settings for deployment status and the resulting address before sharing it. If these files are placed in a subfolder instead, this root-source setup will not put the viewer at the site root. The included `.nojekyll` file serves the static bundle without a Jekyll build. See [GitHub's publishing-source instructions](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site).

Publishing makes the viewer and bundled derived data available to visitors. No GitHub Pages site has been enabled or verified by this local package.

## What it does

- Browse six independently validated 5 kb KR Hi-C locus matrices for **Klf6, Fndc9, Rgs4, Rasl11b, Btg2 and Ascl1**. Select a sample or compare all four maps with one shared per-locus color cap. Each condition shows its **own** supplied loop set; circles and arcs describe coordinates, not inferred TE-mediated interactions.
- Toggle/recolor original ATAC and H3K27ac coverage and pooled floxed-reference H3K4me3/H3K27me3 tracks; toggle and recolor each of the four named TE-cluster copy tracks. Filter TE copy labels, change matrix color, contrast and visible contact distance; hover over matrix cells for coordinates and values; download a PNG. True zeros and invalid entries remain distinct.
- Review 1-hour paired-culture RNA summaries with a paired exact Wilcoxon test and BH adjustment across the fixed eight group/genotype comparisons. Change group, genotype and color, and download an SVG.
- Compare within-cluster TE main-class counts or relative proportions and young/old divergence bins; export an SVG. Save and restore local display preferences. Available full-loop, TE-link, RNA-summary and divergence-summary tables are downloadable from **Data & methods**.

The matrix/coverage display is a **six-selected-locus** viewer, not an exhaustive genome browser. These loci were selected on the same data and are not an unbiased estimate of differential signal. ATAC and Hi-C maps are pooled; their pixels, loops or regions are not biological replicates. Do not use them to infer differential significance. H3K4me3/H3K27me3 are floxed-only pooled references repeated across display samples, not cKO measurements. The reserved opposite-pattern TE set and H3K9me3 are not included. TE mismatch is a relative age proxy, not a calibrated insertion date.

The four condition-specific loop files have 5 kb BED-like coordinates; the source coordinate convention and FDR provenance have not been independently verified. Their sample-specific status is kept exactly as supplied. A TE-copy annotation may be linked to several specific peak-call groups; links do not prove the TE mediates the loop. Dataset source and checks are documented in the study workspace under `IEG_browser_review/cluster_locus_tracks/four_cluster_viz/README.md`, `ATAC_H3K27ac_TE_heatmap_review/cluster_hic/condition_specific_loops/README.md` and `ATAC_H3K27ac_TE_heatmap_review/20261113_user_revisions/README.md`.

## Rebuild and verify

The prepared `data/loci/*.js` and `data/study.js` are text wrappers around the validated source datasets. They intentionally require no server at runtime. The first two build scripts reference the original local study workspace; adjust those paths if relocating the source inputs. The three tests run on bundled data from any location.

```sh
Rscript scripts/build_study.R
node scripts/build_loci.js
node --check app.js
node scripts/test_bundle.js
node scripts/test_stats.js
Rscript scripts/test_loci.R
```

`test_bundle.js` independently checks the self-contained bundle, matrix geometry, sample order, allowed marks, four TE/loop sets and download checksums. `test_stats.js` checks all eight paired Wilcoxon W/p/BH-q results against the bundled audited table. `test_loci.R` compares each condition's visible loops and all four displayed TE sets for every locus against the bundled full 37,274-row sample-specific loop table and the complete region–TE link table. The independent upstream gate 8888907 additionally checked source 5 kb raw/KR matrices, all track bins, sample loop/TE input and full/crop equality. A public repository will make its committed code and derived data publicly accessible; repository visibility must be chosen by its owner.

## Downloaded data checksums (SHA-256)

| File | SHA-256 |
|---|---|
| `condition_specific_loops.tsv.gz` | `67abc22f48e10e68608742675581e583f395129fb306d1fdbf3270600a929d95` |
| `selected_region_TE_copy_links_divergence.tsv.gz` | `455b51ec7ae0b8804778381491d25848ed40495a5f1fa5df6b4b28070eeb3af5` |
| `RNA_1h_culture_cluster_values.tsv` | `263d91ffd8a8ef585640976b4a38ccc6a03721782835c7968fa9425ac8d1174f` |
| `RNA_1h_paired_wilcoxon_tests.tsv` | `dfe7fd6a65728b3c70c66a527240a9c06207d2be9d2f96ed0ef6597467eb14d2` |
| `TE_age15_counts_and_percent.tsv` | `c7c6ca7855a598c0ac694d480f54f50e156132b4be458ca6a58bf83d26d0dcb3` |

## Reconstructing connector-sized data files

To keep repository objects practical while preserving the original values exactly, each large locus JavaScript file is split into ordered `data/loci/<gene>.partNN.js` scripts. The page assembles the six locus objects in memory before rendering. The condition-loop gzip archive is stored as base64 scripts in `data/downloads/condition_specific_loops.partNN.js`; its download link reconstructs the original gzip byte-for-byte in the browser. No external service is contacted. For offline verification or reuse, run:

```sh
node scripts/reassemble_data.js /path/to/output
```

The helper checks SHA-256 checksums against `data/chunk_manifest.json` and writes the original locus scripts and loop archive to that output directory. The verification scripts reconstruct these files into a temporary directory automatically. The original local research workspace retains its unchanged unchunked sources.
