select to_char(t.twitter_created_at, 'yyyy-mm-dd'), count(t.doc_id) total
from tweets t
group by 1
order by 1 desc, 2 desc

select to_char(w.web_created_at, 'yyyy-mm-dd'), count(w.doc_id) total
from web w
group by 1
order by 1 desc, 2 desc