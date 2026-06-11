import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mesrznsahcxtpgsvmcqa.supabase.co';
const supabaseAnonKey = 'sb_publishable_t3vr5ytwouctfymggQbMuQ_TTg6uoRK';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testQuery() {
  const { data } = await supabase.from('SCD_Report_Sales_Data').select('*').limit(1);
  console.log(data);
}

testQuery();
