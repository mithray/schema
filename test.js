const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const dom = new JSDOM(``, {
  url: "https://example.org/",
  referrer: "https://example.com/",
  contentType: "text/html",
  includeNodeLocations: true,
  storageQuota: 10000000
});

console.log(dom.serialize())
