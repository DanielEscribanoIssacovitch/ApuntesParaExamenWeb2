<authors>{
for $a in distinct-values(doc("xquery_ejercicio1.xml")//author)
return <author>
 <name>{$a}</name>
 <count>
 {count(doc("xquery_ejercicio1.xml")//book[author =$a]) }
 </count>
 </author>
}
</authors>