## Coding style requirements

UNDEFINED/BUGGY BEHAVIOR WILL RESULT IF YOU DO NOT FOLLOW THESE RULES:

Static or Class members (properties attached to `@constructor` functions)
 - You MAY NOT hang an `@enum` object, object or array instance, or any primitive values off of a `@constructor` 
 function, either directly or using Object.assign to attach it, enums must be top-level scoped as standalone 
 CommonJS modules.
 - You MAY NOT hang a function off of a `@constructor` directly, but you may use Object.assign to attach one to 
 the `@constructor` function.

Data defined in Plain JS Objects
 - Keys MUST NOT have quoted property names - if you expect to reference the keys elsewhere in your code, Closure
 Compiler will not correctly unmangle the property name in your accessors.  So, if you have:
 
   var myData = { "dave": 123 };
   
   module.exports = myData;
   
 and try to access that property elsewhere in another module in your code, you have to access it as  
 `myData["dave"]` and not `myData.dave`.  You're better off with:
 
   var myData = { dave: 123 };
   
   module.exports = myData;
   
 where you can access your property as `myData.dave`.


## Common compiler error messages

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
