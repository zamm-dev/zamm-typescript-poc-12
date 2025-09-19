# Test cases for organizing all files

This test should be run inside a temp test directory with a Git repo already initialized. The temp directory should be initialized with all of the "before" test resource files from [`organize-single-file.md`](./organize-single-file.md), and the test should check that all the files in that temp directory match the "after" test resource files.

> [!NOTE]
> To control for randomness, we should allow for injection of an ID provider. During testing, the mock ID provider should be initialized with all the file IDs in order of processing. The code should ensure that all files are processed in the same exact order every time to ensure that the mock ID provider returns the correct ID for each file. Do not rely on the underlying filesystem to return the files to you in a consistent order; sort the files yourself after you retrieve them.
>
> If the tests are erroring out because the wrong IDs are being assigned to the wrong files, then change the order of the IDs passed to the ID provider. So long as your files are processed in the same order every time, this should match the correct ID to the correct file.
