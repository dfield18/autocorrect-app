const neighbors = {
  a: ['q', 'w', 's', 'z'], b: ['v', 'g', 'h', 'n'], c: ['x', 'd', 'f', 'v'],
  d: ['s', 'e', 'r', 'f', 'x', 'c'], e: ['w', 's', 'd', 'r'], f: ['d', 'r', 't', 'g', 'c', 'v'],
  g: ['f', 't', 'y', 'h', 'v', 'b'], h: ['g', 'y', 'u', 'j', 'b', 'n'], i: ['u', 'j', 'k', 'o'],
  j: ['h', 'u', 'i', 'k', 'n', 'm'], k: ['j', 'i', 'o', 'l', 'm'], l: ['k', 'o', 'p'],
  m: ['n', 'j', 'k'], n: ['b', 'h', 'j', 'm'], o: ['i', 'k', 'l', 'p'], p: ['o', 'l'],
  q: ['w', 'a'], r: ['e', 'd', 'f', 't'], s: ['a', 'w', 'e', 'd', 'x', 'z'],
  t: ['r', 'f', 'g', 'y'], u: ['y', 'h', 'j', 'i'], v: ['c', 'f', 'g', 'b'],
  w: ['q', 'a', 's', 'e'], x: ['z', 's', 'd', 'c'], y: ['t', 'g', 'h', 'u'],
  z: ['a', 's', 'x']
};

function keyboardDistance(w1, w2) {
  let cost = 0;
  for (let i = 0; i < Math.max(w1.length, w2.length); i++) {
    const c1 = w1[i] || '', c2 = w2[i] || '';
    if (c1 === c2) continue;
    cost += neighbors[c1]?.includes(c2) ? 0.5 : 1;
  }
  return cost;
}

let tokenizer, model;

(async () => {
  tokenizer = await window.transformers.AutoTokenizer.from_pretrained('Xenova/bert-base-uncased');
  model = await window.transformers.AutoModelForMaskedLM.from_pretrained('Xenova/bert-base-uncased');
})();

async function correct() {
  const inputText = document.getElementById("textInput").value;
  const masked = inputText.replace("goin", "[MASK]");
  const output = await model(masked, { topk: 10 });

  const candidates = ["going", "coin", "gone", "gown", "join"];
  const scores = candidates.map(w => {
    const prob = output.find(o => o.token_str === w)?.score || 1e-9;
    const dist = keyboardDistance("goin", w);
    return { w, score: Math.log(prob) - dist };
  });

  scores.sort((a, b) => b.score - a.score);
  document.getElementById("result").innerHTML = `Prediction: <strong>${scores[0].w}</strong>`;
}
