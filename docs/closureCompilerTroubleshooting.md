## Common error messages

If you see errors like 

```
dev/kidcompy/lib/kidcompy/tools/lowbar.js:122: ERROR - Failed to load module "../../../node_modules/lodash-compat/collection/reduce"
  reduce: require("../../../node_modules/lodash-compat/collection/reduce")
          ^
```

CC's indicating that your `require` statement is trying to access a file that closure compiler doesn't know about.
You need to add that file/folder to the sources list fed to the Closure Compiler command line.  See gulp task
`kidcompy-cc-config` to see how we form globs to add source files to Closure Compiler's list.

---

end
