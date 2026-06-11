import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mesrznsahcxtpgsvmcqa.supabase.co';
const supabaseAnonKey = 'sb_publishable_t3vr5ytwouctfymggQbMuQ_TTg6uoRK';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function deletePrograms() {
  console.log("Deleting programs from SCD_Report_Programs...");
  
  const { data: kaliumData, error: kaliumErr } = await supabase
    .from('SCD_Report_Programs')
    .delete()
    .ilike('Program', '%kalium%');
    
  if (kaliumErr) console.error("Error deleting kalium:", kaliumErr);
  else console.log("Deleted Kalium Humat", kaliumData);

  const { data: kehatiData, error: kehatiErr } = await supabase
    .from('SCD_Report_Programs')
    .delete()
    .ilike('Program', '%kehati%');
    
  if (kehatiErr) console.error("Error deleting kehati:", kehatiErr);
  else console.log("Deleted Taman Kehati", kehatiData);

  // also clean from SCD_Report_Sales_Data just in case there are sales under that name
  await supabase.from('SCD_Report_Sales_Data').delete().ilike('Program', '%kalium%');
  await supabase.from('SCD_Report_Sales_Data').delete().ilike('Program', '%kehati%');
  await supabase.from('SCD_Report_Monthly_Progress').delete().ilike('Program', '%kalium%');
  await supabase.from('SCD_Report_Monthly_Progress').delete().ilike('Program', '%kehati%');

  console.log("Cleanup complete!");
}

deletePrograms();
