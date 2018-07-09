select cc.name, t.doc_id, t.twitter_text, ct.tone
from tweets t, ca_category cc, ca_term ct
where
t.doc_id = cc.doc_id
and t.doc_id = ct.doc_id
and twitter_crawler_group_name = 'Recommendation Finance'
and cc.kb_name = 'BusinessFinance'
union all
select cc.name, w.doc_id, 'Web text not saved' as text, ct.tone
from web w, ca_category cc, ca_term ct
where
w.doc_id = cc.doc_id
and w.doc_id = ct.doc_id
and web_crawler_group_name = 'Recommendation Finance'
/*and cc.kb_name = 'BusinessFinance'     kb didn't associate anything */
order by 1 asc, 2 asc, 3 asc, 4