const fs = require('fs');

const SO_term_description_impact = {
transcript_ablation: {term: "transcript_ablation", description: "A feature ablation whereby the deleted region includes a transcript feature", impact: "HIGH"},
splice_acceptor_variant: {term: "splice_acceptor_variant", description: "A splice variant that changes the 2 base region at the 3' end of an intron", impact: "HIGH"},
splice_donor_variant: {term: "splice_donor_variant", description: "A splice variant that changes the 2 base region at the 5' end of an intron", impact: "HIGH"},
stop_gained: {term: "stop_gained", description: "A sequence variant whereby at least one base of a codon is changed, resulting in a premature stop codon, leading to a shortened transcript", impact: "HIGH"},
frameshift_variant: {term: "frameshift_variant", description: "A sequence variant which causes a disruption of the translational reading frame, because the number of nucleotides inserted or deleted is not a multiple of three", impact: "HIGH"},
stop_lost: {term: "stop_lost", description: "A sequence variant where at least one base of the terminator codon (stop) is changed, resulting in an elongated transcript", impact: "HIGH"},
start_lost: {term: "start_lost", description: "A codon variant that changes at least one base of the canonical start codon", impact: "HIGH"},
transcript_amplification: {term: "transcript_amplification", description: "A feature amplification of a region containing a transcript", impact: "HIGH"},
inframe_insertion: {term: "inframe_insertion", description: "An inframe non synonymous variant that inserts bases into in the coding sequence", impact: "MODERATE"},
inframe_deletion: {term: "inframe_deletion", description: "An inframe non synonymous variant that deletes bases from the coding sequence", impact: "MODERATE"},
missense_variant: {term: "missense_variant", description: "A sequence variant, that changes one or more bases…o acid sequence but where the length is preserved", impact: "MODERATE"},
protein_altering_variant: {term: "protein_altering_variant", description: "A sequence_variant which is predicted to change the protein encoded in the coding sequence", impact: "MODERATE"},
splice_region_variant: {term: "splice_region_variant", description: "A sequence variant in which a change has occurred within the region of the splice site, either within 1-3 bases of the exon or 3-8 bases of the intron", impact: "LOW"},
incomplete_terminal_codon_variant: {term: "incomplete_terminal_codon_variant", description: "A sequence variant where at least one base of the final codon of an incompletely annotated transcript is changed", impact: "LOW"},
start_retained_variant: {term: "start_retained_variant", description: "A sequence variant where at least one base in the start codon is changed, but the start remains", impact: "LOW"},
stop_retained_variant: {term: "stop_retained_variant", description: "A sequence variant where at least one base in the terminator codon is changed, but the terminator remains", impact: "LOW"},
synonymous_variant: {term: "synonymous_variant", description: "A sequence variant where there is no resulting change to the encoded amino acid", impact: "LOW"},
coding_sequence_variant: {term: "coding_sequence_variant", description: "A sequence variant that changes the coding sequence", impact: "MODIFIER"},
mature_miRNA_variant: {term: "mature_miRNA_variant", description: "A transcript variant located with the sequence of the mature miRNA", impact: "MODIFIER"},
_5_prime_UTR_variant: {term: "5_prime_UTR_variant", description: "A UTR variant of the 5' UTR", impact: "MODIFIER"},
_3_prime_UTR_variant: {term: "3_prime_UTR_variant", description: "A UTR variant of the 3' UTR", impact: "MODIFIER"},
non_coding_transcript_exon_variant: {term: "non_coding_transcript_exon_variant", description: "A sequence variant that changes non-coding exon sequence in a non-coding transcript", impact: "MODIFIER"},
intron_variant: {term: "intron_variant", description: "A transcript variant occurring within an intron", impact: "MODIFIER"},
NMD_transcript_variant: {term: "NMD_transcript_variant", description: "A variant in a transcript that is the target of NMD", impact: "MODIFIER"},
non_coding_transcript_variant: {term: "non_coding_transcript_variant", description: "A transcript variant of a non coding RNA gene", impact: "MODIFIER"},
upstream_gene_variant: {term: "upstream_gene_variant", description: "A sequence variant located 5' of a gene", impact: "MODIFIER"},
downstream_gene_variant: {term: "downstream_gene_variant", description: "A sequence variant located 3' of a gene", impact: "MODIFIER"},
TFBS_ablation: {term: "TFBS_ablation", description: "A feature ablation whereby the deleted region includes a transcription factor binding site", impact: "MODIFIER"},
TFBS_amplification: {term: "TFBS_amplification", description: "A feature amplification of a region containing a transcription factor binding site", impact: "MODIFIER"},
TF_binding_site_variant: {term: "TF_binding_site_variant", description: "A sequence variant located within a transcription factor binding site", impact: "MODIFIER"},
regulatory_region_ablation: {term: "regulatory_region_ablation", description: "A feature ablation whereby the deleted region includes a regulatory region", impact: "MODERATE"},
regulatory_region_amplification: {term: "regulatory_region_amplification", description: "A feature amplification of a region containing a regulatory region", impact: "MODIFIER"},
feature_elongation: {term: "feature_elongation", description: "A sequence variant that causes the extension of a genomic feature, with regard to the reference sequence", impact: "MODIFIER"},
regulatory_region_variant: {term: "regulatory_region_variant", description: "A sequence variant located within a regulatory region", impact: "MODIFIER"},
feature_truncation: {term: "feature_truncation", description: "A sequence variant that causes the reduction of a …ic feature, with regard to the reference sequence", impact: "MODIFIER"},
intergenic_variant: {term: "intergenic_variant", description: "A sequence variant located in the intergenic region, between genes", impact: "MODIFIER"}
};
console.log(SO_term_description_impact['intergenic_variant']);
const geno_name_id_des_pos = JSON.parse(fs.readFileSync('./geno_name_id_des_pos.txt'));
console.log(geno_name_id_des_pos);
const transcript_name_id_pos_proteinID = JSON.parse(fs.readFileSync('./transcript_name_id_pos_proteinID.txt'));
console.log(transcript_name_id_pos_proteinID);
