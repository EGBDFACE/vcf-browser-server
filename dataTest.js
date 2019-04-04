const fs = require('fs');

const geno = JSON.parse(fs.readFileSync('./geno_name_id_des_pos.txt'));
const transcript = JSON.parse(fs.readFileSync('./transcript_name_id_pos_proteinID.txt'));

console.log(geno);
console.log(transcript);
console.log(geno.ENSG00000007923);
console.log(transcript.ENST00000294401);
