const fs = require('fs');
let content = fs.readFileSync('src/components/dashboard/ItikAnalytics.jsx', 'utf8');

const products = ['mentah', 'asin_mentah', 'asin_matang'];

products.forEach(p => {
  const volKey = p + '_vol';
  const omzetKey = p + '_omzet';

  const reBar = new RegExp(`<div className="flex-1 w-full min-h-0 relative[\\s\\S]*?dataKey="${volKey}"[\\s\\S]*?</ResponsiveContainer>\\s*</div>`);
  const reLine = new RegExp(`<div className="flex-1 w-full min-h-0 relative[\\s\\S]*?dataKey="${omzetKey}"[\\s\\S]*?</ResponsiveContainer>\\s*</div>`);

  const barMatch = content.match(reBar);
  const lineMatch = content.match(reLine);

  if (barMatch && lineMatch) {
    let barCode = barMatch[0];
    let lineCode = lineMatch[0];

    barCode = barCode.replace('className="flex-1 w-full min-h-0 relative mb-4"', 'className="flex-1 w-full min-h-0 relative border-t border-slate-50 pt-4"');
    lineCode = lineCode.replace('className="flex-1 w-full min-h-0 relative border-t border-slate-50 pt-4"', 'className="flex-1 w-full min-h-0 relative mb-4"');

    content = content.replace(barMatch[0], '%%%LINE_PLACEHOLDER%%%');
    content = content.replace(lineMatch[0], '%%%BAR_PLACEHOLDER%%%');
    
    content = content.replace('%%%LINE_PLACEHOLDER%%%', lineCode);
    content = content.replace('%%%BAR_PLACEHOLDER%%%', barCode);
  }
});

// Fix the comments that were swapped or mismatched
content = content.replace('{/* Top Chart: Volume Bar */}', '{/* Top Chart: Omzet Line */}');
content = content.replace('{/* Bottom Chart: Omzet Line */}', '{/* Bottom Chart: Volume Bar */}');

fs.writeFileSync('src/components/dashboard/ItikAnalytics.jsx', content);
console.log('Swapped completely!');
