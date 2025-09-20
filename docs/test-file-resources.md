---
id: MTW997
type: spec
---

# Test files

Test file contents should be stored as separate test resource files, instead of inline strings. This means that test setup can be accomplished by simply copying the before-file.

If files are being modified, then the assertion should be an exact match against the string read in from the after-file. A direct filesystem comparison to the after-file is possible too, although this may result in worse diffs for the test.

## Directories

If the file comes with a specific path, then replicate that path in the test resource folder so that the entire folder can simply be copied over into the temp test directory. For example, if there's supposed to be `A.py` and `sub-folder/B.py` files for a "Python environment" test, put both of those in the right directory structure as `test-resources/python-env/A.py` and `test-resources/python-env/sub-folder/B.py` instead of a flat `test-resources/python-env/A.py` and `test-resources/python-env/B.py` structure.
