SELECT * FROM (
	SELECT weeknum
	, keyword
	, total
	, row_number() over (partition by weeknum order by sum(total) desc) as rank
	FROM (
		SELECT date_trunc('week', t.twitter_created_at) as weeknum  /* First date of week */
		, co.name as keyword
		, count(cc.doc_id) as total
		, row_number() over (partition by date_trunc('week', t.twitter_created_at) order by sum(cc.doc_id) desc) as rank
		FROM public.ca_category cc, public.ca_term ct, public.tweets t, public.ca_concept co
		where
		ct.doc_id = t.doc_id
		and cc.doc_id = t.doc_id
		and co.doc_id = t.doc_id
		and t.twitter_crawler_group_name = 'Recommendation Finance'
		and ct.cartridge = 'WealthManagement'
		group by weeknum, co.name
		union all
		SELECT date_trunc('week', w.web_created_at) as weeknum
		, co.name as keyword
		, count(cc.doc_id) as total
		, row_number() over (partition by date_trunc('week', w.web_created_at) order by sum(cc.doc_id) desc) as rank
		FROM public.ca_category cc, public.ca_term ct, public.web w, public.ca_concept co
		where
		ct.doc_id = w.doc_id
		and cc.doc_id = w.doc_id
		and co.doc_id = w.doc_id
		and w.web_crawler_group_name = 'Recommendation Finance'
		and ct.cartridge = 'WealthManagement'
		group by weeknum, co.name
		order by weeknum, rank asc
	) tmp
	group by weeknum, keyword, total
	order by weeknum, rank
) tmp2
where rank <= 50