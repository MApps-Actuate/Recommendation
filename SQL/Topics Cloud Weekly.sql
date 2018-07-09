SELECT * FROM (
	SELECT weeknum
	, topic
	, total
	, row_number() over (partition by weeknum order by sum(total) desc) as rank
	FROM (
		SELECT date_trunc('week', t.twitter_created_at) as weeknum  /* First date of week */
		, cc.name as topic
		, count(cc.doc_id) as total
		, row_number() over (partition by date_trunc('week', t.twitter_created_at) order by sum(cc.doc_id) desc) as rank
		FROM public.ca_category cc, public.ca_term ct, public.tweets t
		where
		ct.doc_id = t.doc_id
		and cc.doc_id = t.doc_id
		and t.twitter_lang = 'en'
		and t.twitter_crawler_group_name = 'Recommendation'
		and ct.cartridge = 'WealthManagement'
		/*and cc.kb_name = 'WealthManagementTopics'*/
		group by weeknum, cc.name
		union all
		SELECT date_trunc('week', w.web_created_at) as weeknum
		, cc.name as topic
		, count(cc.doc_id) as total
		, row_number() over (partition by date_trunc('week', w.web_created_at) order by sum(cc.doc_id) desc) as rank
		FROM public.ca_category cc, public.ca_term ct, public.web w
		where
		ct.doc_id = w.doc_id
		and cc.doc_id = w.doc_id
		and w.web_content_lang = 'en'
		and w.web_crawler_group_name = 'Recommendation'
		and ct.cartridge = 'WealthManagement'
		/*and cc.kb_name = 'WealthManagementTopics'*/
		and w.web_created_at >= '2018-01-01'::date
		group by weeknum, cc.name
		order by weeknum, rank asc
	) tmp
	group by weeknum, topic, total
	order by weeknum, rank
) tmp2
where rank <= 50