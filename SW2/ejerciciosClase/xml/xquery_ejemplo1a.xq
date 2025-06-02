for $x in doc("xquery_ejemplo1.xml")/bookstore/book
where $x/price>30
order by $x/title
return $x/title