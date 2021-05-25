<script>
  import evalNumExpr from "../src/index.ts";
  $: expr = "";
  $: value = expr
    ? (function (expr) {
        try {
          return `${evalNumExpr(expr)}`;
        } catch (e) {
          return e.message;
        }
      })(expr)
    : "";
</script>
<style>
  .outline-none {
    outline: none !important;
  }
  .block {
    display: block;
  }
  .flex {
    display: flex;
  }
  .flex-1 {
    flex: 1;
  }
  .w-full {
    width: 100%;
  }
  .p-4 {
    padding: 1rem;
  }
  .pr-4 {
    padding-right: 1rem;
  }
  .text-lg {
    font-size: 1.25rem;
  }
  .max-w-sm {
    max-width: 756px;
  }
  .mx-auto {
    margin-left: auto;
    margin-right: auto;
  }
  .rounded-lg {
    border-radius: 1rem;
  }
  .border {
    border: 2px solid black;
  }
</style>

<div class="max-w-sm mx-auto">
  <div class="p-4">
    <h1>Evaluate Numeric Expressions (Playground)</h1>
    <a href="https://github.com/craftsys/eval-num-expr">GitHub</a>
    <mark>v APP_VERSION</mark>
  </div>
  <div class="p-4">
    <div class="flex">
      <div class="flex-1 pr-4">
        <label for="string">Expressions</label>
        <input
          id="string"
          type="text"
          class="block w-full p-4 text-lg outline-none rounded-lg border"
          bind:value="{expr}"
          placeholder="1 + 10 x 1000 / 20"
        />
      </div>
    </div>
    <h2>Value: {value}</h2>
  </div>
</div>
