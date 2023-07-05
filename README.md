A Visual Studio Code extension，Replace some characters in a **"string literals"** with **variables/expressions** and return a **"template string"**

![demo1](./assets/demo1.gif)

# Example

Sometimes, we need to optimize code that involves protected strings. For example, extracting a certain word from a string and replacing it with a constant, while converting the string to a template string (enclosed in backticks).

```ts
const getUserInfo = 'myServiceName/user/info';
const getUserCompanyInfo = 'myServiceName/user/companInfo';
```

I need to extract the `myServiceName` mentioned in the above code and encapsulate it as a constant.

I need to quickly convert it to the following code:

The usual approach is to search for the keyword `myServiceName` and replace it with `${MY_SERVICE}`, while also converting the string quotes from double quotes to backticks. This series of operations can be quite cumbersome.

```ts
const getUserInfo = `${MY_SERVICE}/user/info`;
const getUserCompanyInfo = `${MY_SERVICE}/user/companInfo`;
```

Enter "template-string-replace" to the stage.

Press "**Ctrl+Shift+P**," enter the plugin name: "**template-string-replace**," and press Enter. Then, enter the word you want to replace, such as "myServiceName," and press Enter. Next, enter the word you want to use for replacement and press Enter. The operation is now complete.