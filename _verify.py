import json
fixes = json.load(open('/tmp/gh-fix/_fixes.json', encoding='utf-8'))
for fx in fixes:
    path = '/tmp/gh-fix/' + fx['file']
    s = open(path, encoding='utf-8').read()
    c = s.count(fx['old'])
    if c != 1:
        print("BAD", c, fx['file'], fx['old'][:50])
print("done", len(fixes))
