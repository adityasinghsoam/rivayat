import test from "node:test";
import assert from "node:assert/strict";
import { sanitizeRichText } from "./sanitize-html";

test("strips script tags", () => {
  const output = sanitizeRichText('<p>Hello</p><script>alert("xss")</script>');
  assert.equal(output, "<p>Hello</p>");
});

test("removes event handler attributes", () => {
  const output = sanitizeRichText('<p onclick="alert(1)">Click</p><img src="x" onerror="alert(1)" />');
  assert.equal(output, "<p>Click</p>");
});

test("blocks javascript URLs in links", () => {
  const output = sanitizeRichText('<a href="javascript:alert(1)">Bad Link</a>');
  assert.equal(output, "Bad Link");
});

test("preserves safe formatting and hardens links", () => {
  const output = sanitizeRichText(
    '<h2>Title</h2><p><strong>Bold</strong> and <em>italic</em></p><ul><li>One</li></ul><pre><code>const x = 1;</code></pre><a href="https://example.com">Safe</a>',
  );

  assert.match(output, /<h2>Title<\/h2>/);
  assert.match(output, /<strong>Bold<\/strong>/);
  assert.match(output, /<em>italic<\/em>/);
  assert.match(output, /<ul><li>One<\/li><\/ul>/);
  assert.match(output, /<pre><code>const x = 1;<\/code><\/pre>/);
  assert.match(output, /<a href="https:\/\/example.com" target="_blank" rel="noopener noreferrer">Safe<\/a>/);
});

test("blocks encoded javascript payloads in href", () => {
  const output = sanitizeRichText('<a href="jav&#97;script:alert(1)">encoded</a>');
  assert.equal(output, "encoded");
});

test("blocks data URLs in links and images", () => {
  const output = sanitizeRichText('<a href="data:text/html;base64,PHNjcmlwdD4=">bad</a><img src="data:image/png;base64,AAAA" alt="x" />');
  assert.equal(output, "bad");
});

test("handles malformed nested html safely", () => {
  const output = sanitizeRichText('<p><strong>ok<script>alert(1)</script><em>nested');
  assert.equal(output, "<p><strong>ok<em>nested</em></strong></p>");
});

test("blocks image-based attacks and preserves safe image", () => {
  const output = sanitizeRichText(
    '<img src="javascript:alert(1)" onerror="alert(2)" alt="x"><img src="https://example.com/image.jpg" alt="cover" style="width:100%" />',
  );
  assert.equal(output, '<img src="https://example.com/image.jpg" alt="cover" />');
});

test("drops unsafe anchors and keeps safe mailto/http links", () => {
  const output = sanitizeRichText(
    '<a href="">empty</a><a href="mailto:test@example.com">mail</a><a href="https://example.com/path?q=1">web</a><a href="%6a%61%76%61%73%63%72%69%70%74:alert(1)">encoded2</a>',
  );

  assert.match(output, /^empty/);
  assert.match(output, /encoded2$/);
  assert.match(output, /<a href="mailto:test@example.com" target="_blank" rel="noopener noreferrer">mail<\/a>/);
  assert.match(output, /<a href="https:\/\/example.com\/path\?q=1" target="_blank" rel="noopener noreferrer">web<\/a>/);
});

test("preserves syntax highlighting classes on code only", () => {
  const output = sanitizeRichText(
    '<pre><code class="language-ts" onclick="alert(1)">const a = 1;</code></pre><code class="foo">bad</code>',
  );

  assert.equal(output, '<pre><code class="language-ts">const a = 1;</code></pre><code>bad</code>');
});
