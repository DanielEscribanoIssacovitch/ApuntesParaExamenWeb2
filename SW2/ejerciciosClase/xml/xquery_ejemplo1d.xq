for $x at $i in doc("xquery_ejemplo1.xml")/bookstore/book/title
return <book>{$i}. {data($x)}</book>