select main_term_value, count(main_term_value)
from ca_term
where cartridge = 'WealthManagement'
group by main_term_value
order by 2 desc
