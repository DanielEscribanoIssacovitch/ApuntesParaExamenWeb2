<!DOCTYPE html>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
<xsl:template match="/">

<html>
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <title>World countries population</title>
  <style type="text/css">
    .hidden{
      display: none;
    }
  </style>
</head>
<body>
  <label for="country">Choose a country:</label>
  <select name="country" id="countries">
    <xsl:for-each select="(for $d in distinct-values(/Root/data/record/field[@name='Country or Area']) return /Root/data/record[field=$d][1])">
      <option>
        <xsl:attribute name="value">
          <xsl:value-of select="field[1]/@key" />
        </xsl:attribute>
        <xsl:value-of select="field[1]" />
      </option>
    </xsl:for-each>
  </select>
  <xsl:for-each select="(for $d in distinct-values(/Root/data/record/field[@name='Country or Area']) return /Root/data/record[field=$d][1])">
    <xsl:variable name="countryAlias" select="field[1]/@key"/>
    <xsl:variable name="countryName" select="field[1]"/>
    <div class="hidden">
      <xsl:attribute name="id">
        <xsl:value-of select="$countryAlias" />
      </xsl:attribute>
    <h2><xsl:value-of select="$countryName"/></h2>
    <table>
      <tr><th>Year</th><th>Population</th></tr>
      <xsl:for-each select="/Root/data/record[field=$countryName]">
        <tr><td><xsl:value-of select="field[3]" /></td><td><xsl:value-of select="field[4]" /></td></tr>
      </xsl:for-each>
    </table>
  </div>
  </xsl:for-each>
  <script type="text/javascript">
    window.addEventListener('load', function(event) {
      let select = document.getElementById("countries");
      let selectData = select.value;
      toggleClass(selectData);
      select.addEventListener('change', function(event) {
        toggleClass(selectData);
        selectData = select.value;
        toggleClass(selectData);
      });
    });

    function toggleClass(id){
      let elem = document.getElementById(id);
      elem.classList.toggle("hidden");
    }
  </script>
</body>
</html>
</xsl:template>
</xsl:stylesheet>