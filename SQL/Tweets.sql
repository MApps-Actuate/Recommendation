select * from tweets t
where t.twitter_crawler_group_name = 'Recommendation'
and t.twitter_created_at >= '2018-06-11'::date
