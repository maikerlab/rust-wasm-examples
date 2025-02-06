import init, {Miner, MiningResult} from "./pkg/miner.js";

async function sha256(input) {
    const encoder = new TextEncoder();
    const data = encoder.encode(input);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(hashBuffer))
        .map(b => b.toString(16).padStart(2, "0"))
        .join("");
}

function getDuration(startAt, endAt) {
    return (endAt - startAt).toFixed(1);
}

async function jsMine() {
    const {data, difficulty} = getInputData();
    let nonce = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
    let iterations = 1;
    const startAt = performance.now();
    while (true) {
        const input = data + nonce;
        const hash = await sha256(input);

        // Check if hash meets difficulty criteria (starts with N leading zeros)
        if (hash.startsWith("0".repeat(difficulty))) {
            const endAt = performance.now();
            setResult({nonce, hash, iterations}, getDuration(startAt, endAt))
            return;
        }
        nonce++;
        iterations++;
    }
}

/*async function wasmMineAsync() {
    const {data, difficulty} = getInputData();
    const miner = new Miner(data, difficulty);
    const startAt = performance.now();
    miner.mine().then((result) => {
        const endAt = performance.now();
        const {nonce, hash, iterations} = result;
        const duration = (endAt - startAt).toFixed(1);
        document.getElementById("status").textContent = "Hash found!";
        document.getElementById("result").innerHTML = `
            <p><strong>Nonce: </strong>${nonce}</p>
            <p><strong>Hash: </strong>${hash}</p>
            <p><strong>Iterations: </strong>${iterations}</p>
            <p><strong>Duration: </strong>${duration} ms</p>
        `;
    }).catch((err) => console.error("WASM mining failed:", err));
}*/

function getInputData() {
    const data = document.getElementById("data").value || "test";
    const difficulty = document.getElementById("difficulty").value || 3;
    return {data, difficulty}
}

function setResult(result, duration) {
    const {nonce, hash, iterations} = result;
    document.getElementById("status").textContent = "Block was found!";
    document.getElementById("result").innerHTML = `
        <p><strong>Nonce:</strong> ${nonce}</p>
        <p><strong>Hash:</strong> ${hash}</p>
        <p><strong>Iterations:</strong> ${iterations}</p>
        <p><strong>Duration:</strong> ${duration} ms</p>
    `;
}

function wasmMine() {
    const {data, difficulty} = getInputData();
    const miner = new Miner(data, difficulty);

    document.getElementById("status").textContent = "Mining...";
    document.getElementById("result").textContent = "";
    console.log("start mining...");
    const startAt = performance.now();
    const result = miner.mine();
    const endAt = performance.now();
    const duration = (endAt - startAt).toFixed(1);
    setResult(result, duration);
}

async function run() {
    await init();
    //await initThreadPool(navigator.hardwareConcurrency);

    setTimeout(async () => {
        wasmMine();
        //jsMine();
    }, 100);
}

//await run();

document.getElementById("mine-button").addEventListener("click", run);
