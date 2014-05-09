<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0">
<xsl:output method="html" indent="yes" doctype-system="http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd" doctype-public="-//W3C//DTD XHTML 1.0 Strict//EN" />
<xsl:template match="/">
<html lang="en-GB">
<head>
<title>Testing</title>
</head>
<body>
<xsl:value-of select="/content/*/*/*" />
</body>
</html>
</xsl:template>
</xsl:stylesheet>
