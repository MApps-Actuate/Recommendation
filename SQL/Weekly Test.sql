SELECT date_trunc('week', t.twitter_created_at) as weeknum  /* First date of week */
, cc.name as topic
, count(cc.doc_id) as total
, row_number() over (partition by date_trunc('week', t.twitter_created_at) order by sum(cc.doc_id) desc) as rank
FROM public.ca_category cc, public.ca_term ct, public.tweets t
where
ct.doc_id = t.doc_id
and cc.doc_id = t.doc_id
and t.twitter_crawler_group_name = 'Recommendation'
/*and ct.cartridge = 'WealthManagement'*/
and cc.kb_name = 'BusinessFinance'
group by weeknum, cc.name
		