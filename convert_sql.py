#!/usr/bin/env python3
"""
Convert MySQL SQL dump to PostgreSQL compatible format
"""

# Read the file
with open('meair-postgres-final.sql', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace double single quotes with single quotes for PostgreSQL
# In MySQL, '' is used to escape a single quote
# In PostgreSQL, we also use '' but the issue is with how the data is formatted
content = content.replace("''", "'")

# Write the corrected file
with open('meair-postgres-final-fixed.sql', 'w', encoding='utf-8') as f:
    f.write(content)

print('File converted successfully')
print('Output: meair-postgres-final-fixed.sql')

