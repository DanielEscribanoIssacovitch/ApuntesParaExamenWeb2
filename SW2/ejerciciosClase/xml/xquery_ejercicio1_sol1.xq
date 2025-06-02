for $b in doc("xquery_ejercicio1.xml")//book
order by xs:float($b/price) descending
return $b/title