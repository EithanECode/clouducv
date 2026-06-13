import urllib.request
html = urllib.request.urlopen('http://localhost:3000').read().decode('utf-8')
for line in html.splitlines():
    if '_next/static/css/app/layout.css' in line or '_next/static/chunks/app/page.js' in line:
        print(line)
