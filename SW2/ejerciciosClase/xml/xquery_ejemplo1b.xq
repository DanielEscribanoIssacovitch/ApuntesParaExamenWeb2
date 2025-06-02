<ul>
{
for $x in doc("xquery_ejemplo1.xml")/bookstore/book/title
order by $x
return <li>{data($x)}</li>
}
</ul>