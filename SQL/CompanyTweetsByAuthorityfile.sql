select t.doc_id, t.twitter_text, ct.main_term_value, ct.tone
from tweets t, ca_term ct
where
t.doc_id = ct.doc_id
and twitter_crawler_group_name = 'Recommendation Finance'
and ct.cartridge = 'WealthManagement'
order by 1 asc, 2 asc, 3