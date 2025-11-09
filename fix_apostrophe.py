#!/usr/bin/env python3
"""
Fix PostgreSQL apostrophe escaping in SQL file.
Changes Dep\'t to Dep''t (PostgreSQL format)
"""

import sys

def fix_sql_file(filename):
    """Fix apostrophe escaping in SQL file"""
    try:
        # Read the file
        with open(filename, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Count occurrences before fix
        before_count = content.count("Dep\\'t")
        print(f"Found {before_count} occurrences of Dep\\'t")
        
        # Replace backslash-escaped apostrophe with double single quote
        fixed_content = content.replace("Dep\\'t", "Dep''t")
        
        # Count occurrences after fix
        after_count = fixed_content.count("Dep''t")
        print(f"Replaced with {after_count} occurrences of Dep''t")
        
        # Write the fixed content back
        with open(filename, 'w', encoding='utf-8') as f:
            f.write(fixed_content)
        
        print(f"✓ Successfully fixed {filename}")
        return True
        
    except Exception as e:
        print(f"✗ Error: {e}")
        return False

if __name__ == "__main__":
    filename = "meair-postgres.sql"
    if len(sys.argv) > 1:
        filename = sys.argv[1]
    
    success = fix_sql_file(filename)
    sys.exit(0 if success else 1)

