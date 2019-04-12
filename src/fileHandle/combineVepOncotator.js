const knowledgeMap = require('../knowledgeMap/get_knowledge_map.js');

const genoData = knowledgeMap.geno_name_id_des_pos;
const transcriptData = knowledgeMap.transcript_name_id_pos_proteinID;
const SoData = knowledgeMap.SO_term_description_impact;

export default function combineVepOncotator(vepData,oncotatorData){
  let combineData = [];
  for(let i=0;i<vepData.length;i++){
    let itemVep = vepData[i];
	combineData[i] = {
	  EnsemblID : itemVep.id,
	  Location : {
	    start : itemVep.start,
		end : itemVep.end,
		chrom : itemVep.seq_region_name
		},
	  Codon: {
	    Allele : itemVep.allele_string.slice(0,itemVep.allele_string.indexOf('/')),
		Reference : itemVep.allele_string.slice(itemVep.allele_string.indexOf('/')+1)
	    }
	};
	if(itemVep.transcript_consequences){
	  combineData[i].transcriptConsequences = []
	  for(let j=0;j<itemVep.transcript_consequences.length;j++){
	    combineData[i].transcriptConsequences[j] = {};
		let consequenceTerms = itemVep.transcript_consequences[j].consequence_terms;
		if(consequenceTerms){
		  combineData[i].transcriptConsequences[j].consequenceType = [];
		  for(let k=0;k<consequencesTerms.length;k++){
		    combineData[i].transcriptConsequences[j].consequenceType[k] = {
			  Terms : consequencesTerms[k],
			  SODescription : SoData[consequencesTerms[k]] ? SoData[consequencesTerms[k]].description : '',
			  Impact : SoData[consequencesTerms[k]] ? SoData[consequencesTerms[k]].impact : ''
			  };
		  }
		}
		let consequences = itemVep.transcript_consequences[j];
		let geneID = consequences.gene_id;
		let transciptID = consequences.transcript_id;
		combineData[i].transcriptConsequences[j].MutantGene = {
		  ID : geneID,
		  Location : {
		    start : genoData[geneID] ? genoData[geneID].geno_start : '',
			end : genoData[geneID] ? genoData[geneID].geno_end : ''
			},
		  Description : genoData[geneID] ? genoData[geneID].geno_description : ''
		  };
		combineData[i].transcriptConsequences[j].Transcript = {
		  ID : transcriptID,
		  Location : {
		    start : transcriptData[transcriptID] ? transcriptData[transcriptID].transcript_start : '',
			end : transcriptData[transcriptID] ? transcriptData[transcriptID].transcript_end : ''
			},
		  Name : transcriptData[transcriptID] ? transcriptData[transcriptID].transcript_name : ''
		  };
		combineData[i].transcriptConsequences[j].Protein = {
		  ID :transcriptData[transcriptId] ? transcriptData[transcriptID].protein.id : '',
		  Position : {
		    start : consequences.protein_start ? consequences.protein_start : ( transcriptData[transcriptID] ? transcriptData[transcriptID].protein_start : '' ),
			end : consequences.protein_end ? consequences.protein_end : ( transcriptData[transcriptID] ? transcriptData[transcriptID].protein_end : '' )
			}
		  };
		combineData[i].transcriptConsequences[j].5UTR = {
		  cDNAPosition : (consequences.consequences_terms.indexOf('5_prime_UTR_variant') != -1) ? {
			start : consequences.cdna_start ? consequences.cdna_start : '',
			end : consequences.cdna_end ? consequences.cdna_end : ''
			} : null 
		  };
		combineData[i].transcriptConsequences[j].3UTR = {
		  cDNAPosition : (consequences.consequences_terms.indexOf('3_prime_UTR_variant') != -1) ? {
		    start : consequences.cdna_start ? consequences.cdna_start : '',
			end : consequences.cdna_end ? consequences.cdna_end : ''
			} : null
		  };
	    combineData[i].transcriptConsequences[j].Exon = {
		  CDSPosition : {
		    start : consequences.cds_start ? consequences.cds_start : '',
			end : consequences.cds_end ? consequences.cds_end : ''
			}
		  };
		combineData[i].transcriptConsequences[j].AminoAcids = consequences.amino_acids ? consequences.amino_acids : '';
		}
	}
	let itemOncotator = oncotatorData[itemVep.id];
    combineData[i].PredictorScore = itemOncotator ? {
	  metalr : {
	    score : itemOncotator.dbNSFP_LR_score,
		rankscore : itemOncotator.dbNSFP_LR_rankscore,
		interpretation : itemOncotator.dbNSFP_LR_pred
		},
	  metasvm : {
	    score : itemOncotator.dbNSFP_RadialSVM_score,
		rankscore : itemOncotator.dbNSFP_RadialSVM_rankscore,
		interpretation : itemOncotator.dbNSFP_RadialSVM_pred
		}
	} : null ;
 }
 return combineData;
}
