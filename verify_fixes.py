import json, os

with open('/tmp/fixes_en.json', encoding='utf-8') as f:
    fixes = json.load(f)

base = '/tmp/gh-fix'
bad = []
for i, fx in enumerate(fixes):
    path = os.path.join(base, fx['file'])
    if not os.path.exists(path):
        bad.append((i, fx['file'], 'MISSING FILE'))
        continue
    with open(path, encoding='utf-8') as f:
        content = f.read()
    count = content.count(fx['old'])
    if count != 1:
        bad.append((i, fx['file'], f'count={count}'))

print(f"Total fixes: {len(fixes)}")
print(f"Bad: {len(bad)}")
for b in bad:
    print(b)
