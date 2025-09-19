---
id: MTW997
type: spec
---

# Test files

Test file contents should be stored as separate test resource files, instead of inline strings. This means that test setup can be accomplished by simply copying the before-file.

If files are being modified, then the assertion should be an exact match against the string read in from the after-file. A direct filesystem comparison to the after-file is possible too, although this may result in worse diffs for the test.
