select * from ca_category cc, ca_term ct, tweets t
where cc.doc_id = t.doc_id
and t.twitter_crawler_group_name = 'Recommendation'
and cc.kb_name = 'BusinessFinance'
