const fs = require('fs');
const path = 'frontend/app/pages/admin/payments.vue';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  'const formatPrice = (n: number) => `฿${n.toLocaleString("th-TH")}`',
  'const formatPrice = (n: number) => `${n.toLocaleString("th-TH")}`'
);

fs.writeFileSync(path, content);
console.log('Removed Baht symbol from admin payments table');
