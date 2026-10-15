import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('scratch/old_QuestionnaireForm.jsx', 'r', encoding='utf-8') as f:
    old = f.read()

start_marker = 'const generateRandomData = () => {'
end_marker = 'return data;\n  };'
if old.find(end_marker) == -1:
    end_marker = 'return data;\r\n  };'
if old.find(end_marker) == -1:
    end_marker = 'return data;'

i1 = old.find(start_marker)
i2 = old.find(end_marker, i1)
if i2 != -1:
    # find the matching closing brace
    close_brace = old.find('};', i2)
    rand_func_only = old[i1:close_brace+2]
    print(f"Extracted generateRandomData: {len(rand_func_only)} characters")
    print(rand_func_only[:300])
    print("...")
    print(rand_func_only[-200:])
    with open('scratch/rand_func_clean.js', 'w', encoding='utf-8') as f:
        f.write(rand_func_only)
else:
    print("Could not find end marker for generateRandomData")
