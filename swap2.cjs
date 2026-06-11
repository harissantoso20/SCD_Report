const fs = require('fs');
let content = fs.readFileSync('patch_itik.js', 'utf8');

const products = ['mentah', 'asin_mentah', 'asin_matang'];

products.forEach(p => {
  const volKey = p + '_vol';
  const omzetKey = p + '_omzet';

  const barRegex = new RegExp(`<div className="flex-1 w-full min-h-0 relative mb-4">[\\s\\S]*?dataKey="${volKey}"[\\s\\S]*?</ResponsiveContainer>\\s*</div>`);
  const lineRegex = new RegExp(`<div className="flex-1 w-full min-h-0 relative border-t border-slate-50 pt-4">[\\s\\S]*?dataKey="${omzetKey}"[\\s\\S]*?</ResponsiveContainer>\\s*</div>`);

  const barMatch = content.match(barRegex);
  const lineMatch = content.match(lineRegex);

  if (barMatch && lineMatch) {
    let barBlock = barMatch[0];
    let lineBlock = lineMatch[0];

    // Swap classes
    barBlock = barBlock.replace('className="flex-1 w-full min-h-0 relative mb-4"', 'className="flex-1 w-full min-h-0 relative border-t border-slate-50 pt-4"');
    lineBlock = lineBlock.replace('className="flex-1 w-full min-h-0 relative border-t border-slate-50 pt-4"', 'className="flex-1 w-full min-h-0 relative mb-4"');

    content = content.replace(barMatch[0], '%%%LINE_BLOCK%%%');
    content = content.replace(lineMatch[0], '%%%BAR_BLOCK%%%');
    
    content = content.replace('%%%LINE_BLOCK%%%', lineBlock);
    content = content.replace('%%%BAR_BLOCK%%%', barBlock);
  }
});

// Fix comments if they exist
content = content.replace('{/* Top Chart: Volume Bar */}', '{/* Top Chart: Omzet Line */}');
content = content.replace('{/* Bottom Chart: Omzet Line */}', '{/* Bottom Chart: Volume Bar */}');

fs.writeFileSync('src/components/dashboard/ItikAnalytics.jsx', content);
console.log('Fixed completely!');
