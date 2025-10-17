import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

export async function GET() {
  const supabase = getSupabaseAdmin();
  
  const { data, error } = await supabase
    .from('posts')
    .select('id, platform, status, scheduled_time, qstash_message_id, adapted_content')
    .eq('status', 'scheduled')
    .order('created_at', { ascending: false })
    .limit(10);
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  if (!data || data.length === 0) {
    const { data: all } = await supabase.from('posts').select('status').limit(50);
    const stats: Record<string, number> = {};
    all?.forEach(p => stats[p.status] = (stats[p.status] || 0) + 1);
    
    return NextResponse.json({ 
      scheduled: 0,
      message: 'NO SCHEDULED POSTS FOUND',
      allPostsStats: stats
    });
  }
  
  const now = new Date();
  const analysis = data.map(p => {
    const schedTime = new Date(p.scheduled_time);
    const diffMin = Math.round((schedTime.getTime() - now.getTime()) / 60000);
    
    return {
      id: p.id.substring(0, 8),
      platform: p.platform,
      scheduled_time: p.scheduled_time,
      time_status: schedTime < now ? 'PAST' : 'FUTURE',
      time_diff_minutes: diffMin,
      has_qstash_id: !!p.qstash_message_id,
      qstash_id_preview: p.qstash_message_id?.substring(0, 16),
      content_preview: p.adapted_content.substring(0, 50)
    };
  });
  
  const summary = {
    total: data.length,
    with_qstash_ids: analysis.filter(p => p.has_qstash_id).length,
    in_future: analysis.filter(p => p.time_status === 'FUTURE').length,
    in_past: analysis.filter(p => p.time_status === 'PAST').length
  };
  
  return NextResponse.json({ posts: analysis, summary });
}
